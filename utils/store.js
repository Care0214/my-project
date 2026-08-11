/**
 * 全局状态管理
 *
 * 使用 Vue.observable 实现轻量级响应式 store。
 * 无需引入 Vuex，零依赖，适合中小型 uni-app 项目。
 *
 * 整合版 — 拾闲小栈：
 *   - 登录态管理
 *   - 未读消息数追踪
 *   - 用户信息 & 校区
 *   - Mock 模式开关
 */
import Vue from 'vue';
import { getRandomTitle } from '@/utils/title.js';

// 从本地存储恢复登录态
let savedToken = '';
let savedUserInfo = null;
try {
	savedToken = uni.getStorageSync('token') || '';
} catch (e) { /* ignore */ }
try {
	const raw = uni.getStorageSync('userInfo');
	if (raw) {
		savedUserInfo = typeof raw === 'string' ? JSON.parse(raw) : raw;
	}
} catch (e) { /* ignore */ }

const state = Vue.observable({
	/** 登录凭证 */
	token: savedToken,
	/** 当前用户信息 */
	userInfo: savedUserInfo,
	/** 未读消息数 */
	unreadCount: 0,
	/** 当前校区（默认全部） */
	currentCampus: '全部校区',
	/** 是否开启 Mock 模式 */
	useMock: true,
});

const store = {
	// ==================== 状态（只读） ====================

	get token() { return state.token; },
	get userInfo() { return state.userInfo; },
	get title() { return (state.userInfo && state.userInfo.title) || '拾闲用户'; },
	get unreadCount() { return state.unreadCount; },
	get isLoggedIn() { return !!state.token; },
	get useMock() { return state.useMock; },
	get currentCampus() { return state.currentCampus; },

	// ==================== 操作 ====================

	/**
	 * 登录成功
	 */
	login(token, userInfo) {
		state.token = token;
		state.userInfo = { ...userInfo, title: userInfo.title || getRandomTitle() };
		uni.setStorageSync('token', token);
		uni.setStorageSync('userInfo', JSON.stringify(state.userInfo));
	},

	/**
	 * 退出登录
	 */
	logout() {
		state.token = '';
		state.userInfo = null;
		uni.removeStorageSync('token');
		uni.removeStorageSync('userInfo');
	},

	/**
	 * 更新用户信息
	 */
	updateUserInfo(info) {
		state.userInfo = { ...state.userInfo, ...info };
		uni.setStorageSync('userInfo', JSON.stringify(state.userInfo));
	},

	/**
	 * 设置未读消息数
	 */
	setUnreadCount(count) {
		state.unreadCount = count;
	},

	/**
	 * 设置当前校区
	 */
	setCampus(campus) {
		state.currentCampus = campus;
	},

	/**
	 * 检查登录态，未登录则跳转登录页
	 * @returns {boolean}
	 */
	checkLogin() {
		if (!state.token) {
			uni.reLaunch({ url: '/pages/login/index' });
			return false;
		}
		return true;
	},
};

// 挂载到 Vue 原型
Vue.prototype.$store = store;

export default store;
