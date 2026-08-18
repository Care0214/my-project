<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 顶部标题栏 -->
			<view class="msg-header">
				<text class="header-title">消息</text>
				<view class="header-actions">
					<view class="header-action-btn" @click="showSearch = !showSearch">
						<AppIcon name="search" :size="36" color="#6B6F80" />
					</view>
				</view>
			</view>

			<!-- 搜索栏 -->
			<view v-if="showSearch" class="search-row">
				<input
					class="search-input"
					v-model="searchText"
					placeholder="搜索聊天记录..."
					confirm-type="search"
				/>
			</view>

			<!-- 消息列表 -->
			<view v-if="filteredConversations.length > 0" class="msg-list">
				<!-- 按时间分组 -->
				<view v-for="(group, gIdx) in groupedConversations" :key="gIdx">
					<view class="group-label">
						<text>{{ group.label }}</text>
					</view>

					<view
						v-for="conv in group.items"
						:key="conv.id"
						class="msg-card"
						@click="goChat(conv)"
						@longpress="showActionSheet(conv)"
					>
						<!-- 头像 + 在线状态 -->
						<view class="msg-avatar-wrap">
							<view
								class="msg-avatar"
								:style="{ background: conv.user.avatarBg || '#8FA1F8' }"
							>
								<text class="msg-avatar-text">{{ conv.user.nickname ? conv.user.nickname.charAt(0) : '?' }}</text>
							</view>
							<view v-if="conv.user.online" class="online-dot"></view>
						</view>

						<!-- 信息区 -->
						<view class="msg-info">
							<view class="msg-top">
								<view class="msg-name-row">
									<text class="msg-username">{{ conv.user.nickname }}</text>
									<view v-if="conv.relatedItem" class="msg-item-tag">
										<text class="msg-item-tag-text text-ellipsis">{{ conv.relatedItem.title }}</text>
									</view>
								</view>
								<text class="msg-time">{{ conv.lastMessageTime }}</text>
							</view>
							<view class="msg-bottom">
								<text class="msg-preview text-ellipsis">{{ conv.lastMessage }}</text>
								<view v-if="conv.unreadCount > 0" class="msg-badge">
									<text>{{ conv.unreadCount > 99 ? '99+' : conv.unreadCount }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else class="empty-state">
				<view class="empty-illustration">
					<text class="empty-illustration-icon">💬</text>
				</view>
				<text class="empty-text">暂无消息</text>
				<text class="empty-sub">去首页逛逛，和同学们打个招呼吧~</text>
				<view class="empty-action" @click="goHome">
					<text>去首页看看</text>
				</view>
			</view>
		</view>

		<AppTabBar :current="3" />
	</view>
</template>

<script>
import AppTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';
import { get } from '@/utils/request.js';
import store from '@/utils/store.js';

export default {
	components: { AppTabBar, AppIcon },
	data() {
		return {
			conversations: [],
			searchText: '',
			showSearch: false,
		};
	},
	computed: {
		filteredConversations() {
			if (!this.searchText.trim()) return this.conversations;
			const keyword = this.searchText.trim().toLowerCase();
			return this.conversations.filter(c =>
				c.user.nickname.toLowerCase().includes(keyword) ||
				c.lastMessage.toLowerCase().includes(keyword)
			);
		},
		groupedConversations() {
			const now = new Date();
			const today = [];
			const yesterday = [];
			const thisWeek = [];
			const earlier = [];

			this.filteredConversations.forEach(c => {
				// 简单基于 lastMessageTime 文字分组
				const timeText = c.lastMessageTime || '';
				if (timeText.includes('分钟前') || timeText.includes('刚刚') || timeText.includes('小时前')) {
					today.push(c);
				} else if (timeText.includes('昨天')) {
					yesterday.push(c);
				} else if (timeText.includes('天前')) {
					const days = parseInt(timeText);
					if (days <= 7) {
						thisWeek.push(c);
					} else {
						earlier.push(c);
					}
				} else {
					earlier.push(c);
				}
			});

			const groups = [];
			if (today.length) groups.push({ label: '今天', items: today });
			if (yesterday.length) groups.push({ label: '昨天', items: yesterday });
			if (thisWeek.length) groups.push({ label: '一周内', items: thisWeek });
			if (earlier.length) groups.push({ label: '更早', items: earlier });

			return groups;
		},
	},
	onShow() {
		this.loadConversations();
	},
	// 下拉刷新
	onPullDownRefresh() {
		this.loadConversations().then(() => {
			uni.stopPullDownRefresh();
		});
	},
	methods: {
		async loadConversations() {
			try {
				const list = await get('/api/conversations');
				this.conversations = list;
				// 同步未读消息数到 store
				const totalUnread = list.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
				store.setUnreadCount(totalUnread);
			} catch (e) {
				this.conversations = [];
			}
		},
		goChat(conv) {
			uni.navigateTo({ url: '/pages/chat/index?id=' + conv.id });
		},
		goHome() {
			uni.switchTab({ url: '/pages/home/index' });
		},
		showActionSheet(conv) {
			uni.showActionSheet({
				itemList: ['标为已读', '置顶聊天', '删除对话'],
				success: (res) => {
					if (res.tapIndex === 0) {
						// 标为已读
						conv.unreadCount = 0;
						store.setUnreadCount(
							this.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
						);
						uni.showToast({ title: '已标为已读', icon: 'success', duration: 1200 });
					} else if (res.tapIndex === 1) {
						uni.showToast({ title: '已置顶', icon: 'success', duration: 1200 });
					} else if (res.tapIndex === 2) {
						uni.showModal({
							title: '删除对话',
							content: '确定删除与「' + conv.user.nickname + '」的对话吗？',
							success: (modalRes) => {
								if (modalRes.confirm) {
									this.conversations = this.conversations.filter(c => c.id !== conv.id);
									store.setUnreadCount(
										this.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
									);
									uni.showToast({ title: '已删除', icon: 'success', duration: 1200 });
								}
							},
						});
					}
				},
			});
		},
	},
};
</script>

<style scoped>
/* 顶部标题栏 */
.msg-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
}

.header-title {
	font-size: 40rpx;
	font-weight: 700;
	color: #1A1D28;
}

.header-actions {
	display: flex;
	gap: 16rpx;
}

.header-action-btn {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(31, 41, 88, 0.06);
	transition: all 0.15s;
}

.header-action-btn:active {
	background: #F2F3F8;
	transform: scale(0.95);
}

/* 搜索栏 */
.search-row {
	margin-bottom: 20rpx;
}

.search-input {
	width: 100%;
	height: 72rpx;
	padding: 0 28rpx;
	border-radius: 36rpx;
	background: #FFFFFF;
	font-size: 26rpx;
	color: #1A1D28;
	box-shadow: 0 2rpx 8rpx rgba(31, 41, 88, 0.06);
}

/* 分组标签 */
.group-label {
	padding: 16rpx 0 12rpx 8rpx;
}

.group-label text {
	font-size: 24rpx;
	font-weight: 600;
	color: #8B8FA3;
}

/* 消息卡片 */
.msg-card {
	display: flex;
	align-items: center;
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 24rpx;
	margin-bottom: 12rpx;
	box-shadow: 0 2rpx 12rpx rgba(31, 41, 88, 0.05);
	transition: all 0.15s;
	position: relative;
}

.msg-card:active {
	background: #F8F9FC;
	transform: scale(0.985);
}

/* 头像区域 */
.msg-avatar-wrap {
	position: relative;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.msg-avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.msg-avatar-text {
	font-size: 36rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.online-dot {
	position: absolute;
	bottom: 2rpx;
	right: 2rpx;
	width: 22rpx;
	height: 22rpx;
	border-radius: 50%;
	background: #22C55E;
	border: 3rpx solid #FFFFFF;
}

/* 信息区 */
.msg-info {
	flex: 1;
	min-width: 0;
}

.msg-top {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 8rpx;
}

.msg-name-row {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.msg-username {
	font-size: 30rpx;
	color: #1A1D28;
	font-weight: 600;
}

.msg-item-tag {
	display: inline-flex;
	align-self: flex-start;
	max-width: 280rpx;
	padding: 2rpx 12rpx;
	border-radius: 8rpx;
	background: #F8F9FC;
}

.msg-item-tag-text {
	font-size: 22rpx;
	color: #8B8FA3;
}

.msg-time {
	font-size: 22rpx;
	color: #6B6F80;
	flex-shrink: 0;
	margin-left: 12rpx;
	margin-top: 4rpx;
}

.msg-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.msg-preview {
	font-size: 24rpx;
	color: #8B8FA3;
	flex: 1;
	min-width: 0;
	line-height: 1.4;
}

.msg-badge {
	min-width: 36rpx;
	height: 36rpx;
	padding: 0 10rpx;
	border-radius: 18rpx;
	background: #EF4444;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 22rpx;
	color: #FFFFFF;
	font-weight: 600;
	margin-left: 12rpx;
	flex-shrink: 0;
	box-shadow: 0 2rpx 8rpx rgba(239, 68, 68, 0.3);
}

/* 空状态 */
.empty-illustration {
	margin-bottom: 24rpx;
}

.empty-illustration-icon {
	font-size: 100rpx;
}

.empty-sub {
	font-size: 24rpx;
	color: #6B6F80;
	margin-top: 8rpx;
	margin-bottom: 32rpx;
}

.empty-action {
	padding: 16rpx 48rpx;
	border-radius: 40rpx;
	background: linear-gradient(135deg, #4F6EF7, #3D56D4);
	box-shadow: 0 6rpx 20rpx rgba(79, 110, 247, 0.25);
	transition: all 0.15s;
}

.empty-action:active {
	transform: scale(0.95);
	box-shadow: 0 4rpx 14rpx rgba(79, 110, 247, 0.2);
}

.empty-action text {
	font-size: 28rpx;
	font-weight: 600;
	color: #FFFFFF;
}
</style>
