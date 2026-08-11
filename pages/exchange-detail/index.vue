<template>
	<view class="page-container--clean">
		<view class="page-body">
			<view class="card">
				<!-- 帖子头部 -->
				<view class="post-header">
					<view class="post-user" @click="goUser(post.user)">
						<view class="avatar-placeholder" style="width:80rpx;height:80rpx;font-size:32rpx;">
							<text>{{ post.user ? post.user.nickname.charAt(0) : '?' }}</text>
						</view>
						<view class="post-user-info">
							<text class="post-nickname">{{ post.user ? post.user.nickname : '?' }}</text>
							<text class="post-time">{{ post.createdAtText }} · {{ post.campus }}</text>
						</view>
					</view>
					<view :class="['tag', tagClass]">{{ tagLabel }}</view>
				</view>

				<text class="post-title">{{ post.title }}</text>
				<text class="post-desc">{{ post.description }}</text>

				<!-- 悬赏 -->
				<view class="reward-row" v-if="post.reward">
					<text class="reward-text">¥{{ post.reward }}</text>
					<text class="reward-label">感谢费</text>
				</view>

				<!-- 交换信息 -->
				<view v-if="post.type === 'exchange' && post.myItem" class="exchange-box">
					<view class="exchange-item">
						<text class="ex-label">我有</text>
						<text class="ex-value">{{ post.myItem.name }}</text>
					</view>
					<AppIcon name="exchange" :size="40" color="#4F6EF7" />
					<view class="exchange-item">
						<text class="ex-label">想换</text>
						<text class="ex-value">{{ post.wantItem.name }}</text>
					</view>
				</view>
			</view>

			<!-- 回复区 -->
			<view class="card">
				<text class="reply-title">回复 ({{ post.replyCount || 0 }})</text>
				<view class="empty-state" style="padding:60rpx 0;">
					<text style="color:#CCC;">暂无回复，快来第一个回复吧~</text>
				</view>
			</view>

			<view class="detail-bottom">
				<view class="detail-bottom-btn btn-fav" @click="toggleLike">
					<AppIcon :name="liked ? 'heart-fill' : 'heart'" :size="40" :color="liked ? '#FF4D4F' : '#999'" />
					<text>{{ liked ? '已赞' : '点赞' }}</text>
				</view>
				<view class="detail-bottom-btn btn-chat" @click="goChat">
					<AppIcon name="chat" :size="40" color="#FFF" />
					<text>私信</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get } from '@/utils/request.js';
import store from '@/utils/store.js';

const TAG_MAP = { wish: 'tag-hot', exchange: 'tag-barter', help: 'tag', group: 'tag-new' };
const LABEL_MAP = { wish: '求购心愿', exchange: '以物换物', help: '求助帮忙', group: '拼单' };

export default {
	components: { AppIcon },
	data() { return { post: {}, liked: false }; },
	computed: {
		tagClass() { return TAG_MAP[this.post.type] || 'tag'; },
		tagLabel() { return this.post.tab || LABEL_MAP[this.post.type] || '其他'; },
	},
	onLoad(options) {
		if (options.id) this.loadPost(options.id);
	},
	onShareAppMessage() {
		return {
			title: this.post.title || '拾闲小栈 - 校园互助',
			desc: (this.post.description || '').slice(0, 30),
			path: '/pages/exchange-detail/index?id=' + this.post.id,
			imageUrl: '/static/logo.png',
		};
	},
	methods: {
		async loadPost(id) {
			try { this.post = await get('/api/exchange-posts/' + id); } catch (e) {
				uni.showToast({ title: '帖子不存在', icon: 'none' });
			}
		},
		toggleLike() { this.liked = !this.liked; uni.showToast({ title: this.liked ? '已点赞' : '已取消', icon: 'success' }); },
		goChat() {
			if (!store.isLoggedIn) { uni.reLaunch({ url: '/pages/login/index' }); return; }
			uni.navigateTo({ url: '/pages/chat/index?id=conv1' });
		},
		goUser(user) {
			if (!user || !user.id || user.anonymous) return;
			uni.navigateTo({ url: '/pages/user/index?id=' + user.id });
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.post-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20rpx; }
.post-user { display: flex; align-items: center; gap: 16rpx; }
.post-nickname { font-size: 28rpx; font-weight: 500; color: #333; display: block; }
.post-time { font-size: 22rpx; color: #999; margin-top: 4rpx; }
.post-title { font-size: 34rpx; font-weight: 600; color: #333; display: block; margin-bottom: 16rpx; }
.post-desc { font-size: 28rpx; color: #666; line-height: 1.6; display: block; }

.reward-row { display: inline-flex; align-items: center; gap: 8rpx; background: #FFF3E0; padding: 10rpx 20rpx; border-radius: 8rpx; margin-top: 20rpx; }
.reward-text { font-size: 36rpx; color: #FF6B35; font-weight: bold; }
.reward-label { font-size: 24rpx; color: #FF9800; }

.exchange-box { display: flex; align-items: center; justify-content: space-between; background: #F8F9FC; border-radius: 14rpx; padding: 24rpx; margin-top: 20rpx; }
.exchange-item { display: flex; flex-direction: column; }
.ex-label { font-size: 22rpx; color: #B0B4C0; margin-bottom: 6rpx; }
.ex-value { font-size: 28rpx; color: #333; font-weight: 500; }

.reply-title { font-size: 30rpx; font-weight: 600; color: #333; display: block; margin-bottom: 16rpx; }

.detail-bottom { position: fixed; left: 0; right: 0; bottom: 0; padding: 16rpx 30rpx calc(16rpx + env(safe-area-inset-bottom)); background: #FFF; display: flex; gap: 20rpx; box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.06); z-index: 100; }
.detail-bottom-btn { flex: 1; height: 88rpx; border-radius: 44rpx; display: flex; align-items: center; justify-content: center; gap: 10rpx; font-size: 28rpx; font-weight: 500; }
.btn-fav { background: #F5F5F5; color: #999; }
.btn-chat { background: linear-gradient(135deg, #4F6EF7, #6366F1); color: #FFF; }
</style>
