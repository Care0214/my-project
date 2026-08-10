<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 用户信息卡片 -->
			<view class="profile-card">
				<view class="avatar-lg"></view>
				<text class="username">用户昵称</text>
				<text class="bio">这个人很懒，什么都没写~</text>
				<view class="stats-row">
					<view class="stat-item">
						<text class="stat-num">0</text>
						<text class="stat-label">发布</text>
					</view>
					<view class="stat-item">
						<text class="stat-num">0</text>
						<text class="stat-label">互助</text>
					</view>
					<view class="stat-item">
						<text class="stat-num">0</text>
						<text class="stat-label">租借</text>
					</view>
				</view>
			</view>

			<!-- 功能菜单 -->
			<view class="menu-group">
				<view class="menu-item" v-for="item in menus" :key="item.name">
					<view class="menu-left">
						<AppIcon :name="item.icon" :size="40" color="#3C7DFF" />
						<text class="menu-text">{{ item.name }}</text>
					</view>
					<AppIcon name="arrow-right" :size="32" color="#CCC" />
				</view>
			</view>

			<view class="menu-group">
				<view class="menu-item">
					<view class="menu-left">
						<AppIcon name="share" :size="40" color="#3C7DFF" />
						<text class="menu-text">分享给同学</text>
					</view>
					<AppIcon name="arrow-right" :size="32" color="#CCC" />
				</view>
			</view>
		</view>

		<AppTabBar :current="4" />
	</view>
</template>

<script>
import AppTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';

export default {
	components: {
		AppTabBar,
		AppIcon,
	},
	data() {
		return {
			menus: [
				{ name: '我的发布', icon: 'lease' },
				{ name: '我的互助', icon: 'exchange' },
				{ name: '我的租借', icon: 'lease' },
				{ name: '浏览记录', icon: 'search' },
				{ name: '消息通知', icon: 'message' },
			],
		};
	},
};
</script>

<style scoped>
.profile-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 50rpx 30rpx 30rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.avatar-lg {
	width: 140rpx;
	height: 140rpx;
	background: #E0E0E0;
	border-radius: 50%;
	margin-bottom: 20rpx;
}

.username {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 8rpx;
}

.bio {
	font-size: 24rpx;
	color: #999;
	margin-bottom: 30rpx;
}

.stats-row {
	display: flex;
	width: 100%;
	justify-content: space-around;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stat-num {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.stat-label {
	font-size: 24rpx;
	color: #999;
	margin-top: 4rpx;
}

.menu-group {
	background: #FFFFFF;
	border-radius: 20rpx;
	margin-bottom: 24rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.menu-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 30rpx;
	border-bottom: 1px solid #F5F5F5;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-left {
	display: flex;
	align-items: center;
}

.menu-text {
	font-size: 28rpx;
	color: #333;
	margin-left: 20rpx;
}
</style>
