/**
 * 真实 AI 识图模块（演示版）
 *
 * 说明：
 *  - 开启后，发布页/估价页优先调用千问多模态接口做真实识别；
 *  - 任何一步失败（无网络、超时、解析失败、未配置 Key）都会返回 null，
 *    调用方自动回退到 mock 识别，保证小程序始终可用；
 *  - 注意：演示用 Key 写在前端，会随小程序包分发。
 *    正式上线请把 Key 移到服务端/云函数（见 uniCloud-aliyun/cloudfunctions/ai-recognize），
 *    并把 AI_CONFIG.enabled 设为 false 或改为请求自己的服务。
 */

const AI_CONFIG = {
	// 是否优先使用真实 AI 识别（失败自动回退 mock）
	enabled: true,
	// 阿里云百炼 API Key —— 演示用，正式发布前务必移除或替换
	apiKey: 'sk-ws-H.EEMMYRH.1hZG.MEUCIQDHeDJ-ifGFIfacqhZKnLEDf2mATxfHQoDAirVm77AptAIgXT-kivwimi04DTQlphPwwyS8bwUHGjwlQoiA1II2Wl8',
	// 模型名（实测可读图）
	model: 'qwen3.7-plus',
	// OpenAI 兼容接口地址；部署云函数后可改为自己的服务地址
	baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
};

const CATEGORY_KEYS = ['book', 'digital', 'daily', 'sports', 'fashion', 'other'];

const RECOGNIZE_PROMPT = [
	'请识别这张校园二手物品照片，只返回 JSON，不要输出任何其他文字：',
	'{"category":"book|digital|daily|sports|fashion|other","name":"简短分类名","confidence":0到1的小数,"tags":["标签1","标签2","标签3"]}',
	'分类定义：book=教材书籍，digital=数码电子，daily=生活用品，sports=运动户外，fashion=服饰箱包，other=其他',
].join('\n');

/**
 * 识别本地图片
 * @param {string} imagePath 本地临时图片路径
 * @returns {Promise<{category:string,name:string,confidence:number,tags:string[]}|null>}
 */
function recognizeImage(imagePath) {
	return new Promise((resolve) => {
		if (!AI_CONFIG.enabled || !AI_CONFIG.apiKey || AI_CONFIG.apiKey.indexOf('sk-') !== 0) {
			resolve(null);
			return;
		}
		readImageBase64(imagePath)
			.then(({ base64, mime }) => {
				uni.request({
					url: AI_CONFIG.baseUrl + '/chat/completions',
					method: 'POST',
					timeout: 30000,
					header: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer ' + AI_CONFIG.apiKey,
					},
					data: {
						model: AI_CONFIG.model,
						stream: false,
						max_tokens: 200,
						messages: [{
							role: 'user',
							content: [
								{ type: 'image_url', image_url: { url: 'data:' + mime + ';base64,' + base64 } },
								{ type: 'text', text: RECOGNIZE_PROMPT },
							],
						}],
					},
					success(res) {
						let content = '';
						try {
							content = res.data.choices[0].message.content;
						} catch (e) { /* ignore */ }
						resolve(parseResult(content));
					},
					fail() {
						resolve(null);
					},
				});
			})
			.catch(() => resolve(null));
	});
}

/** 压缩并读取图片为 base64 */
function readImageBase64(imagePath) {
	return new Promise((resolve, reject) => {
		const finish = (p) => {
			try {
				const fs = uni.getFileSystemManager();
				const base64 = fs.readFileSync(p, 'base64');
				const mime = /\.png$/i.test(p) ? 'image/png' : 'image/jpeg';
				resolve({ base64, mime });
			} catch (e) {
				reject(e);
			}
		};
		if (typeof uni.compressImage === 'function') {
			uni.compressImage({
				src: imagePath,
				quality: 70,
				success: (res) => finish(res.tempFilePath || imagePath),
				fail: () => finish(imagePath),
			});
		} else {
			finish(imagePath);
		}
	});
}

/** 从模型返回文本中提取 JSON 结果 */
function parseResult(content) {
	const text = String(content || '').trim();
	if (!text) return null;
	const start = text.indexOf('{');
	const end = text.lastIndexOf('}');
	if (start < 0 || end <= start) return null;
	try {
		const obj = JSON.parse(text.slice(start, end + 1));
		const category = CATEGORY_KEYS.indexOf(obj.category) > -1 ? obj.category : 'other';
		return {
			category,
			name: obj.name || '其他',
			confidence: Math.min(1, Math.max(0, Number(obj.confidence) || 0.7)),
			tags: Array.isArray(obj.tags) ? obj.tags.slice(0, 5) : [],
		};
	} catch (e) {
		return null;
	}
}

export { recognizeImage, AI_CONFIG };
