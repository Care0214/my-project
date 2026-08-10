'use strict';

/**
 * 云函数：AI 识图（上线版）
 *
 * 作用：
 *  - 前端把图片压缩后转 base64 传进来，云函数调用千问多模态接口完成识别，
 *    返回统一结构 { category, name, confidence, tags }；
 *  - API Key 只存在云函数环境变量中，不会随小程序包分发。
 *
 * 部署步骤（HBuilderX）：
 *  1. 右键 uniCloud-aliyun → 关联云服务空间（首次需注册并开通阿里云/腾讯云空间）；
 *  2. 在云服务空间控制台为 ai-recognize 配置环境变量：
 *       DASHSCOPE_API_KEY=你的Key
 *       VISION_MODEL=qwen3.7-plus
 *  3. 右键 ai-recognize → 上传部署；
 *  4. 前端通过 uniCloud.callFunction({ name: 'ai-recognize', data: { imageBase64 } }) 调用。
 */

const https = require('https');

const API_KEY = process.env.DASHSCOPE_API_KEY || '';
const MODEL = process.env.VISION_MODEL || 'qwen3.7-plus';
const BASE_URL = process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

const CATEGORY_KEYS = ['book', 'digital', 'daily', 'sports', 'fashion', 'other'];

const PROMPT = [
	'请识别这张校园二手物品照片，只返回 JSON，不要输出任何其他文字：',
	'{"category":"book|digital|daily|sports|fashion|other","name":"简短分类名","confidence":0到1的小数,"tags":["标签1","标签2","标签3"]}',
	'分类定义：book=教材书籍，digital=数码电子，daily=生活用品，sports=运动户外，fashion=服饰箱包，other=其他',
].join('\n');

function callVision(imageDataUrl) {
	return new Promise((resolve, reject) => {
		const payload = JSON.stringify({
			model: MODEL,
			stream: false,
			max_tokens: 200,
			messages: [{
				role: 'user',
				content: [
					{ type: 'image_url', image_url: { url: imageDataUrl } },
					{ type: 'text', text: PROMPT },
				],
			}],
		});
		const url = new URL(BASE_URL.replace(/\/?$/, '/') + 'chat/completions');
		const req = https.request(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + API_KEY,
				'Content-Length': Buffer.byteLength(payload),
			},
		}, (res) => {
			let body = '';
			res.on('data', (c) => body += c);
			res.on('end', () => {
				if (res.statusCode >= 400) return reject(new Error('API ' + res.statusCode + ': ' + body.slice(0, 200)));
				try {
					resolve(JSON.parse(body).choices[0].message.content);
				} catch (e) {
					reject(new Error('解析响应失败'));
				}
			});
		});
		req.setTimeout(30000, () => req.destroy(new Error('timeout')));
		req.on('error', reject);
		req.write(payload);
		req.end();
	});
}

function parseResult(content) {
	const text = String(content || '').trim();
	const start = text.indexOf('{');
	const end = text.lastIndexOf('}');
	if (start < 0 || end <= start) return null;
	try {
		const obj = JSON.parse(text.slice(start, end + 1));
		return {
			category: CATEGORY_KEYS.indexOf(obj.category) > -1 ? obj.category : 'other',
			name: obj.name || '其他',
			confidence: Math.min(1, Math.max(0, Number(obj.confidence) || 0.7)),
			tags: Array.isArray(obj.tags) ? obj.tags.slice(0, 5) : [],
		};
	} catch (e) {
		return null;
	}
}

exports.main = async (event = {}) => {
	const { imageBase64, imageMime = 'image/jpeg', imageUrl = '' } = event;
	const dataUrl = imageUrl
		? imageUrl
		: `data:${imageMime};base64,${imageBase64 || ''}`;

	if (!imageUrl && !imageBase64) {
		return { code: -1, msg: '缺少图片数据 imageBase64 / imageUrl' };
	}
	if (!API_KEY) {
		return { code: -1, msg: '云函数未配置 DASHSCOPE_API_KEY 环境变量' };
	}

	try {
		const content = await callVision(dataUrl);
		const result = parseResult(content);
		if (!result) return { code: -1, msg: '识别结果解析失败' };
		return { code: 0, data: result };
	} catch (e) {
		return { code: -1, msg: '识别失败: ' + e.message };
	}
};
