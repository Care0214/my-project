<template>
	<view class="page-container">
		<view class="page-body">
			<view v-if="list.length > 0">
				<view
					v-for="item in list"
					:key="item.id"
					class="fav-card"
					@click="goDetail(item)"
				>
					<view class="fav-image" :style="{ background: item.imageBg || '#F3F4F8' }">
						<AppIcon name="image" :size="36" color="#D0D3E0" />
					</view>
					<view class="fav-info">
						<text class="fav-title text-ellipsis">{{ item.title }}</text>
						<text class="fav-price" v-if="item.price > 0">¥{{ item.price }}</text>
						<text class="fav-price free" v-else>免费</text>
					</view>
					<view class="fav-action" @click.stop="removeFav(item)">
						<AppIcon name="heart-filled" :size="36" color="#EF4444" />
					</view>
				</view>
			</view>

			<view v-else class="empty-state">
				<text class="empty-icon">💝</text>
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
		return { list: [] };
	},
	onShow() {
		this.loadData();
	},
	methods: {
		async loadData() {
			try {
				this.list = await get('/api/favorites');
			} catch (e) { this.list = []; }
		},
		removeFav(item) {
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
		goDetail(item) {
			uni.navigateTo({ url: '/pages/item-detail/index?id=' + item.id });
		},
	},
};
</script>

<style scoped>
.fav-card {
	display: flex;
	align-items: center;
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 20rpx 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.fav-image {
	width: 120rpx;
	height: 120rpx;
	border-radius: 12rpx;
	flex-shrink: 0;
	margin-right: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.fav-info { flex: 1; min-width: 0; }
.fav-title { font-size: 28rpx; font-weight: 600; color: #1A1D28; display: block; margin-bottom: 8rpx; }
.fav-price { font-size: 30rpx; font-weight: 700; color: #FF6B3D; }
.fav-price.free { color: #22C55E; }
.fav-action { padding: 10rpx; flex-shrink: 0; }
.empty-sub { font-size: 24rpx; color: #B0B4C0; margin-top: 8rpx; }
</style>
