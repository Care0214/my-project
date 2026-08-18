/**
 * 自定义导航栏辅助工具
 *
 * 微信小程序右上角有固定的胶囊按钮（... / ⊙），自定义导航页的右侧操作
 * 需要给它留出空间，否则会被遮挡。
 */

/**
 * 获取胶囊按钮在屏幕右侧占用的宽度（px）
 * 返回 0 表示无胶囊按钮（如 H5 预览），页面保持默认右间距。
 */
export function getMenuRightPadding() {
	// #ifdef MP-WEIXIN
	try {
		const sys = uni.getSystemInfoSync();
		const menuBtn = uni.getMenuButtonBoundingClientRect();
		if (menuBtn && menuBtn.left) {
			// 胶囊左侧到屏幕右边缘的距离，再留 8px 安全间距
			return Math.max(0, sys.windowWidth - menuBtn.left + 8);
		}
	} catch (e) { /* 忽略，走兜底值 */ }
	return 96;
	// #endif
	// #ifndef MP-WEIXIN
	return 0;
	// #endif
}
