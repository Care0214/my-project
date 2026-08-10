<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 用户信息卡片 -->
			<view class="profile-card">
				<view class="edit-profile-link" @click="goEditProfile">
					<AppIcon name="edit" :size="28" color="#B0B4C0" />
				</view>
				<view
					class="avatar-lg"
					:style="{ background: userInfo ? 'linear-gradient(135deg, #4F6EF7, #6366F1)' : '#E8EAF0' }"
				>
					<text class="avatar-initial">{{ userInitial }}</text>
				</view>
				<text class="username">{{ userInfo ? userInfo.nickname : '未登录' }}</text>
				<text class="bio">{{ userInfo ? userInfo.bio || '这个人很懒，什么都没写~' : '点击登录体验完整功能' }}</text>

				<view class="stats-row">
					<view class="stat-item">
						<text class="stat-num">{{ stats.posts }}</text>
						<text class="stat-label">发布</text>
					</view>
					<view class="stat-divider"></view>
					<view class="stat-item">
						<text class="stat-num">{{ stats.exchanges }}</text>
						<text class="stat-label">互助</text>
					</view>
					<view class="stat-divider"></view>
					<view class="stat-item">
						<text class="stat-num">{{ stats.rentals }}</text>
						<text class="stat-label">租借</text>
					</view>
				</view>
			</view>

			<!-- 功能菜单 -->
			<view class="menu-group">
				<view
					class="menu-item"
					v-for="item in menuGroup1"
					:key="item.name"
					@click="onMenuClick(item)"
				>
					<view class="menu-left">
						<view class="menu-icon" :style="{ background: item.color + '12' }">
							<AppIcon :name="item.icon" :size="36" :color="item.color" />
						</view>
						<text class="menu-text">{{ item.name }}</text>
					</view>
					<AppIcon name="arrow-right" :size="28" color="#D0D3E0" />
				</view>
			</view>

			<view class="menu-group">
				<view
					class="menu-item"
					v-for="item in menuGroup2"
					:key="item.name"
					@click="onMenuClick(item)"
				>
					<view class="menu-left">
						<view class="menu-icon" :style="{ background: item.color + '12' }">
							<AppIcon :name="item.icon" :size="36" :color="item.color" />
						</view>
						<text class="menu-text">{{ item.name }}</text>
					</view>
					<AppIcon name="arrow-right" :size="28" color="#D0D3E0" />
				</view>
			</view>

			<!-- 退出登录 -->
			<view class="logout-row">
				<view class="logout-btn" @click="handleLogout">
					<text class="logout-text">退出登录</text>
				</view>
			</view>
		</view>

		<AppTabBar :current="4" />
	</view>
</template>

<script>
import AppTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';
import store from '@/utils/store.js';

export default {
	components: { AppTabBar, AppIcon },
	data() {
		return {
			menuGroup1: [
				{ name: '我的发布', icon: 'order', color: '#4F6EF7', key: 'posts', path: '/pages/mine/my-posts' },
				{ name: '我的互助', icon: 'exchange', color: '#FF6B3D', key: 'exchange', path: '/pages/mine/my-exchanges' },
				{ name: '我的租借', icon: 'lease', color: '#22C55E', key: 'rental', path: '/pages/mine/my-rentals' },
				{ name: '我的交易', icon: 'cart', color: '#8B5CF6', key: 'orders', path: '/pages/mine/my-orders' },
			],
			menuGroup2: [
				{ name: '我的收藏', icon: 'heart', color: '#EF4444', key: 'favorites', path: '/pages/mine/my-favorites' },
				{ name: '浏览记录', icon: 'clock', color: '#F59E0B', key: 'history', path: '/pages/mine/history' },
				{ name: '黑名单', icon: 'shield', color: '#6B6F80', key: 'blacklist', path: '/pages/mine/blacklist' },
				{ name: '分享给同学', icon: 'share', color: '#8B5CF6', key: 'share', path: '' },
			],
		};
	},
	computed: {
		userInfo() {
			return this.$store ? this.$store.userInfo : null;
		},
		userInitial() {
			if (!this.userInfo || !this.userInfo.nickname) return '?';
			return this.userInfo.nickname.charAt(0);
		},
		stats() {
			if (this.userInfo && this.userInfo.stats) {
				return this.userInfo.stats;
			}
			return { posts: 0, exchanges: 0, rentals: 0 };
		},
	},
	onShow() {
		// 检查登录态
		if (!store.isLoggedIn) {
			uni.reLaunch({ url: '/pages/login/index' });
		}
	},
	methods: {
		onMenuClick(item) {
			if (item.key === 'share') {
				uni.showToast({ title: '分享功能开发中', icon: 'none' });
				return;
			}
			if (item.path) {
				uni.navigateTo({ url: item.path });
			}
		},

		goEditProfile() {
			uni.navigateTo({ url: '/pages/mine/edit-profile' });
		},
		handleLogout() {
			uni.showModal({
				title: '退出登录',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						store.logout();
						uni.reLaunch({ url: '/pages/login/index' });
					}
				},
			});
		},
	},
};
</script>

<style scoped>
/* 用户信息卡片 */
.profile-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 48rpx 30rpx 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
	position: relative;
}

.edit-profile-link {
	position: absolute;
	top: 24rpx;
	right: 24rpx;
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background: #F3F4F8;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.15s;
}

.edit-profile-link:active {
	background: #E8EAF0;
	transform: scale(0.95);
}

.avatar-lg {
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 20rpx;
}

.avatar-initial {
	font-size: 52rpx;
	font-weight: 700;
	color: #FFFFFF;
}

.username {
	font-size: 36rpx;
	font-weight: 700;
	color: #1A1D28;
	margin-bottom: 6rpx;
}

.bio {
	font-size: 24rpx;
	color: #8B8FA3;
	margin-bottom: 28rpx;
}

/* 统计数据 */
.stats-row {
	display: flex;
	width: 100%;
	justify-content: center;
	align-items: center;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
}

.stat-num {
	font-size: 34rpx;
	font-weight: 700;
	color: #1A1D28;
}

.stat-label {
	font-size: 22rpx;
	color: #B0B4C0;
	margin-top: 4rpx;
}

.stat-divider {
	width: 1px;
	height: 36rpx;
	background: #E8EAF0;
}

/* 菜单 */
.menu-group {
	background: #FFFFFF;
	border-radius: 20rpx;
	margin-bottom: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.menu-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 22rpx 28rpx;
	transition: background 0.15s;
}

.menu-item:active {
	background: #F8F9FC;
}

.menu-item + .menu-item {
	border-top: 1px solid #F3F4F8;
}

.menu-left {
	display: flex;
	align-items: center;
}

.menu-icon {
	width: 56rpx;
	height: 56rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.menu-text {
	font-size: 28rpx;
	color: #1A1D28;
	font-weight: 500;
}

/* 退出登录 */
.logout-row {
	padding: 40rpx 0;
	display: flex;
	justify-content: center;
}

.logout-btn {
	width: 280rpx;
	height: 76rpx;
	border-radius: 40rpx;
	border: 2rpx solid #E8EAF0;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.15s;
}

.logout-btn:active {
	background: #F8F9FC;
}

.logout-text {
	font-size: 26rpx;
	color: #8B8FA3;
}
</style>
