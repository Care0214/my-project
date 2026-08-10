<template>
	<view>
		<slot />
	</view>
</template>

<script>
export default {
	onLaunch() {
		console.log('App Launch');
	},
	onShow() {
		console.log('App Show');
	},
	onHide() {
		console.log('App Hide');
	},
};
</script>

<style>
/* 全局引入 iconfont 图标样式（备用方案）
   暂未引入 — iconfont.ttf 尚未下载。当前使用 AppIcon 组件的 SVG 方案。
   如需启用 iconfont 字体方案：
   1. 从 https://www.iconfont.cn 下载字体文件 iconfont.ttf
   2. 放入 static/iconfont/ 目录
   3. 取消下面这行的注释
*/
/* @import './static/iconfont/iconfont.css'; */

/* 全局基础样式 */
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

/* 多行文本溢出省略 */
.text-ellipsis-2 {
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}
</style>
