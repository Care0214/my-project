<template>
	<view class="page-container--clean">
		<view class="page-body">
			<view class="detail-image">
				<image v-if="item.images && item.images.length > 0" :src="item.images[0]" class="detail-image__img" mode="aspectFill" />
				<view v-else class="detail-image-placeholder">
					<AppIcon name="lease" :size="80" color="#CCC" />
				</view>
				<view class="tag tag-lease detail-tag">可租</view>
			</view>

			<view class="card">
				<view class="detail-price-row">
					<view class="lease-price-main">
						<text class="price-num">¥{{ item.price }}</text>
						<text class="price-unit">/天</text>
					</view>
					<view class="deposit-badge">
						<text class="deposit-label">押金 ¥{{ item.deposit }}</text>
					</view>
				</view>
				<text class="detail-title">{{ item.title }}</text>
				<text class="detail-desc">{{ item.desc }}</text>
			</view>

			<!-- 出租方 -->
			<view class="card seller-card" v-if="item.user">
				<view class="seller-row" @click="goUser(item.user)">
					<view class="seller-avatar">
						<text class="seller-avatar-text">{{ item.user.nickname.charAt(0) }}</text>
					</view>
					<view class="seller-info">
						<text class="seller-name">{{ item.user.nickname }}</text>
						<text class="seller-campus">{{ item.campus }}</text>
					</view>
					<view class="seller-chat-btn" @click.stop="goChat">
						<text>联系出租方</text>
					</view>
				</view>
			</view>

			<view class="card">
				<view class="info-row"><text class="info-label">分类</text><text class="info-value">{{ item.category }}</text></view>
				<view class="info-row"><text class="info-label">校区</text><text class="info-value">{{ item.campus }}</text></view>
				<view class="info-row"><text class="info-label">押金</text><text class="info-value">¥{{ item.deposit }}</text></view>
			</view>

			<view class="detail-bottom">
				<view class="detail-bottom-btn btn-fav" @click="toggleFav">
					<AppIcon :name="liked ? 'heart-fill' : 'heart'" :size="40" :color="liked ? '#FF4D4F' : '#999'" />
					<text>收藏</text>
				</view>
				<view class="detail-bottom-btn btn-chat" @click="goChat">
					<AppIcon name="chat" :size="40" color="#FFF" />
					<text>联系出租方</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get } from '@/utils/request.js';
import store from '@/utils/store.js';

export default {
	components: { AppIcon },
	data() { return { item: {}, liked: false }; },
	onLoad(options) {
		if (options.id) this.loadItem(options.id);
	},
	methods: {
		async loadItem(id) {
			try { this.item = await get('/api/lease-items/' + id); } catch (e) {
				uni.showToast({ title: '物品不存在', icon: 'none' });
			}
		},
		toggleFav() { this.liked = !this.liked; uni.showToast({ title: this.liked ? '已收藏' : '已取消', icon: 'success' }); },
		goChat() {
			if (!store.isLoggedIn) { uni.reLaunch({ url: '/pages/login/index' }); return; }
			uni.navigateTo({ url: '/pages/chat/index?id=conv1' });
		},
		goUser(user) {
			if (!user || !user.id) return;
			uni.navigateTo({ url: '/pages/user/index?id=' + user.id });
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.detail-image { width: 100%; height: 450rpx; position: relative; overflow: hidden; }
.detail-image__img { width: 100%; height: 100%; }
.detail-image-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #F5F5F5, #ECECEC); display: flex; align-items: center; justify-content: center; }
.detail-tag { position: absolute; top: 20rpx; right: 20rpx; padding: 8rpx 20rpx; font-size: 24rpx; border-radius: 20rpx; }

.detail-price-row { display: flex; align-items: center; justify-content: space-between; }
.lease-price-main { display: flex; align-items: baseline; gap: 4rpx; }
.price-num { font-size: 52rpx; font-weight: bold; color: #FF6B3D; }
.price-unit { font-size: 26rpx; color: #FF6B3D; }
.deposit-badge { padding: 10rpx 20rpx; background: #FFF3E0; border-radius: 8rpx; }
.deposit-label { font-size: 24rpx; color: #FF9800; font-weight: 500; }
.detail-title { font-size: 34rpx; font-weight: 600; color: #333; display: block; margin-top: 16rpx; }
.detail-desc { font-size: 28rpx; color: #666; line-height: 1.6; display: block; margin-top: 16rpx; }

.seller-card { padding: 24rpx; }
.seller-row { display: flex; align-items: center; gap: 16rpx; }
.seller-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: linear-gradient(135deg, #E0E0E0, #D0D0D0); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.seller-avatar-text { font-size: 32rpx; font-weight: bold; color: #FFF; }
.seller-info { flex: 1; }
.seller-name { font-size: 30rpx; font-weight: 600; color: #333; display: block; }
.seller-campus { font-size: 24rpx; color: #999; margin-top: 4rpx; }
.seller-chat-btn { padding: 14rpx 28rpx; background: #EDF0FE; border-radius: 30rpx; font-size: 26rpx; color: #4F6EF7; font-weight: 500; }

.info-row { display: flex; justify-content: space-between; padding: 20rpx 0; }
.info-row + .info-row { border-top: 1px solid #F5F5F5; }
.info-label { font-size: 26rpx; color: #999; }
.info-value { font-size: 26rpx; color: #333; }

.detail-bottom { position: fixed; left: 0; right: 0; bottom: 0; padding: 16rpx 30rpx calc(16rpx + env(safe-area-inset-bottom)); background: #FFF; display: flex; gap: 20rpx; box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.06); z-index: 100; }
.detail-bottom-btn { flex: 1; height: 88rpx; border-radius: 44rpx; display: flex; align-items: center; justify-content: center; gap: 10rpx; font-size: 28rpx; font-weight: 500; }
.btn-fav { background: #F5F5F5; color: #999; }
.btn-chat { background: linear-gradient(135deg, #4F6EF7, #6366F1); color: #FFF; }
</style>
