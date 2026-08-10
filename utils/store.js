/**
 * 全局状态管理
 *
 * 使用 Vue.observable 实现轻量级响应式 store。
 * 无需引入 Vuex，零依赖，适合中小型 uni-app 项目。
 *
 * 用法：
 *   import store from '@/utils/store.js'
 *
 *   // 读取状态（在 computed 中使用以保持响应式）
 *   computed: {
 *     userInfo() { return store.userInfo }
 *   }
 *
 *   // 修改状态
 *   store.login(token, userInfo)
 *   store.logout()
 */

import Vue from 'vue';

// 从本地存储恢复登录态
// 安全读取存储值，兼容空键名和非字符串值
let savedToken = '';
let savedUserInfo = null;
try {
	savedToken = uni.getStorageSync('token') || '';
} catch (e) { /* 键不存在 */ }
try {
	const raw = uni.getStorageSync('userInfo');
	if (raw) {
		// 兼容字符串（JSON）和已解析的对象两种存储格式
		savedUserInfo = typeof raw === 'string' ? JSON.parse(raw) : raw;
	}
} catch (e) { /* 键不存在或解析失败 */ }

const state = Vue.observable({
	/** 登录凭证 */
	token: savedToken,
	/** 当前用户信息 */
	userInfo: savedUserInfo,
	/** 未读消息数 */
	unreadCount: 0,
	/** 是否开启 Mock 模式 */
	useMock: true,
});

const store = {
	// ==================== 状态（只读） ====================

	get token() {
		return state.token;
	},
	get userInfo() {
		return state.userInfo;
	},
	get unreadCount() {
		return state.unreadCount;
	},
	get isLoggedIn() {
		return !!state.token;
	},
	get useMock() {
		return state.useMock;
	},

	// ==================== 操作 ====================

	/**
	 * 登录成功
	 * @param {string} token
	 * @param {object} userInfo
	 */
	login(token, userInfo) {
		state.token = token;
		state.userInfo = userInfo;

		// 持久化
		uni.setStorageSync('token', token);
		uni.setStorageSync('userInfo', JSON.stringify(userInfo));
	},

	/**
	 * 退出登录
	 */
	logout() {
		state.token = '';
		state.userInfo = null;

		// 清除持久化
		uni.removeStorageSync('token');
		uni.removeStorageSync('userInfo');
	},

	/**
	 * 更新用户信息
	 * @param {object} info
	 */
	updateUserInfo(info) {
		state.userInfo = { ...state.userInfo, ...info };
		uni.setStorageSync('userInfo', JSON.stringify(state.userInfo));
	},

	/**
	 * 设置未读消息数
	 * @param {number} count
	 */
	setUnreadCount(count) {
		state.unreadCount = count;
	},

	/**
	 * 检查登录态，未登录则跳转登录页
	 * @returns {boolean} 是否已登录
	 */
	checkLogin() {
		if (!state.token) {
			uni.reLaunch({ url: '/pages/login/index' });
			return false;
		}
		return true;
	},
};

// 挂载到 Vue 原型，组件内可通过 this.$store 访问
Vue.prototype.$store = store;

export default store;
