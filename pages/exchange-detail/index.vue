<template>
	<view class="page-container--clean">
		<view class="page-body">
			<view class="card">
				<!-- 帖子头部 -->
				<view class="post-header">
					<view class="post-user" @click="goUser(post.user)">
						<view class="avatar-placeholder avatar-lg">
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
					<AppIcon name="exchange" :size="44" color="#77C9F1" />
					<view class="exchange-item">
						<text class="ex-label">想换</text>
						<text class="ex-value">{{ post.wantItem.name }}</text>
					</view>
				</view>
			</view>

			<!-- 回复区 -->
			<view class="card">
				<text class="reply-title">回复 ({{ replies.length }})</text>
				<view v-if="replies.length === 0" class="empty-state empty-state-compact">
					<text class="empty-sub-text">暂无回复，快来第一个回复吧~</text>
				</view>
				<view v-else class="reply-list">
					<view v-for="r in replies" :key="r.id" class="reply-item">
						<view class="avatar-placeholder reply-avatar" :style="{ background: (r.user && r.user.avatarBg) || '#77C9F1' }">
							<text>{{ (r.user && r.user.nickname ? r.user.nickname : '?').charAt(0) }}</text>
						</view>
						<view class="reply-info">
							<view class="reply-top">
								<text class="reply-nickname">{{ r.user ? r.user.nickname : '拾闲用户' }}</text>
								<text class="reply-time">{{ r.time }}</text>
							</view>
							<text class="reply-content">{{ r.content }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 底部占位，防止回复列表被固定操作栏遮挡 -->
			<view class="detail-spacer"></view>

			<view class="detail-bottom">
				<view class="reply-input-wrap">
					<input
						class="reply-input"
						v-model="replyText"
						placeholder="写回复..."
						confirm-type="send"
						:adjust-position="true"
						@confirm="submitReply"
					/>
				</view>
				<view class="detail-bottom-btn btn-fav" @click="toggleCollect">
					<AppIcon :name="collected ? 'star-fill' : 'star'" :size="44" :color="collected ? '#F59E0B' : '#6B6F80'" />
					<text>{{ collected ? '已收藏' : '收藏' }}</text>
				</view>
				<view class="detail-bottom-btn btn-chat" @click="goChat">
					<AppIcon name="chat" :size="44" color="#FFF" />
					<text>私信</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get, post } from '@/utils/request.js';
import store from '@/utils/store.js';

const TAG_MAP = { wish: 'tag-hot', exchange: 'tag-barter', help: 'tag', group: 'tag-new' };
const LABEL_MAP = { wish: '求购心愿', exchange: '以物换物', help: '求助帮忙', group: '拼单' };

export default {
	components: { AppIcon },
	data() { return { post: {}, replies: [], replyText: '', collected: false, submitting: false }; },
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
			try {
				this.post = await get('/api/exchange-posts/' + id);
				this.loadReplies(id);
			} catch (e) {
				uni.showToast({ title: '帖子不存在', icon: 'none' });
			}
		},
		async loadReplies(id) {
			try {
				this.replies = await get('/api/exchange-posts/' + id + '/replies');
			} catch (e) {
				this.replies = [];
			}
		},
		async submitReply() {
			const content = this.replyText.trim();
			if (!content || this.submitting) return;
			this.submitting = true;
			try {
				const reply = await post('/api/exchange-posts/' + this.post.id + '/replies', { content });
				this.replies.push(reply);
				this.post.replyCount = (this.post.replyCount || 0) + 1;
				this.replyText = '';
				uni.showToast({ title: '回复成功', icon: 'success' });
			} catch (e) {
				uni.showToast({ title: '回复失败，请重试', icon: 'none' });
			} finally {
				this.submitting = false;
			}
		},
		toggleCollect() {
			this.collected = !this.collected;
			if (this.collected) this.post.favoriteCount = (this.post.favoriteCount || 0) + 1;
			else this.post.favoriteCount = Math.max(0, (this.post.favoriteCount || 1) - 1);
			uni.showToast({ title: this.collected ? '已收藏' : '已取消收藏', icon: 'success' });
		},
		goChat() {
			if (!store.isLoggedIn) { uni.reLaunch({ url: '/pages/login/index' }); return; }
			// 根据帖子ID和发布者ID生成唯一会话ID
			const userId = this.post.user ? this.post.user.id : 'unknown';
			const conversationId = 'exchange_' + this.post.id + '_' + userId;
			uni.navigateTo({ url: '/pages/chat/index?id=' + conversationId + '&itemId=' + this.post.id });
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
.post-nickname { font-size: 28rpx; font-weight: 500; color: #1A1D28; display: block; }
.post-time { font-size: 26rpx; color: #6B6F80; margin-top: 4rpx; }
.post-title { font-size: 34rpx; font-weight: 600; color: #1A1D28; display: block; margin-bottom: 16rpx; }
.post-desc { font-size: 28rpx; color: #6B6F80; line-height: 1.6; display: block; }

.reward-row { display: inline-flex; align-items: center; gap: 8rpx; background: #FFF3E0; padding: 10rpx 20rpx; border-radius: 8rpx; margin-top: 20rpx; }
.reward-text { font-size: 36rpx; color: #FF6B3D; font-weight: bold; }
.reward-label { font-size: 28rpx; color: #F59E0B; }

.exchange-box { display: flex; align-items: center; justify-content: space-between; background: #F8F9FC; border-radius: 16rpx; padding: 24rpx; margin-top: 20rpx; }
.exchange-item { display: flex; flex-direction: column; }
.ex-label { font-size: 26rpx; color: #6B6F80; margin-bottom: 6rpx; }
.ex-value { font-size: 28rpx; color: #1A1D28; font-weight: 500; }

.reply-title { font-size: 30rpx; font-weight: 600; color: #1A1D28; display: block; margin-bottom: 16rpx; }

.reply-list { display: flex; flex-direction: column; }
.reply-item { display: flex; align-items: flex-start; gap: 16rpx; padding: 20rpx 0; border-bottom: 1px solid #F0F3F9; }
.reply-item:last-child { border-bottom: none; }
.reply-avatar { width: 64rpx; height: 64rpx; font-size: 26rpx; flex-shrink: 0; }
.reply-info { flex: 1; min-width: 0; }
.reply-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6rpx; }
.reply-nickname { font-size: 26rpx; color: #1A1D28; font-weight: 500; }
.reply-time { font-size: 24rpx; color: #9AA3B5; }
.reply-content { font-size: 28rpx; color: #4A4E5E; line-height: 1.5; word-break: break-all; display: block; }

.detail-spacer { height: calc(140rpx + env(safe-area-inset-bottom)); }

.detail-bottom { position: fixed; left: 0; right: 0; bottom: 0; padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom)); background: #FFF; display: flex; align-items: center; gap: 16rpx; box-shadow: 0 -2rpx 16rpx rgba(31, 41, 88, 0.08); z-index: 100; }
.reply-input-wrap { flex: 1; min-width: 0; height: 88rpx; background: #F2F3F8; border-radius: 44rpx; display: flex; align-items: center; padding: 0 28rpx; }
.reply-input { flex: 1; height: 100%; font-size: 28rpx; color: #1A1D28; }
.detail-bottom-btn { width: 150rpx; height: 88rpx; border-radius: 44rpx; display: flex; align-items: center; justify-content: center; gap: 8rpx; font-size: 26rpx; font-weight: 500; flex-shrink: 0; }
.btn-fav { background: #F2F3F8; color: #6B6F80; }
.btn-chat { background: linear-gradient(135deg, #4F91C5 0%, #77C9F1 100%); color: #FFF; }
.empty-sub-text { font-size: 28rpx; color: #8B8FA3; }
.empty-state-compact { padding: 60rpx 0; }
.avatar-lg { width: 80rpx; height: 80rpx; font-size: 32rpx; }
</style>
