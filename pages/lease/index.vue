<template>
	<view class="page-container">
		<view class="page-body">
			<text class="page-title">校园租借</text>

			<!-- 搜索栏 -->
			<view class="search-bar" @click="goSearch">
				<AppIcon name="search" :size="36" color="#B0B4C0" />
				<text class="search-placeholder">搜索可租借的物品</text>
			</view>

			<!-- 租借列表（从物品数据中筛选出租类型） -->
			<view v-if="leaseList.length > 0">
				<view
					v-for="item in leaseList"
					:key="item.id"
					class="lease-card"
				>
					<view class="goods-img" :style="{ background: item.imageBg || '#F3F4F8' }">
						<AppIcon name="lease" :size="40" color="#D0D3E0" />
					</view>
					<view class="goods-info">
						<text class="card-title text-ellipsis">{{ item.title }}</text>
						<text class="card-desc text-ellipsis-2">{{ item.description }}</text>
						<view class="goods-footer">
							<view class="price-row">
								<text class="price">¥{{ item.price || 3 }}</text>
								<text class="unit">/天</text>
							</view>
							<text class="tag">可租</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else class="empty-state">
				<text class="empty-icon">📦</text>
				<text class="empty-text">暂无可租物品</text>
			</view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get } from '@/utils/request.js';

export default {
	components: { AppIcon },
	data() {
		return {
			leaseList: [],
		};
	},
	onLoad() {
		this.loadLeaseItems();
	},
	methods: {
		goSearch() {
			uni.navigateTo({ url: '/pages/search/index' });
		},
		async loadLeaseItems() {
			try {
				const data = await get('/api/items', { type: 'lease' });
				this.leaseList = data.list || [];
			} catch (e) {
				this.leaseList = [];
			}
		},
	},
};
</script>

<style scoped>
.search-bar {
	display: flex;
	align-items: center;
	background: #FFFFFF;
	border-radius: 40rpx;
	padding: 20rpx 28rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.search-placeholder {
	color: #B0B4C0;
	font-size: 26rpx;
	margin-left: 16rpx;
}

.lease-card {
	display: flex;
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.goods-img {
	width: 180rpx;
	height: 180rpx;
	border-radius: 12rpx;
	flex-shrink: 0;
	margin-right: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.goods-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
}

.card-title {
	font-size: 30rpx;
	color: #1A1D28;
	font-weight: 600;
	display: block;
}

.card-desc {
	font-size: 24rpx;
	color: #8B8FA3;
	display: block;
	margin-top: 8rpx;
	line-height: 1.5;
}

.goods-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 12rpx;
}

.price-row {
	display: flex;
	align-items: baseline;
}

.price {
	font-size: 34rpx;
	color: #FF6B3D;
	font-weight: 700;
}

.unit {
	font-size: 22rpx;
	color: #8B8FA3;
	margin-left: 4rpx;
}

.tag {
	padding: 6rpx 16rpx;
	border-radius: 12rpx;
	font-size: 22rpx;
	background: #E8F9EF;
	color: #22C55E;
	font-weight: 500;
}
</style>
