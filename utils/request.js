/**
 * 网络请求封装
 *
 * 用法：
 *   import { get, post, del } from '@/utils/request.js'
 *
 *   const data = await get('/api/items', { page: 1 })
 *   const result = await post('/api/items', { title: '...' })
 *
 * Mock 模式：
 *   USE_MOCK = true 时自动走本地 mock 数据，不发起真实网络请求
 *   接入后端时改为 false 并配置 BASE_URL 即可，业务代码无需任何修改
 */

import { handle as mockHandle } from './mock/index.js';

/* ==================== 配置 ==================== */
const USE_MOCK = true;
const BASE_URL = 'https://your-api-domain.com';
const TIMEOUT = 15000;

/* ==================== 核心请求方法 ==================== */
function request({ url, method = 'GET', data = {}, showLoading = false, loadingText = '加载中...' }) {
	// Mock 模式
	if (USE_MOCK) {
		return mockRequest(url, method, data, showLoading, loadingText);
	}

	// 真实请求
	return realRequest(url, method, data, showLoading, loadingText);
}

/* ==================== Mock 请求 ==================== */
async function mockRequest(url, method, data, showLoading, loadingText) {
	if (showLoading) {
		uni.showLoading({ title: loadingText, mask: true });
	}

	try {
		const result = await mockHandle(url, method, data);
		if (result.code === 0) {
			return result.data;
		} else {
			uni.showToast({ title: result.msg || '请求失败', icon: 'none' });
			throw result;
		}
	} catch (err) {
		throw err;
	} finally {
		if (showLoading) {
			uni.hideLoading();
		}
	}
}

/* ==================== 真实请求 ==================== */
function realRequest(url, method, data, showLoading, loadingText) {
	return new Promise((resolve, reject) => {
		if (showLoading) {
			uni.showLoading({ title: loadingText, mask: true });
		}

		const token = uni.getStorageSync('token') || '';

		uni.request({
			url: BASE_URL + url,
			method,
			data,
			timeout: TIMEOUT,
			header: {
				Authorization: token ? `Bearer ${token}` : '',
				'Content-Type': 'application/json',
			},
			success(res) {
				// 登录态失效
				if (res.statusCode === 401) {
					// 清除本地登录信息
					uni.removeStorageSync('token');
					uni.removeStorageSync('userInfo');

					// 跳转登录页
					const pages = getCurrentPages();
					const currentPage = pages[pages.length - 1];
					if (currentPage && currentPage.route !== 'pages/login/index') {
						uni.reLaunch({ url: '/pages/login/index' });
					}

					reject({ code: -401, msg: '登录已过期，请重新登录' });
					return;
				}

				if (res.statusCode === 200 && res.data) {
					if (res.data.code === 0) {
						resolve(res.data.data);
					} else {
						uni.showToast({ title: res.data.msg || '请求失败', icon: 'none' });
						reject(res.data);
					}
				} else {
					uni.showToast({ title: '服务器异常', icon: 'none' });
					reject({ code: -1, msg: '服务器异常' });
				}
			},
			fail(err) {
				uni.showToast({ title: '网络异常，请检查网络', icon: 'none' });
				reject(err);
			},
			complete() {
				if (showLoading) {
					uni.hideLoading();
				}
			},
		});
	});
}

/* ==================== 便捷方法 ==================== */
function get(url, data = {}, options = {}) {
	return request({ url, method: 'GET', data, ...options });
}

function post(url, data = {}, options = {}) {
	return request({ url, method: 'POST', data, ...options });
}

function del(url, data = {}, options = {}) {
	return request({ url, method: 'DELETE', data, ...options });
}

function put(url, data = {}, options = {}) {
	return request({ url, method: 'PUT', data, ...options });
}

export { request, get, post, del, put, USE_MOCK, BASE_URL };
export default request;
