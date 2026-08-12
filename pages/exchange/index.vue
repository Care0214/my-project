<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 搜索+消息入口 -->
			<view class="search-barbox">
				<view class="exchange-header">
					<view class="search-bar flex-1" @click="goSearch">
						<AppIcon name="search" :size="36" color="#999" />
						<text class="search-placeholder">搜索心愿、求助、置换信息…</text>
					</view>
					<view class="message-btn" @click="goMessages">
						<AppIcon name="message" :size="40" color="#666" />
						<view class="badge" v-if="unreadCount > 0">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
					</view>
				</view>
				<!-- 分类切换 Tab -->
				<view class="tab-section">
					<view class="scroll-x">
						<text
							v-for="(tab, i) in tabList"
							:key="i"
							:class="['tab-chip', { active: currentTab === i }]"
							@click="switchTab(i)"
						>{{ tab }}</text>
					</view>
				</view>
			</view>

			<!-- 发帖入口 -->
			<view class="post-entry" @click="goPublish">
				<view class="post-entry-content">
					<AppIcon name="edit" :size="36" color="#4F6EF7" />
					<text class="post-entry-text">发布你的心愿或求助…</text>
				</view>
				<view class="btn-outline">发布</view>
			</view>

			<!-- 帖子列表 -->
			<view class="post-list">
				<view
					class="card post-card"
					v-for="post in filteredPosts"
					:key="post.id"
					@click="goPostDetail(post)"
				>
					<view class="post-header">
						<view class="post-user">
							<view class="avatar-placeholder user-avatar-post">
								<text>{{ post.user.nickname.charAt(0) }}</text>
							</view>
							<view class="post-user-info">
								<text class="post-nickname">{{ post.user.nickname }}</text>
								<text class="post-time">{{ post.createdAtText }} · {{ post.campus }}</text>
							</view>
						</view>
						<view :class="['tag', getTagClass(post)]">{{ getTagLabel(post) }}</view>
					</view>

					<text class="post-title">{{ post.title }}</text>
					<text class="post-desc text-ellipsis-2">{{ post.description }}</text>

					<!-- 悬赏金额 -->
					<view class="post-reward" v-if="post.reward">
						<text class="reward-text">¥{{ post.reward }}</text>
						<text class="reward-label">感谢费</text>
					</view>

					<!-- 交换信息区 -->
					<view v-if="post.type === 'exchange'" class="exchange-info">
						<view class="exchange-flow">
							<view class="flow-item">
								<text class="flow-label">我有</text>
								<text class="flow-value">{{ post.myItem ? post.myItem.name : '?' }}</text>
							</view>
							<view class="flow-arrow">
								<AppIcon name="exchange" :size="32" color="#4F6EF7" />
							</view>
							<view class="flow-item">
								<text class="flow-label">想换</text>
								<text class="flow-value">{{ post.wantItem ? post.wantItem.name : '?' }}</text>
							</view>
						</view>
					</view>

					<!-- 底部 -->
					<view class="post-footer">
						<view class="post-action" @click.stop="likePost(post)">
							<AppIcon :name="post.liked ? 'heart-fill' : 'heart'" :size="32" :color="post.liked ? '#FF4D4F' : '#CCC'" />
							<text class="action-text">{{ post.replyCount || 0 }}</text>
						</view>
						<view class="post-action" @click.stop="goChat(post)">
							<AppIcon name="chat-bubble" :size="30" color="#CCC" />
							<text class="action-text">私信</text>
						</view>
					</view>
				</view>

				<view v-if="loadError && filteredPosts.length === 0" class="error-state">
					<text class="error-icon">⚠️</text>
					<text class="error-text">加载失败，请检查网络后重试</text>
					<view class="retry-btn" @click="loadPosts"><text>重新加载</text></view>
				</view>
				<view class="empty-state" v-else-if="filteredPosts.length === 0">
					<view class="empty-icon"><AppIcon name="exchange" :size="80" color="#CCC" /></view>
					<text>暂无相关内容</text>
					<text class="mt-8" style="font-size:24rpx;color:#CCC;">快去发布第一条互助帖吧~</text>
				</view>
			</view>
		</view>

		<CustomTabBar :current="1" />
	</view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';
import { get } from '@/utils/request.js';
import store from '@/utils/store.js';

const TAG_CLASS_MAP = { wish: 'tag-hot', exchange: 'tag-barter', help: 'tag', group: 'tag-new' };
const TAG_LABEL_MAP = { wish: '求购', exchange: '以物换物', help: '求助', group: '拼单' };

export default {
	components: { CustomTabBar, AppIcon },
	data() {
		return {
			tabList: ['全部', '求购心愿', '以物换物', '求助帮忙', '拼单', '其他'],
			currentTab: 0,
			posts: [],
			unreadCount: 0,
			loadError: false,
		};
	},
	computed: {
		filteredPosts() {
			if (this.currentTab === 0) return this.posts;
			const activeTab = this.tabList[this.currentTab];
			return this.posts.filter((p) => p.tab === activeTab);
		},
	},
	mounted() {
		this.loadPosts();
		this.loadUnreadCount();
	},
	onShow() {
		this.loadUnreadCount();
	},
	methods: {
		getTagClass(post) {
			return (TAG_CLASS_MAP[post.type] || 'tag') + ' tag';
		},
		getTagLabel(post) {
			return post.tab || TAG_LABEL_MAP[post.type] || '其他';
		},
		async loadPosts() {
			try {
				const data = await get('/api/exchange-posts', { page: 1, pageSize: 20 });
				this.posts = (data.list || []).map((p) => ({
					...p,
					liked: false,
				}));
				this.loadError = false;
			} catch (e) {
				this.posts = [];
				this.loadError = true;
			}
		},
		async loadUnreadCount() {
			try {
				const data = await get('/api/conversations/unread-count');
				this.unreadCount = data.count || 0;
				if (store.setUnreadCount) store.setUnreadCount(this.unreadCount);
			} catch (e) { /* ignore */ }
		},
		switchTab(i) {
			this.currentTab = i;
		},
		likePost(post) {
			post.liked = !post.liked;
			if (post.liked) post.replyCount = (post.replyCount || 0) + 1;
			else post.replyCount = Math.max(0, (post.replyCount || 1) - 1);
		},
		goSearch() {
			uni.navigateTo({ url: '/pages/search/index' });
		},
		goMessages() {
			uni.navigateTo({ url: '/pages/mine/messages/index' });
		},
		goPublish() {
			if (!store.isLoggedIn) {
				uni.reLaunch({ url: '/pages/login/index' });
				return;
			}
			uni.navigateTo({ url: '/pages/publish/index' });
		},
		goPostDetail(post) {
			uni.navigateTo({ url: '/pages/exchange-detail/index?id=' + post.id });
		},
		goChat(post) {
			if (!store.isLoggedIn) {
				uni.reLaunch({ url: '/pages/login/index' });
				return;
			}
			uni.navigateTo({ url: '/pages/chat/index?id=conv1&exchangeId=' + post.id });
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';
.search-barbox{
	position: sticky;
	background-color: #FFF;
	z-index: 10000;
	top: 0%;
}
.exchange-header { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; }
.exchange-header .search-bar { margin-bottom: 0; }
.message-btn {
	position: relative; width: 80rpx; height: 80rpx; background: #FFF; border-radius: 50%;
	display: flex; align-items: center; justify-content: center;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04); flex-shrink: 0;
}
.tab-section { margin-bottom: 20rpx; }
.tab-chip {
	flex-shrink: 0; padding: 12rpx 28rpx; border-radius: 30rpx; font-size: 26rpx;
	color: #666; background: #FFF; white-space: nowrap; transition: all 0.2s;
}
.tab-chip.active { color: #FFF; background: #4F6EF7; font-weight: 500; }
.post-entry {
	display: flex; align-items: center; justify-content: space-between;
	background: #FFF; border-radius: 16rpx; padding: 18rpx 24rpx; margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.post-entry-content { display: flex; align-items: center; gap: 14rpx; }
.post-entry-text { font-size: 28rpx; color: #999; }
.post-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.post-user { display: flex; align-items: center; gap: 14rpx; }
.user-avatar-post { width: 64rpx; height: 64rpx; font-size: 24rpx; flex-shrink: 0; }
.post-nickname { font-size: 28rpx; color: #333; font-weight: 500; }
.post-time { font-size: 22rpx; color: #999; margin-top: 2rpx; }
.post-title { font-size: 32rpx; color: #333; font-weight: 600; display: block; margin-bottom: 10rpx; }
.post-desc { font-size: 26rpx; color: #999; line-height: 1.5; display: block; margin-bottom: 14rpx; }
.post-reward {
	display: inline-flex; align-items: center; gap: 8rpx;
	background: #FFF3E0; padding: 6rpx 16rpx; border-radius: 8rpx; margin-bottom: 14rpx;
}
.reward-text { font-size: 30rpx; color: #FF6B3D; font-weight: bold; }
.reward-label { font-size: 22rpx; color: #FF9800; }
.exchange-info { background: #F8F9FC; border-radius: 12rpx; padding: 20rpx; margin-bottom: 16rpx; }
.exchange-flow { display: flex; align-items: center; justify-content: space-between; }
.flow-item { display: flex; flex-direction: column; flex: 1; }
.flow-label { font-size: 20rpx; color: #B0B4C0; margin-bottom: 4rpx; }
.flow-value { font-size: 26rpx; color: #1A1D28; font-weight: 500; }
.flow-arrow { padding: 0 16rpx; }
.post-footer {
	display: flex; align-items: center; gap: 30rpx; padding-top: 16rpx; border-top: 1px solid #F5F5F5;
}
.post-action { display: flex; align-items: center; gap: 6rpx; padding: 4rpx 0; }
.action-text { font-size: 24rpx; color: #CCC; }
</style>
