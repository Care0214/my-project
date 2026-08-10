<template>
	<view class="page-container mine-page">
		<!-- 自定义导航栏（蓝色渐变） -->
		<view class="mine-header">
			<view class="header-status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
			<view class="header-nav">
				<text class="header-nav-title">我的</text>
				<view class="header-nav-actions">
					<view class="nav-btn" @click="goToPage('/pages/mine/messages/index')">
						<AppIcon name="message" :size="40" color="#FFF" />
						<view class="badge" v-if="unreadCount > 0">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
					</view>
					<view class="nav-btn" @click="goToPage('/pages/mine/edit-profile/index')">
						<AppIcon name="edit" :size="40" color="#FFF" />
					</view>
				</view>
			</view>
		</view>

		<!-- 用户信息卡片（沉浸式） -->
		<view class="profile-section">
			<view class="profile-content">
				<view
					class="profile-avatar"
					:style="{ background: user.avatarColor || 'linear-gradient(135deg, #4F6EF7, #6366F1)' }"
					@click="goToPage('/pages/mine/edit-profile/index')"
				>
					<text class="profile-avatar-text">{{ userInitial }}</text>
				</view>
				<view class="profile-info">
					<view class="flex-row">
						<text class="profile-nickname">{{ userName }}</text>
					</view>
					<text class="profile-bio">{{ userBio }}</text>
					<view class="profile-tags">
						<text class="profile-tag">{{ userSchool }}</text>
						<text class="profile-tag">{{ userCampus }}</text>
					</view>
				</view>
				<view class="profile-edit-btn" @click="goToPage('/pages/mine/edit-profile/index')">
					<AppIcon name="arrow-right" :size="28" color="rgba(255,255,255,0.7)" />
				</view>
			</view>

			<!-- 数据统计 -->
			<view class="stats-card">
				<view class="stat-item" @click="goToPage('/pages/mine/my-publish/index')">
					<text class="stat-num">{{ stats.posts }}</text>
					<text class="stat-label">发布</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item" @click="goToPage('/pages/mine/my-exchange/index')">
					<text class="stat-num">{{ stats.exchanges }}</text>
					<text class="stat-label">互助</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item" @click="goToPage('/pages/mine/my-lease/index')">
					<text class="stat-num">{{ stats.rentals }}</text>
					<text class="stat-label">租借</text>
				</view>
			</view>
		</view>

		<view class="page-body">
			<!-- 我的交易 -->
			<view class="menu-group">
				<text class="menu-group-title">我的交易</text>
				<view class="menu-grid">
					<view class="menu-grid-item" v-for="m in tradeMenus" :key="m.name" @click="goToPage(m.page)">
						<view class="menu-icon-box">
							<AppIcon :name="m.icon" :size="44" color="#4F6EF7" />
						</view>
						<text class="menu-grid-text">{{ m.name }}</text>
						<view class="badge menu-grid-badge" v-if="m.badge">{{ m.badge }}</view>
					</view>
				</view>
			</view>

			<!-- 功能菜单 -->
			<view class="menu-group">
				<text class="menu-group-title">其他功能</text>
				<view class="menu-list">
					<view class="menu-item" v-for="m in funcMenus" :key="m.name" @click="goToPage(m.page)">
						<view class="menu-left">
							<view class="menu-icon-sm">
								<AppIcon :name="m.icon" :size="36" color="#4F6EF7" />
							</view>
							<text class="menu-text">{{ m.name }}</text>
							<view class="badge menu-badge" v-if="m.badge">{{ m.badge }}</view>
						</view>
						<AppIcon name="arrow-right" :size="32" color="#CCC" />
					</view>
				</view>
			</view>

			<!-- 分享&关于 -->
			<view class="menu-group">
				<view class="menu-list">
					<view class="menu-item" @click="shareApp">
						<view class="menu-left">
							<view class="menu-icon-sm">
								<AppIcon name="share" :size="36" color="#4F6EF7" />
							</view>
							<text class="menu-text">分享给同学</text>
						</view>
						<AppIcon name="arrow-right" :size="32" color="#CCC" />
					</view>
					<view class="menu-item" @click="goAbout">
						<view class="menu-left">
							<view class="menu-icon-sm">
								<AppIcon name="ai" :size="36" color="#4F6EF7" />
							</view>
							<text class="menu-text">关于拾闲小栈</text>
						</view>
						<text class="menu-extra">v1.0.0</text>
					</view>
				</view>
			</view>

			<!-- 退出登录 -->
			<view class="logout-btn" @click="handleLogout">
				<text class="logout-text">退出登录</text>
			</view>

			<view style="height: 40rpx;"></view>
		</view>

		<CustomTabBar :current="3" />
	</view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';
import store from '@/utils/store.js';
import { get } from '@/utils/request.js';

export default {
	components: { CustomTabBar, AppIcon },
	data() {
		return {
			statusBarHeight: 44,
			user: {
				nickname: '校园小闲er',
				avatar: '',
				avatarColor: 'linear-gradient(135deg, #4F6EF7, #6366F1)',
				bio: '热爱环保的校园闲置交换达人~',
				school: 'XX大学',
				campus: '主校区',
				stats: { posts: 12, exchanges: 5, rentals: 3 },
			},
			unreadCount: 0,
			tradeMenus: [
				{ name: '我的发布', icon: 'order', page: '/pages/mine/my-publish/index' },
				{ name: '我的收藏', icon: 'heart', page: '/pages/mine/my-collect/index' },
				{ name: '我的互助', icon: 'exchange', page: '/pages/mine/my-exchange/index' },
				{ name: '我的租借', icon: 'clock', page: '/pages/mine/my-lease/index' },
			],
			funcMenus: [
				{ name: '消息通知', icon: 'message', page: '/pages/mine/messages/index', badge: 0 },
				{ name: '浏览记录', icon: 'search', page: '/pages/mine/browse-history/index' },
				{ name: '黑名单', icon: 'block', page: '/pages/mine/blacklist/index' },
			],
		};
	},
	computed: {
		userInfo() {
			return this.$store ? this.$store.userInfo : null;
		},
		userInitial() {
			if (this.userInfo && this.userInfo.nickname) return this.userInfo.nickname.charAt(0);
			return this.user.nickname.charAt(0);
		},
		userName() {
			return (this.userInfo && this.userInfo.nickname) || this.user.nickname;
		},
		userBio() {
			return (this.userInfo && this.userInfo.bio) || this.user.bio;
		},
		userSchool() {
			return (this.userInfo && this.userInfo.school) || this.user.school;
		},
		userCampus() {
			return (this.userInfo && this.userInfo.campus) || this.user.campus;
		},
		stats() {
			if (this.userInfo && this.userInfo.stats) return this.userInfo.stats;
			return this.user.stats;
		},
	},
	mounted() {
		const systemInfo = uni.getSystemInfoSync();
		this.statusBarHeight = systemInfo.statusBarHeight || 44;
	},
	onShow() {
		if (!store.isLoggedIn) {
			uni.reLaunch({ url: '/pages/login/index' });
			return;
		}
		this.loadUnreadCount();
	},
	onPullDownRefresh() {
		this.loadUnreadCount();
		setTimeout(() => {
			uni.stopPullDownRefresh();
			uni.showToast({ title: '已刷新', icon: 'success', duration: 1000 });
		}, 800);
	},
	onShareAppMessage() {
		return { title: '拾闲小栈 - 校园闲置物品交换', path: '/pages/home/index' };
	},
	methods: {
		async loadUnreadCount() {
			try {
				const data = await get('/api/conversations/unread-count');
				this.unreadCount = data.count || 0;
				this.funcMenus[0].badge = this.unreadCount || 0;
				if (store.setUnreadCount) store.setUnreadCount(this.unreadCount);
			} catch (e) {
				this.unreadCount = 0;
			}
		},
		goToPage(url) {
			if (!url) {
				uni.showToast({ title: '功能开发中', icon: 'none' });
				return;
			}
			uni.navigateTo({ url });
		},
		goAbout() {
			uni.showModal({
				title: '关于拾闲小栈',
				content: '拾闲小栈 v1.0.0\n\n专为校园打造的闲置物品交易平台。在这里你可以出售闲置、交换好物、租借物品，践行环保校园生活。\n\n— 让每件物品都有第二次生命 —',
				showCancel: false,
				confirmText: '知道了',
			});
		},
		shareApp() {
			// #ifdef MP-WEIXIN
			uni.showToast({ title: '点击右上角分享给同学', icon: 'none' });
			// #endif
		},
		handleLogout() {
			uni.showModal({
				title: '确认退出',
				content: '退出登录后不会删除任何数据，下次登录即可恢复。',
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
@import '@/styles/common.scss';

.mine-page { background: #F5F5F5; }
.mine-header { background: linear-gradient(180deg, #4F6EF7 0%, #6366F1 100%); }
.header-nav {
	display: flex; align-items: center; justify-content: space-between; padding: 20rpx 30rpx;
}
.header-nav-title { font-size: 36rpx; font-weight: bold; color: #FFF; }
.header-nav-actions { display: flex; gap: 20rpx; align-items: center; }
.nav-btn { position: relative; padding: 8rpx; }

.profile-section {
	background: linear-gradient(180deg, #4F6EF7 0%, #6366F1 60%, #F5F5F5 60%);
	padding: 0 24rpx;
}
.profile-content { display: flex; align-items: center; gap: 24rpx; padding: 20rpx 0 30rpx; }
.profile-avatar {
	width: 130rpx; height: 130rpx; border-radius: 50%;
	border: 4rpx solid rgba(255, 255, 255, 0.5); flex-shrink: 0;
	display: flex; align-items: center; justify-content: center;
}
.profile-avatar:active { transform: scale(0.95); }
.profile-avatar-text { font-size: 48rpx; font-weight: bold; color: #FFF; }
.profile-info { flex: 1; }
.profile-nickname { font-size: 36rpx; font-weight: bold; color: #FFF; margin-right: 10rpx; }
.profile-bio { display: block; font-size: 24rpx; color: rgba(255, 255, 255, 0.8); margin-top: 6rpx; margin-bottom: 10rpx; }
.profile-tags { display: flex; gap: 10rpx; }
.profile-tag {
	padding: 4rpx 14rpx; font-size: 20rpx; color: rgba(255, 255, 255, 0.9);
	background: rgba(255, 255, 255, 0.2); border-radius: 6rpx;
}
.profile-edit-btn { padding: 10rpx; flex-shrink: 0; }

.stats-card {
	display: flex; background: #FFF; border-radius: 20rpx; padding: 30rpx 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06); margin-bottom: 24rpx;
}
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6rpx; }
.stat-num { font-size: 36rpx; font-weight: bold; color: #333; }
.stat-label { font-size: 22rpx; color: #999; }
.stat-divider { width: 1px; height: 40rpx; background: #F0F0F0; align-self: center; }

.menu-group {
	background: #FFF; border-radius: 20rpx; margin-bottom: 24rpx; overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.menu-group-title { font-size: 28rpx; font-weight: 600; color: #333; padding: 24rpx 28rpx 10rpx; display: block; }
.menu-grid { display: flex; padding: 10rpx 10rpx 20rpx; }
.menu-grid-item {
	flex: 1; display: flex; flex-direction: column; align-items: center; gap: 10rpx;
	padding: 16rpx 0; position: relative;
}
.menu-icon-box {
	width: 80rpx; height: 80rpx; background: #EDF0FE; border-radius: 50%;
	display: flex; align-items: center; justify-content: center;
}
.menu-grid-item:active .menu-icon-box { transform: scale(0.9); }
.menu-grid-text { font-size: 24rpx; color: #666; }
.menu-grid-badge { position: absolute; top: 8rpx; right: 12rpx; }

.menu-list { padding: 0 28rpx; }
.menu-item {
	display: flex; align-items: center; justify-content: space-between;
	padding: 26rpx 0; border-bottom: 1px solid #F5F5F5;
}
.menu-item:active { background: #F8FAFF; }
.menu-item:last-child { border-bottom: none; }
.menu-left { display: flex; align-items: center; flex: 1; }
.menu-icon-sm {
	width: 56rpx; height: 56rpx; background: #EDF0FE; border-radius: 50%;
	display: flex; align-items: center; justify-content: center; margin-right: 18rpx;
}
.menu-text { font-size: 28rpx; color: #333; }
.menu-badge { margin-left: 10rpx; }
.menu-extra { font-size: 24rpx; color: #999; margin-right: 6rpx; }

.logout-btn {
	margin-top: 30rpx; padding: 24rpx 0; text-align: center;
	background: #FFF; border-radius: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.logout-btn:active { background: #FFF0F0; }
.logout-text { font-size: 28rpx; color: #FF4D4F; }
</style>
