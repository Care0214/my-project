<template>
	<view class="page-container">
		<view class="page-body">
			<text class="page-title">校园租借</text>

			<!-- 搜索栏 -->
			<view class="search-bar">
				<AppIcon name="search" :size="36" color="#999" />
				<text class="search-placeholder">搜索可租借的物品</text>
			</view>

			<!-- 租借列表 -->
			<view class="card" v-for="i in 3" :key="i">
				<view class="card-row">
					<view class="goods-img"></view>
					<view class="goods-info">
						<text class="card-title">物品名称</text>
						<text class="card-desc text-ellipsis-2">
							物品描述，包含新旧程度、押金、使用说明等
						</text>
						<view class="goods-footer">
							<text class="price">¥3<span class="unit">/天</span></text>
							<text class="tag">可租</text>
						</view>
					</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';

export default {
	components: {
		AppIcon,
	},
};
</script>

<style scoped>
.search-bar {
	display: flex;
	align-items: center;
	background: #FFFFFF;
	border-radius: 40rpx;
	padding: 20rpx 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.search-placeholder {
	color: #999;
	font-size: 28rpx;
	margin-left: 16rpx;
}

.card-row {
	display: flex;
}

.goods-img {
	width: 180rpx;
	height: 180rpx;
	background: #EEEEEE;
	border-radius: 12rpx;
	flex-shrink: 0;
	margin-right: 20rpx;
}

.goods-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.card-title {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
	display: block;
}

.card-desc {
	font-size: 26rpx;
	color: #999;
	display: block;
	margin-top: 8rpx;
}

.goods-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 12rpx;
}

.price {
	font-size: 34rpx;
	color: #FF6B35;
	font-weight: bold;
}

.unit {
	font-size: 22rpx;
	font-weight: normal;
}
</style>
