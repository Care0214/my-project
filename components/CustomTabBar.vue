<template>
	<view class="tabbar">
		<!-- 首页 -->
		<view class="tabbar-item" @click="switchTab('/pages/home/index')">
			<image class="tabbar-icon" :src="current === 0 ? '/static/tabbar/home_active.png' : '/static/tabbar/home.png'" mode="aspectFit"></image>
			<text :class="['tabbar-text', { active: current === 0 }]">首页</text>
		</view>

		<!-- 互助 -->
		<view class="tabbar-item" @click="switchTab('/pages/exchange/index')">
			<image class="tabbar-icon" :src="current === 1 ? '/static/tabbar/exchange_active.png' : '/static/tabbar/exchange.png'" mode="aspectFit"></image>
			<text :class="['tabbar-text', { active: current === 1 }]">互助</text>
		</view>

		<!-- 中间凸起发布按钮 -->
		<view class="tabbar-publish" @click="navigateTo('/pages/publish/index')">
			<view class="publish-btn">
				<text class="publish-plus">+</text>
			</view>
		</view>

		<!-- 租借 -->
		<view class="tabbar-item" @click="switchTab('/pages/lease/index')">
			<image class="tabbar-icon" :src="current === 2 ? '/static/tabbar/lease_active.png' : '/static/tabbar/lease.png'" mode="aspectFit"></image>
			<text :class="['tabbar-text', { active: current === 2 }]">租借</text>
		</view>

		<!-- 我的 -->
		<view class="tabbar-item" @click="switchTab('/pages/mine/index')">
			<image class="tabbar-icon" :src="current === 3 ? '/static/tabbar/mine_active.png' : '/static/tabbar/mine.png'" mode="aspectFit"></image>
			<text :class="['tabbar-text', { active: current === 3 }]">我的</text>
		</view>
	</view>
</template>

<script>
import AppIcon from './AppIcon.vue';

export default {
	name: 'CustomTabBar',
	components: { AppIcon },
	props: {
		current: {
			type: Number,
			default: 0,
		},
	},
	data() {
		return {
			activeColor: '#77C9F1',
			inactiveColor: '#6B6F80',
		};
	},
	methods: {
		switchTab(url) {
			uni.switchTab({ url });
		},
		navigateTo(url) {
			// 检查登录态
			if (!this.$store || !this.$store.isLoggedIn) {
				uni.reLaunch({ url: '/pages/login/index' });
				return;
			}
			uni.navigateTo({ url });
		},
	},
};
</script>

<style scoped>
.tabbar-icon{
	width: 52rpx;
	height: 52rpx;
}
.publish-plus {
	font-size: 56rpx;
	color: #FFFFFF;
	font-weight: 300;
	line-height: 1;
	margin-top: -4rpx;
}
.tabbar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	height: calc(110rpx + env(safe-area-inset-bottom));
	padding-bottom: env(safe-area-inset-bottom);
	background: #ffffff;
	display: flex;
	justify-content: space-around;
	align-items: center;
	box-shadow: 0 -2rpx 16rpx rgba(119, 201, 241, 0.10);
	z-index: 999;
}

.tabbar-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 4rpx;
	flex: 1;
	padding: 8rpx 0;
}

.tabbar-text {
	font-size: 24rpx;
	color: #7A8294;
	transition: color 0.2s;
}

.tabbar-text.active {
	color: #77C9F1;
	font-weight: 500;
}

.tabbar-publish {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
}

.publish-btn {
	width: 100rpx;
	height: 100rpx;
	background: linear-gradient(135deg, #77C9F1, #77C9F1);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transform: translateY(-16rpx);
	box-shadow: 0 8rpx 24rpx rgba(119, 201, 241, 0.40);
	transition: transform 0.2s, box-shadow 0.2s;
}

.publish-btn:active {
	transform: translateY(-16rpx) scale(0.92);
	box-shadow: 0 4rpx 12rpx rgba(119, 201, 241, 0.35);
}
</style>
