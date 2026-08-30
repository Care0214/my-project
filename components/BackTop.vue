<template>
	<view
		v-if="visible"
		class="back-top"
		:style="{ bottom: bottom }"
		@click="scrollToTop"
	>
		<image class="back-top-icon" src="/static/imgs/back-top.png" mode="aspectFit" />
	</view>
</template>

<script>
export default {
	name: 'BackTop',
	props: {
		visible: {
			type: Boolean,
			default: false,
		},
		// 距底部距离（rpx），默认悬停在 tab 栏上方
		bottom: {
			type: String,
			default: '180rpx',
		},
	},
	methods: {
		scrollToTop() {
			uni.pageScrollTo({ scrollTop: 0, duration: 300 });
		},
	},
};
</script>

<style scoped>
.back-top {
	position: fixed;
	right: 30rpx;
	width: 88rpx;
	height: 88rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #77C9F1, #77C9F1);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(119, 201, 241, 0.40);
	z-index: 200;
	transition: transform 0.15s;
}
.back-top-icon { width: 52rpx; height: 52rpx; }
.back-top:active {
	transform: scale(0.92);
}
</style>
