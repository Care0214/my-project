<template>
	<view class="tabbar">
		<!-- 首页 -->
		<view class="tabbar-item" @click="switchTab('/pages/home/index')">
			<AppIcon
				:name="'home'"
				:size="44"
				:color="current === 0 ? '#4F6EF7' : '#B0B4C0'"
			/>
			<text :class="['tabbar-text', { active: current === 0 }]">首页</text>
		</view>

		<!-- 互助 -->
		<view class="tabbar-item" @click="switchTab('/pages/exchange/index')">
			<AppIcon
				:name="'exchange'"
				:size="44"
				:color="current === 1 ? '#4F6EF7' : '#B0B4C0'"
			/>
			<text :class="['tabbar-text', { active: current === 1 }]">互助</text>
		</view>

		<!-- 发布（中央凸起按钮） -->
		<view class="tabbar-item tabbar-item--publish" @click="switchTab('/pages/publish/index')">
			<view :class="['publish-btn', { 'publish-btn--active': current === 2 }]">
				<AppIcon name="plus" :size="48" color="#FFFFFF" />
			</view>
			<text :class="['tabbar-text', { active: current === 2 }]">发布</text>
		</view>

		<!-- 消息 -->
		<view class="tabbar-item" @click="switchTab('/pages/message/index')">
			<AppIcon
				:name="'message'"
				:size="44"
				:color="current === 3 ? '#4F6EF7' : '#B0B4C0'"
			/>
			<!-- 未读红点 -->
			<view v-if="unreadCount > 0" class="badge">
				<text v-if="unreadCount <= 99">{{ unreadCount }}</text>
				<text v-else>99+</text>
			</view>
			<text :class="['tabbar-text', { active: current === 3 }]">消息</text>
		</view>

		<!-- 我的 -->
		<view class="tabbar-item" @click="switchTab('/pages/mine/index')">
			<AppIcon
				:name="'mine'"
				:size="44"
				:color="current === 4 ? '#4F6EF7' : '#B0B4C0'"
			/>
			<text :class="['tabbar-text', { active: current === 4 }]">我的</text>
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
	computed: {
		unreadCount() {
			// 从全局 store 读取未读消息数
			return this.$store ? this.$store.unreadCount : 0;
		},
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
	height: calc(120rpx + env(safe-area-inset-bottom));
	padding-bottom: env(safe-area-inset-bottom);
	background: #FFFFFF;
	display: flex;
	justify-content: space-around;
	align-items: flex-start;
	padding-top: 12rpx;
	box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.06);
	z-index: 999;
}

.tabbar-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	gap: 4rpx;
	flex: 1;
	padding: 4rpx 0;
	position: relative;
}

.tabbar-text {
	font-size: 20rpx;
	color: #B0B4C0;
	transition: color 0.2s;
}

.tabbar-text.active {
	color: #4F6EF7;
	font-weight: 600;
}

/* ========== 中央发布按钮 ========== */
.tabbar-item--publish {
	justify-content: flex-end;
}

.publish-btn {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #4F6EF7, #6366F1);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: -40rpx;
	margin-bottom: 4rpx;
	box-shadow: 0 8rpx 28rpx rgba(79, 110, 247, 0.35);
	transition: all 0.2s;
}

.publish-btn:active {
	transform: scale(0.92);
	box-shadow: 0 4rpx 16rpx rgba(79, 110, 247, 0.3);
}

.publish-btn--active {
	background: linear-gradient(135deg, #6366F1, #4F6EF7);
	box-shadow: 0 4rpx 20rpx rgba(79, 110, 247, 0.25);
}

/* ========== 未读红点 ========== */
.badge {
	position: absolute;
	top: -2rpx;
	right: 50%;
	transform: translateX(34rpx);
	min-width: 32rpx;
	height: 32rpx;
	padding: 0 8rpx;
	border-radius: 16rpx;
	background: #EF4444;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18rpx;
	color: #FFFFFF;
	font-weight: 600;
}
</style>
