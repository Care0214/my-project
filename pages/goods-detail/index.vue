<template>
	<view class="page-container--clean">
		<view class="page-body">
			<!-- 物品图片区 -->
			<view class="detail-image" :style="{ background: item.imageBg || '#F2F3F8' }">
				<swiper
					v-if="item.images && item.images.length > 0"
					class="detail-swiper"
					circular
					indicator-dots
					indicator-active-color="#FFFFFF"
				>
					<swiper-item v-for="(img, i) in item.images" :key="i">
						<image :src="img" class="detail-swiper__img" mode="aspectFill" @click="previewImage(i)" />
					</swiper-item>
				</swiper>
				<view v-else class="detail-image-placeholder">
					<AppIcon name="image" :size="80" color="#8B8FA3" />
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
							<AppIcon :name="isFavorited ? 'star-fill' : 'star'" :size="44" :color="isFavorited ? '#F59E0B' : '#8B8FA3'" />
						</view>
					</view>
				</view>
				<text class="detail-title">{{ item.title }}</text>
				<text class="detail-desc">{{ item.description }}</text>
			</view>

			<!-- 卖家信息 -->
			<view class="card seller-card">
				<view class="seller-row" @click="goUser(item.seller)">
					<view class="seller-avatar" :style="{ background: item.seller ? item.seller.avatarBg || '#77C9F1' : '#77C9F1' }">
						<text class="seller-avatar-text">{{ item.seller ? item.seller.nickname.charAt(0) : '?' }}</text>
					</view>
					<view class="seller-info">
						<view class="seller-name-row">
							<text class="seller-name">{{ item.seller ? item.seller.nickname : '匿名' }}</text>
							<text v-if="item.seller && item.seller.anonymous" class="seller-anon-tag">匿名</text>
						</view>
						<text class="seller-campus">{{ item.campus || item.location || '' }}</text>
					</view>
					<view class="seller-chat-btn" @click.stop="goChat">
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

			<view class="detail-spacer"></view>

			<!-- 底部操作 -->
			<view class="detail-bottom">
				<view class="detail-bottom-btn btn-fav" @click="toggleFavorite">
					<image class="fav-icon" :class="{ collected: isFavorited }" :src="isFavorited ? collectFillIcon : collectIcon" mode="aspectFit" />
					<text>收藏</text>
				</view>
				<view class="detail-bottom-btn btn-chat" @click="goChat">
					<image class="chat-icon" :src="chatIcon" mode="aspectFit" />
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
			collectIcon: require('@/imgs/收藏.png'),
			collectFillIcon: require('@/imgs/收藏-fill.png'),
			chatIcon: require('@/imgs/私信-white.png'),
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
	onShareAppMessage() {
		return {
			title: (this.item.title || '拾闲小栈') + (this.item.price ? ' ¥' + this.item.price : ''),
			desc: this.item.description || '校园闲置物品智能交换平台',
			path: '/pages/goods-detail/index?id=' + this.item.id,
			imageUrl: this.item.images && this.item.images.length > 0 ? this.item.images[0] : '/static/logo.png',
		};
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
		previewImage(current) {
			if (this.item.images && this.item.images.length > 0) {
				uni.previewImage({
					urls: this.item.images,
					current: this.item.images[current] || this.item.images[0],
				});
			}
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
			// 根据物品ID和卖家ID生成唯一会话ID
			const sellerId = this.item.seller ? this.item.seller.id : 'unknown';
			const conversationId = 'item_' + this.item.id + '_' + sellerId;
			uni.navigateTo({ url: '/pages/chat/index?id=' + conversationId + '&itemId=' + this.item.id });
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

.detail-image { width: 100%; height: 500rpx; position: relative; overflow: hidden; }
.detail-swiper { width: 100%; height: 100%; }
.detail-swiper__img { width: 100%; height: 100%; }
.detail-image-placeholder {
	width: 100%; height: 100%; background: linear-gradient(135deg, #F2F3F8, #E8EAF0);
	display: flex; align-items: center; justify-content: center;
}
.detail-type-tag {
	position: absolute; top: 20rpx; right: 20rpx; padding: 8rpx 20rpx;
	background: rgba(0, 0, 0, 0.55); color: #FFF; font-size: 28rpx; border-radius: 20rpx;
}

.detail-price-row { display: flex; align-items: center; justify-content: space-between; }
.detail-price { font-size: 52rpx; font-weight: bold; color: #FF6B3D; }
.detail-free { font-size: 44rpx; font-weight: bold; color: #22C55E; }
.detail-title { font-size: 34rpx; font-weight: 600; color: #1A1D28; display: block; margin-top: 16rpx; }
.detail-desc { font-size: 28rpx; color: #6B6F80; line-height: 1.6; display: block; margin-top: 16rpx; }

.seller-card { padding: 24rpx; }
.seller-row { display: flex; align-items: center; gap: 16rpx; }
.seller-avatar {
	width: 80rpx; height: 80rpx; border-radius: 50%; flex-shrink: 0;
	display: flex; align-items: center; justify-content: center;
}
.seller-avatar-text { font-size: 32rpx; font-weight: bold; color: #FFF; }
.seller-info { flex: 1; }
.seller-name { font-size: 30rpx; font-weight: 600; color: #1A1D28; display: block; }
.seller-name-row { display: flex; align-items: center; gap: 8rpx; }
.seller-anon-tag { padding: 2rpx 10rpx; background: #C9EBF7; color: #4F91C5; font-size: 22rpx; border-radius: 8rpx; }
.seller-campus { font-size: 28rpx; color: #6B6F80; margin-top: 4rpx; }
.seller-chat-btn {
	padding: 14rpx 28rpx; background: #C9EBF7; border-radius: 30rpx;
	font-size: 26rpx; color: #4F91C5; font-weight: 500;
}

.info-row { display: flex; justify-content: space-between; padding: 20rpx 0; }
.info-row + .info-row { border-top: 1px solid #F2F3F8; }
.info-label { font-size: 28rpx; color: #6B6F80; }
.info-value { font-size: 28rpx; color: #1A1D28; }

.detail-bottom {
	position: fixed; left: 0; right: 0; bottom: 0; padding: 16rpx 30rpx calc(16rpx + env(safe-area-inset-bottom));
	background: #FFF; display: flex; gap: 20rpx; box-shadow: 0 -2rpx 16rpx rgba(31, 41, 88, 0.08);
	z-index: 100;
}
.detail-spacer { height: calc(140rpx + env(safe-area-inset-bottom)); }
.detail-bottom-btn {
	flex: 1; height: 88rpx; border-radius: 44rpx; display: flex;
	align-items: center; justify-content: center; gap: 10rpx; font-size: 28rpx; font-weight: 500;
}
.btn-fav { background: #F2F3F8; color: #6B6F80; }
.btn-chat { background: linear-gradient(135deg, #4F91C5 0%, #77C9F1 100%); color: #FFF; }
.fav-icon { width: 32rpx; height: 32rpx; flex-shrink: 0; opacity: 0.4; transition: opacity 0.2s; }
.fav-icon.collected { opacity: 1; }
.chat-icon { width: 32rpx; height: 32rpx; flex-shrink: 0; }
</style>
