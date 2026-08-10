<template>
	<view class="tabbar">
		<!-- 首页 -->
		<view class="tabbar-item" @click="switchTab('/pages/home/index')">
			<image
				class="tabbar-icon"
				:src="current === 0 ? homeActive : home"
				mode="aspectFit"
			/>
			<text :class="['tabbar-text', { active: current === 0 }]">首页</text>
		</view>

		<!-- 互助 -->
		<view class="tabbar-item" @click="switchTab('/pages/exchange/index')">
			<image
				class="tabbar-icon"
				:src="current === 1 ? exchangeActive : exchange"
				mode="aspectFit"
			/>
			<text :class="['tabbar-text', { active: current === 1 }]">互助</text>
		</view>

		<!-- 发布 -->
		<view class="tabbar-item" @click="switchTab('/pages/publish/index')">
			<image
				class="tabbar-icon"
				:src="publish"
				mode="aspectFit"
			/>
			<text :class="['tabbar-text', { active: current === 2 }]">发布</text>
		</view>

		<!-- 消息 -->
		<view class="tabbar-item" @click="switchTab('/pages/message/index')">
			<image
				class="tabbar-icon"
				:src="current === 3 ? messageActive : message"
				mode="aspectFit"
			/>
			<text :class="['tabbar-text', { active: current === 3 }]">消息</text>
		</view>

		<!-- 我的 -->
		<view class="tabbar-item" @click="switchTab('/pages/mine/index')">
			<image
				class="tabbar-icon"
				:src="current === 4 ? mineActive : mine"
				mode="aspectFit"
			/>
			<text :class="['tabbar-text', { active: current === 4 }]">我的</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'CustomTabBar',
	props: {
		current: {
			type: Number,
			default: 0,
		},
	},
	data() {
		return {
			// 导入 tabbar 图标
			home: require('@/static/tabbar/home.png'),
			homeActive: require('@/static/tabbar/home_active.png'),
			exchange: require('@/static/tabbar/exchange.png'),
			exchangeActive: require('@/static/tabbar/exchange_active.png'),
			publish: require('@/static/tabbar/publish.png'),
			message: require('@/static/tabbar/message.png'),
			messageActive: require('@/static/tabbar/message_active.png'),
			mine: require('@/static/tabbar/mine.png'),
			mineActive: require('@/static/tabbar/mine_active.png'),
		};
	},
	methods: {
		switchTab(url) {
			uni.switchTab({ url });
		},
	},
};
</script>

<style scoped>
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
	box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.06);
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

.tabbar-icon {
	width: 44rpx;
	height: 44rpx;
}

.tabbar-text {
	font-size: 20rpx;
	color: #999999;
	transition: color 0.2s;
}

.tabbar-text.active {
	color: #3C7DFF;
	font-weight: 500;
}
</style>
