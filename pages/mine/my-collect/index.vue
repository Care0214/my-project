<template>
	<view class="page-container--clean">
		<view class="page-body">
			<!-- 收藏列表 -->
			<view v-if="list.length > 0" class="fav-list">
				<view
					v-for="item in list"
					:key="item.id"
					class="card fav-card"
					@click="goDetail(item)"
					@longpress="removeFav(item)"
				>
					<view class="fav-image" :style="{ background: item.imageBg || '#F2F3F8' }">
						<image
							v-if="item.images && item.images.length > 0"
							:src="item.images[0]"
							class="fav-image__img"
							mode="aspectFill"
							lazy-load
						/>
						<AppIcon v-else name="image" :size="40" color="#D0D3E0" />
					</view>
					<view class="fav-info">
						<text class="fav-title text-ellipsis">{{ item.title }}</text>
						<view class="fav-meta-row">
							<text class="fav-price" v-if="item.price > 0">¥{{ item.price }}</text>
							<text class="fav-price free" v-else>免费</text>
							<text class="fav-collect-time" v-if="collectTime(item)">{{ formatTime(collectTime(item)) }}</text>
						</view>
						<view class="fav-seller">
							<AppIcon name="user" :size="24" color="#6B6F80" />
							<text class="fav-seller-name text-ellipsis">{{ sellerName(item) }}</text>
							<AppIcon name="location" :size="24" color="#6B6F80" />
							<text class="fav-campus text-ellipsis">{{ item.campus || '未知校区' }}</text>
						</view>
					</view>
					<view class="fav-action" @click.stop="removeFav(item)">
						<AppIcon name="heart-fill" :size="36" color="#EF4444" />
					</view>
				</view>
				<text class="longpress-tip">长按卡片或点击红心可取消收藏</text>
			</view>

			<!-- 加载失败 -->
			<view v-else-if="loadError" class="error-state">
				<AppIcon name="close" :size="56" color="#EF4444" />
				<text class="error-text">加载失败，请检查网络后重试</text>
				<view class="retry-btn" @click="loadData"><text>重新加载</text></view>
			</view>

			<!-- 空状态 -->
			<view v-else class="empty-state">
				<AppIcon name="heart" :size="64" color="#8B8FA3" />
				<text class="empty-text">还没有收藏任何物品</text>
				<text class="empty-sub">遇到喜欢的就收藏起来吧~</text>
			</view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get, del } from '@/utils/request.js';

export default {
	components: { AppIcon },
	data() {
		return { list: [], loadError: false };
	},
	onShow() {
		this.loadData();
	},
	methods: {
		async loadData() {
			try {
				this.list = await get('/api/favorites');
				this.loadError = false;
			} catch (e) {
				this.list = [];
				this.loadError = true;
			}
		},
		sellerName(item) {
			return (item.seller && item.seller.nickname) || '未知卖家';
		},
		collectTime(item) {
			return item.collectTime || item.favoritedAt || '';
		},
		formatTime(ts) {
			if (!ts) return '';
			const diff = Date.now() - ts;
			const min = Math.floor(diff / 60000);
			if (min < 1) return '刚刚';
			if (min < 60) return min + '分钟前';
			const hours = Math.floor(min / 60);
			if (hours < 24) return hours + '小时前';
			const days = Math.floor(hours / 24);
			if (days < 7) return days + '天前';
			const d = new Date(ts);
			return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
		},
		goDetail(item) {
			uni.navigateTo({ url: '/pages/goods-detail/index?id=' + item.id });
		},
		removeFav(item) {
			uni.showActionSheet({
				itemList: ['取消收藏'],
				success: (res) => {
					if (res.tapIndex === 0) {
						this.confirmRemove(item);
					}
				},
			});
		},
		confirmRemove(item) {
			uni.showModal({
				title: '取消收藏',
				content: '确定取消收藏「' + item.title + '」吗？',
				success: async (res) => {
					if (res.confirm) {
						try { await del('/api/favorites/' + item.id); } catch (e) {}
						this.list = this.list.filter((i) => i.id !== item.id);
						uni.showToast({ title: '已取消收藏', icon: 'success' });
					}
				},
			});
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.fav-card { display: flex; align-items: center; padding: 20rpx 24rpx; }
.fav-image {
	width: 140rpx; height: 140rpx; border-radius: 16rpx; flex-shrink: 0;
	margin-right: 20rpx;
	display: flex; align-items: center; justify-content: center;
	overflow: hidden;
}
.fav-image__img { width: 100%; height: 100%; }
.fav-info { flex: 1; min-width: 0; }
.fav-title { font-size: 28rpx; font-weight: 600; color: #1A1D28; display: block; margin-bottom: 10rpx; }
.fav-meta-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10rpx; }
.fav-price { font-size: 32rpx; font-weight: 700; color: #FF6B3D; }
.fav-price.free { color: #22C55E; }
.fav-collect-time { font-size: 22rpx; color: #6B6F80; }
.fav-seller { display: flex; align-items: center; gap: 6rpx; }
.fav-seller-name { font-size: 22rpx; color: #8B8FA3; max-width: 160rpx; }
.fav-campus { font-size: 22rpx; color: #8B8FA3; max-width: 140rpx; margin-left: 4rpx; }
.fav-action { padding: 10rpx; flex-shrink: 0; }
.longpress-tip { display: block; text-align: center; font-size: 22rpx; color: #6B6F80; margin-top: 8rpx; }

.empty-sub { font-size: 24rpx; color: #6B6F80; margin-top: 8rpx; }
</style>
