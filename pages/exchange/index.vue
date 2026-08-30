<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 搜索入口 -->
			<view class="search-barbox">
				<view class="search-bar" @click="goSearch">
					<image class="search-icon-img" src="/static/imgs/1.png" mode="aspectFit" />
					<text class="search-placeholder">搜索心愿、求助、置换信息…</text>
					<view class="search-filter">
						<image class="camera-icon-img" src="/static/imgs/camera.png" mode="aspectFit" />
					</view>
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

			<!-- 发帖入口 -->
			<view class="post-entry" @click="goPublish">
				<view class="post-entry-content">
					<image class="post-entry-icon" src="/static/logo/exchange-publish.png" mode="aspectFit" />
					<text class="post-entry-text">发布你的心愿或求助…</text>
				</view>
				<view class="btn-outline">发布</view>
			</view>

			<!-- 帖子列表：加载骨架屏 -->
			<view v-if="loading && filteredPosts.length === 0" class="post-list">
				<view class="card post-card" v-for="i in 4" :key="'sk' + i">
					<view class="skeleton-block" style="width:60%;height:32rpx;border-radius:8rpx;margin-bottom:16rpx;"></view>
					<view class="skeleton-block" style="width:100%;height:30rpx;border-radius:8rpx;margin-bottom:12rpx;"></view>
					<view class="skeleton-block" style="width:80%;height:24rpx;border-radius:8rpx;margin-bottom:20rpx;"></view>
					<view class="skeleton-block" style="width:40%;height:24rpx;border-radius:8rpx;"></view>
				</view>
			</view>

			<!-- 帖子列表 -->
			<view class="post-list" v-else>
				<view class="post-group">
				<view
					class="post-card anim-in"
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
								<AppIcon name="exchange" :size="44" color="#77C9F1" />
							</view>
							<view class="flow-item">
								<text class="flow-label">想换</text>
								<text class="flow-value">{{ post.wantItem ? post.wantItem.name : '?' }}</text>
							</view>
						</view>
					</view>

					<!-- 底部 -->
					<view class="post-footer">
						<view class="post-action" @click.stop="collectPost(post)">
							<image class="action-icon collect-icon" :class="{ collected: post.collected }" :src="post.collected ? collectFillIcon : collectIcon" mode="aspectFit" />
							<text class="action-text">{{ post.favoriteCount || 0 }}</text>
						</view>
						<view class="post-action" @click.stop="goPostDetail(post)">
							<image class="action-icon" :src="messageIcon" mode="aspectFit" />
							<text class="action-text">{{ post.replyCount || 0 }}</text>
						</view>
						<view class="post-action" @click.stop="goChat(post)">
							<image class="action-icon" :src="chatIcon" mode="aspectFit" />
							<text class="action-text">私信</text>
						</view>
					</view>
				</view>
				</view>

				<view v-if="loadError && filteredPosts.length === 0" class="error-state">
					<AppIcon name="close" :size="56" color="#EF4444" />
					<text class="error-text">加载失败，请检查网络后重试</text>
					<view class="retry-btn" @click="loadPosts"><text>重新加载</text></view>
				</view>
				<view class="empty-state" v-else-if="filteredPosts.length === 0">
					<view class="empty-icon"><AppIcon name="exchange" :size="72" color="#9AA3B5" /></view>
					<text>暂无相关内容</text>
					<text class="mt-8 empty-sub-text">快去发布第一条互助帖吧~</text>
				</view>
			</view>
		</view>

		<CustomTabBar :current="1" />
		<BackTop :visible="showBackTop" />
	</view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';
import BackTop from '@/components/BackTop.vue';
import { get } from '@/utils/request.js';
import store from '@/utils/store.js';

const TAG_CLASS_MAP = { wish: 'tag-hot', exchange: 'tag-barter', help: 'tag', group: 'tag-new' };
const TAG_LABEL_MAP = { wish: '求购', exchange: '以物换物', help: '求助', group: '拼单' };

export default {
	components: { CustomTabBar, AppIcon, BackTop },
	data() {
		return {
			tabList: ['全部', '求购心愿', '以物换物', '求助帮忙', '拼单', '其他'],
			currentTab: 0,
			posts: [],
			loadError: false,
			loading: false,
			showBackTop: false,
			collectIcon: require('@/imgs/收藏.png'),
			collectFillIcon: require('@/imgs/收藏-fill.png'),
			chatIcon: require('@/imgs/私信.png'),
			messageIcon: require('@/imgs/消息.png'),
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
	},
	onPullDownRefresh() {
		this.loadPosts().then(() => {
			uni.stopPullDownRefresh();
		});
	},
	onPageScroll(e) {
		this.showBackTop = e.scrollTop > 400;
	},
	methods: {
		getTagClass(post) {
			return (TAG_CLASS_MAP[post.type] || 'tag') + ' tag';
		},
		getTagLabel(post) {
			return post.tab || TAG_LABEL_MAP[post.type] || '其他';
		},
		async loadPosts() {
			this.loading = true;
			try {
				const data = await get('/api/exchange-posts', { page: 1, pageSize: 20 });
				this.posts = (data.list || []).map((p) => ({
					...p,
					collected: false,
				}));
				this.loadError = false;
			} catch (e) {
				this.posts = [];
				this.loadError = true;
			} finally {
				this.loading = false;
			}
		},
		switchTab(i) {
			// 再次点击已选中的分类则取消筛选，回到「全部」
			this.currentTab = (this.currentTab === i) ? 0 : i;
		},
		collectPost(post) {
			post.collected = !post.collected;
			if (post.collected) post.favoriteCount = (post.favoriteCount || 0) + 1;
			else post.favoriteCount = Math.max(0, (post.favoriteCount || 1) - 1);
		},
		goSearch() {
			uni.navigateTo({
				url: '/pages/search/index',
				
			});
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
			// 根据帖子ID和发布者ID生成唯一会话ID
			const userId = post.user ? post.user.id : 'unknown';
			const conversationId = 'exchange_' + post.id + '_' + userId;
			uni.navigateTo({ url: '/pages/chat/index?id=' + conversationId + '&exchangeId=' + post.id });
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';
.search-barbox{
	position: sticky; top: 0; z-index: 20;
	margin: 0 -20rpx 20rpx;
	background: linear-gradient(180deg, #4F91C5 0%, #77C9F1 100%);
	padding: 24rpx 24rpx 28rpx;
	border-radius: 0 0 32rpx 32rpx;
}
.search-barbox .search-bar{
	background: #FFFFFF;
	border: none;
	box-shadow: 0 6rpx 18rpx rgba(56, 108, 148, 0.12);
	border-radius: 48rpx;
	padding: 20rpx 28rpx;
}
.search-filter {
	width: 56rpx; height: 56rpx; border-radius: 50%;
	background: #EAF1FE; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.search-icon-img { width: 44rpx; height: 44rpx; flex-shrink: 0; }
.camera-icon-img { width: 38rpx; height: 38rpx; }
.tab-section { margin-bottom: 20rpx; }
.tab-chip {
	flex-shrink: 0; padding: 12rpx 28rpx; border-radius: 30rpx; font-size: 28rpx;
	color: #5B6675; background: #FFF; white-space: nowrap; transition: all 0.2s;
}
.tab-chip.active { color: #FFF; background: #4F91C5; font-weight: 500; }
.post-entry {
	display: flex; align-items: center; justify-content: space-between;
	background: #FFF; border-radius: 16rpx; padding: 18rpx 24rpx; margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(56, 108, 148, 0.06);
}
.post-entry-content { display: flex; align-items: center; gap: 14rpx; }
.post-entry-icon { width: 44rpx; height: 44rpx; flex-shrink: 0; }
.post-entry-text { font-size: 30rpx; color: #5B6675; }

/* 帖子分组：白底容器 + 内部细分隔线，避免区块堆叠 */
.post-group {
	background: #FFF;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(56, 108, 148, 0.06);
	margin-bottom: 20rpx;
}
.post-group .post-card {
	background: #FFF;
	border-radius: 0;
	box-shadow: none;
	margin-bottom: 0;
	padding: 24rpx;
}
.post-group .post-card + .post-card {
	border-top: 1px solid #F0F3F9;
}
.post-group .post-card:nth-child(2) { animation-delay: 60ms; }
.post-group .post-card:nth-child(3) { animation-delay: 120ms; }
.post-group .post-card:nth-child(4) { animation-delay: 180ms; }
.post-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.post-user { display: flex; align-items: center; gap: 14rpx; }
.user-avatar-post { width: 64rpx; height: 64rpx; font-size: 28rpx; flex-shrink: 0; }
.post-nickname { font-size: 30rpx; color: #1A1D28; font-weight: 500; }
.post-time { font-size: 26rpx; color: #5B6675; margin-top: 2rpx; }
.post-title { font-size: 32rpx; color: #1A1D28; font-weight: 600; display: block; margin-bottom: 10rpx; }
.post-desc { font-size: 28rpx; color: #5B6675; line-height: 1.5; display: block; margin-bottom: 14rpx; }
.post-reward {
	display: inline-flex; align-items: center; gap: 8rpx;
	background: #FFF3E0; padding: 6rpx 16rpx; border-radius: 8rpx; margin-bottom: 14rpx;
}
.reward-text { font-size: 30rpx; color: #FF5A36; font-weight: bold; }
.reward-label { font-size: 26rpx; color: #F59E0B; }
.exchange-info { background: #F3F7FE; border-radius: 16rpx; padding: 20rpx; margin-bottom: 16rpx; }
.exchange-flow { display: flex; align-items: center; justify-content: space-between; }
.flow-item { display: flex; flex-direction: column; flex: 1; }
.flow-label { font-size: 26rpx; color: #5B6675; margin-bottom: 4rpx; }
.flow-value { font-size: 26rpx; color: #1A1D28; font-weight: 500; }
.flow-arrow { padding: 0 16rpx; }
.post-footer {
	display: flex; align-items: center; gap: 30rpx; padding-top: 16rpx; border-top: 1px solid #F0F3F9;
}
.post-action { display: flex; align-items: center; gap: 6rpx; padding: 4rpx 0; }
.action-icon { width: 36rpx; height: 36rpx; flex-shrink: 0; }
.collect-icon { opacity: 0.4; transition: opacity 0.2s; }
.collect-icon.collected { opacity: 1; }
.action-text { font-size: 28rpx; color: #5B6675; }
.empty-sub-text { font-size: 28rpx; color: #667384; }
</style>
