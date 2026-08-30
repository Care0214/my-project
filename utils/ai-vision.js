/**
 * AI 识图模块
 *
 * 说明：
 *  - 前端只调用 uniCloud 云函数，不保存或传递模型 API Key；
 *  - 云函数未部署、超时或解析失败时抛出可诊断错误，由页面提示用户手动确认；
 *  - 模型 Key 只配置在 uniCloud 云函数环境变量中。
 */

const AI_CONFIG = {
	// 是否启用云函数识别
	enabled: true,
	cloudFunctionName: 'ai-recognize',
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
	if (!AI_CONFIG.enabled) {
		return Promise.reject(new Error('AI识别功能已关闭'));
	}
	if (typeof uniCloud === 'undefined' || !uniCloud.callFunction) {
		return Promise.reject(new Error('当前运行包未加载 uniCloud，请重新关联服务空间并重新运行项目'));
	}

	return readImageBase64(imagePath)
		.then(({ base64, mime }) => uniCloud.callFunction({
			name: AI_CONFIG.cloudFunctionName,
			data: { imageBase64: base64, imageMime: mime },
		}))
		.then((res) => {
			const result = res && res.result;
			if (!result) throw new Error('云函数没有返回结果');
			if (result.code !== 0) throw new Error(result.msg || '云函数返回失败');
			const parsed = parseResult(result.data);
			if (!parsed) throw new Error('模型返回内容无法解析');
			return parsed;
		})
		.catch((error) => {
			console.error('[AI识图] 调用失败', {
				message: error && error.message ? error.message : String(error),
				cloudFunction: AI_CONFIG.cloudFunctionName,
				cloudSpace: uniCloud.config && uniCloud.config.spaceId ? uniCloud.config.spaceId : '',
			});
			throw error;
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
	const text = typeof content === 'string' ? content.trim() : JSON.stringify(content || '');
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
