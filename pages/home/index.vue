<template>
	<view class="page-container">
		<view class="page-body">
			<text class="page-title">首页</text>

			<!-- 搜索栏 -->
			<view class="search-bar">
				<AppIcon name="search" :size="36" color="#999" />
				<text class="search-placeholder">搜索你需要的物品或服务</text>
			</view>

			<!-- 分类快捷入口 -->
			<view class="category-row">
				<view
					v-for="cat in categories"
					:key="cat.name"
					class="category-item"
				>
					<view class="category-icon">
						<AppIcon :name="cat.icon" :size="44" color="#3C7DFF" />
					</view>
					<text class="category-name">{{ cat.name }}</text>
				</view>
			</view>

			<!-- 最新发布 -->
			<text class="section-title">最新发布</text>
			<view class="card" v-for="i in 3" :key="i">
				<view class="card-header">
					<view class="avatar"></view>
					<view class="card-meta">
						<text class="card-username">用户昵称</text>
						<text class="card-time">刚刚发布</text>
					</view>
					<text class="tag">闲置</text>
				</view>
				<text class="card-title">物品标题示例</text>
				<text class="card-desc text-ellipsis-2">
					物品描述内容，简要说明物品的状态、新旧程度以及联系方式等信息
				</text>
			</view>
		</view>

		<AppTabBar :current="0" />
	</view>
</template>

<script>
import AppTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';

export default {
	components: {
		AppTabBar,
		AppIcon,
	},
	data() {
		return {
			categories: [
				{ name: '学习用品', icon: 'lease' },
				{ name: '生活杂物', icon: 'lease' },
				{ name: '数码电子', icon: 'lease' },
				{ name: '其他', icon: 'lease' },
			],
		};
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
	color: #999999;
	font-size: 28rpx;
	margin-left: 16rpx;
}

.category-row {
	display: flex;
	justify-content: space-around;
	margin-bottom: 30rpx;
}

.category-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.category-icon {
	width: 100rpx;
	height: 100rpx;
	background: #EEF4FF;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 10rpx;
}

.category-name {
	font-size: 24rpx;
	color: #666;
}

.section-title {
	font-size: 34rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	display: block;
}

.card-header {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
}

.avatar {
	width: 72rpx;
	height: 72rpx;
	background: #E0E0E0;
	border-radius: 50%;
	margin-right: 16rpx;
	flex-shrink: 0;
}

.card-meta {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.card-username {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.card-time {
	font-size: 22rpx;
	color: #999;
	margin-top: 4rpx;
}

.card-title {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
	display: block;
	margin-bottom: 10rpx;
}

.card-desc {
	font-size: 26rpx;
	color: #999;
	line-height: 1.5;
	display: block;
}
</style>
