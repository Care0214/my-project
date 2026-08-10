<template>
	<view class="page-container--clean">
		<view class="page-body">
			<!-- 物品图片区 -->
			<view class="detail-image" :style="{ background: item.imageBg || '#F3F4F8' }">
				<view class="detail-image-placeholder">
					<AppIcon name="image" :size="80" color="#CCC" />
				</view>
				<view class="detail-type-tag">
					{{ item.type === 'sell' ? '出售' : item.type === 'lease' ? '出租' : '置换' }}
				</view>
			</view>

			<!-- 价格 & 标题 -->
			<view class="detail-header card">
				<view class="detail-price-row">
					<text class="detail-price" v-if="item.price">¥{{ item.price }}</text>
					<text class="detail-free" v-else>免费</text>
					<view class="detail-actions">
						<view class="detail-action-btn" @click="toggleFavorite">
							<AppIcon :name="isFavorited ? 'heart-fill' : 'heart'" :size="36" :color="isFavorited ? '#FF4D4F' : '#CCC'" />
						</view>
					</view>
				</view>
				<text class="detail-title">{{ item.title }}</text>
				<text class="detail-desc">{{ item.description }}</text>
			</view>

			<!-- 卖家信息 -->
			<view class="card seller-card">
				<view class="seller-row">
					<view class="seller-avatar" :style="{ background: item.seller ? item.seller.avatarBg || '#E0E0E0' : '#E0E0E0' }">
						<text class="seller-avatar-text">{{ item.seller ? item.seller.nickname.charAt(0) : '?' }}</text>
					</view>
					<view class="seller-info">
						<text class="seller-name">{{ item.seller ? item.seller.nickname : '匿名' }}</text>
						<text class="seller-campus">{{ item.campus || item.location || '' }}</text>
					</view>
					<view class="seller-chat-btn" @click="goChat">
						<text>联系卖家</text>
					</view>
				</view>
			</view>

			<!-- 物品信息 -->
			<view class="card">
				<view class="info-row">
					<text class="info-label">分类</text>
					<text class="info-value">{{ categoryName }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">发布时间</text>
					<text class="info-value">{{ item.publishTimeText }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">浏览</text>
					<text class="info-value">{{ item.viewCount }} 次</text>
				</view>
			</view>

			<!-- 底部操作 -->
			<view class="detail-bottom">
				<view class="detail-bottom-btn btn-fav" @click="toggleFavorite">
					<AppIcon :name="isFavorited ? 'heart-fill' : 'heart'" :size="40" :color="isFavorited ? '#FF4D4F' : '#999'" />
					<text>收藏</text>
				</view>
				<view class="detail-bottom-btn btn-chat" @click="goChat">
					<AppIcon name="chat" :size="40" color="#FFF" />
					<text>私聊</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get, post, del as delApi } from '@/utils/request.js';
import store from '@/utils/store.js';

export default {
	components: { AppIcon },
	data() {
		return {
			item: {},
			isFavorited: false,
			categories: [],
		};
	},
	computed: {
		categoryName() {
			const cat = this.categories.find((c) => c.id === this.item.categoryId);
			return cat ? cat.name : '其他';
		},
	},
	onLoad(options) {
		if (options.id) {
			this.loadItem(options.id);
		}
		this.loadCategories();
	},
	methods: {
		async loadItem(id) {
			try {
				this.item = await get('/api/items/' + id);
				// 保存浏览记录
				post('/api/browse-history', {
					itemId: id, title: this.item.title, price: this.item.price,
					type: this.item.type, category: this.item.categoryId,
				}).catch(() => {});
			} catch (e) {
				uni.showToast({ title: '物品不存在', icon: 'none' });
			}
		},
		async loadCategories() {
			try { this.categories = await get('/api/categories'); } catch (e) { /* */ }
		},
		toggleFavorite() {
			this.isFavorited = !this.isFavorited;
			if (this.isFavorited) {
				post('/api/favorites', { itemId: this.item.id }).catch(() => {});
				uni.showToast({ title: '已收藏', icon: 'success' });
			} else {
				delApi('/api/favorites/' + this.item.id).catch(() => {});
				uni.showToast({ title: '已取消收藏', icon: 'success' });
			}
		},
		goChat() {
			if (!store.isLoggedIn) {
				uni.reLaunch({ url: '/pages/login/index' });
				return;
			}
			uni.navigateTo({ url: '/pages/chat/index?id=conv1' });
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.detail-image { width: 100%; height: 500rpx; position: relative; overflow: hidden; }
.detail-image-placeholder {
	width: 100%; height: 100%; background: linear-gradient(135deg, #F5F5F5, #ECECEC);
	display: flex; align-items: center; justify-content: center;
}
.detail-type-tag {
	position: absolute; top: 20rpx; right: 20rpx; padding: 8rpx 20rpx;
	background: rgba(0, 0, 0, 0.55); color: #FFF; font-size: 24rpx; border-radius: 20rpx;
}

.detail-price-row { display: flex; align-items: center; justify-content: space-between; }
.detail-price { font-size: 52rpx; font-weight: bold; color: #FF6B3D; }
.detail-free { font-size: 44rpx; font-weight: bold; color: #22C55E; }
.detail-title { font-size: 34rpx; font-weight: 600; color: #1A1D28; display: block; margin-top: 16rpx; }
.detail-desc { font-size: 28rpx; color: #666; line-height: 1.6; display: block; margin-top: 16rpx; }

.seller-card { padding: 24rpx; }
.seller-row { display: flex; align-items: center; gap: 16rpx; }
.seller-avatar {
	width: 80rpx; height: 80rpx; border-radius: 50%; flex-shrink: 0;
	display: flex; align-items: center; justify-content: center;
}
.seller-avatar-text { font-size: 32rpx; font-weight: bold; color: #FFF; }
.seller-info { flex: 1; }
.seller-name { font-size: 30rpx; font-weight: 600; color: #333; display: block; }
.seller-campus { font-size: 24rpx; color: #999; margin-top: 4rpx; }
.seller-chat-btn {
	padding: 14rpx 28rpx; background: #EDF0FE; border-radius: 30rpx;
	font-size: 26rpx; color: #4F6EF7; font-weight: 500;
}

.info-row { display: flex; justify-content: space-between; padding: 20rpx 0; }
.info-row + .info-row { border-top: 1px solid #F5F5F5; }
.info-label { font-size: 26rpx; color: #999; }
.info-value { font-size: 26rpx; color: #333; }

.detail-bottom {
	position: fixed; left: 0; right: 0; bottom: 0; padding: 16rpx 30rpx calc(16rpx + env(safe-area-inset-bottom));
	background: #FFF; display: flex; gap: 20rpx; box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.06);
	z-index: 100;
}
.detail-bottom-btn {
	flex: 1; height: 88rpx; border-radius: 44rpx; display: flex;
	align-items: center; justify-content: center; gap: 10rpx; font-size: 28rpx; font-weight: 500;
}
.btn-fav { background: #F5F5F5; color: #999; }
.btn-chat { background: linear-gradient(135deg, #4F6EF7, #6366F1); color: #FFF; }
</style>
