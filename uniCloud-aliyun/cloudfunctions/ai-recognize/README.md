# ai-recognize 云函数

把"真实 AI 识图"从演示版（前端直连，Key 暴露）升级为上线版（Key 放服务端）。

## 为什么需要它

- 前端直连方案（`utils/ai-vision.js`）的 API Key 会随小程序包分发，仅适合比赛演示；
- 云函数方案 Key 只存在于服务端环境变量，任何用户都能使用，且无需配置 request 合法域名。

## 部署步骤（HBuilderX）

1. 右键 `uniCloud-aliyun` 目录 → 关联云服务空间（没有空间就先创建，阿里云/腾讯云均可）；
2. 在云服务空间控制台给 `ai-recognize` 配置环境变量：
   - `DASHSCOPE_API_KEY`：你的阿里云百炼 Key
   - `VISION_MODEL`：`qwen3.7-plus`（或其他支持图片的模型）
3. 右键 `ai-recognize` 云函数 → 上传部署；
4. 前端调用方式：

```js
const fileContent = await uni.getFileSystemManager().readFile({
  filePath: tempImagePath,
  encoding: 'base64',
});
const res = await uniCloud.callFunction({
  name: 'ai-recognize',
  data: { imageBase64: fileContent.data, imageMime: 'image/jpeg' },
});
// res.result = { code: 0, data: { category, name, confidence, tags } }
```

## 接口约定

- 入参：`imageBase64`（必填）或 `imageUrl`，可选 `imageMime`
- 出参：`{ code: 0, data: { category, name, confidence, tags } }`
- `category` 取值为 `book | digital | daily | sports | fashion | other`，与前端分类 key 一致

## 说明

- 云函数本身无第三方依赖，Node 内置 https 模块即可；
- 超时、限流可在云函数配置中调整（建议超时 30s、内存 256MB）；
- 上线后把 `utils/ai-vision.js` 里的 `AI_CONFIG.enabled` 置为 `false`，或改为调用云函数。
