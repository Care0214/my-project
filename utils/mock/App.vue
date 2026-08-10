<script>
export default {
	onLaunch() {
		console.log('拾闲小栈 App Launch');

		// 检查登录态：无 token 则跳转登录页
		const token = uni.getStorageSync('token');
		if (!token) {
			setTimeout(() => {
				uni.reLaunch({ url: '/pages/login/index' });
			}, 100);
		}
	},
	onShow() {
		console.log('拾闲小栈 App Show');
	},
	onHide() {
		console.log('拾闲小栈 App Hide');
	},
	// 全局微信分享配置（子页面可覆盖）
	onShareAppMessage() {
		return {
			title: '拾闲小栈 - 校园闲置物品智能交换',
			desc: '安全、就近、高效的校园闲置交换平台',
			path: '/pages/home/index',
		};
	},
};
</script>

<style>
/* ========== 全局基础样式 ========== */
page {
	background: #F5F5F5;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
		'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB',
		'Microsoft YaHei', sans-serif;
	font-size: 28rpx;
	color: #333333;
	-webkit-font-smoothing: antialiased;
}

/* 重置默认样式 */
view,
text,
image,
scroll-view {
	box-sizing: border-box;
}

/* 单行文本溢出省略 */
.text-ellipsis {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* 两行文本溢出省略 */
.text-ellipsis-2 {
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

/* 三行文本溢出省略 */
.text-ellipsis-3 {
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
}
</style>
