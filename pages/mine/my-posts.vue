<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 我发布的物品列表 -->
			<view v-if="list.length > 0">
				<view
					v-for="item in list"
					:key="item.id"
					class="post-card"
				>
					<view class="post-image" :style="{ background: item.imageBg || '#F2F3F8' }">
						<AppIcon name="image" :size="40" color="#D0D3E0" />
						<view class="post-price">
							<text v-if="item.price === 0" class="price-free">免费</text>
							<text v-else class="price-num">¥{{ item.price }}</text>
						</view>
					</view>
					<view class="post-info">
						<text class="post-title text-ellipsis">{{ item.title }}</text>
						<text class="post-desc text-ellipsis-2">{{ item.description }}</text>
						<view class="post-meta">
							<text class="post-status">{{ item.publishTimeText }}</text>
							<view class="post-actions">
								<text class="action-link" @click="editItem(item)">编辑</text>
								<text class="action-link danger" @click="deleteItem(item)">删除</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view v-else class="empty-state">
				<text class="empty-icon">📦</text>
				<text class="empty-text">还没有发布过物品</text>
				<text class="empty-sub">去发布第一件闲置吧~</text>
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
		return { list: [] };
	},
	onShow() {
		this.loadData();
	},
	methods: {
		async loadData() {
			try {
				this.list = await get('/api/user/posts');
			} catch (e) { this.list = []; }
		},
		editItem(item) {
			uni.showToast({ title: '编辑功能开发中', icon: 'none' });
		},
		deleteItem(item) {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除「' + item.title + '」吗？',
				success: (res) => {
					if (res.confirm) {
						this.list = this.list.filter((i) => i.id !== item.id);
						uni.showToast({ title: '已删除', icon: 'success' });
					}
				},
			});
		},
	},
};
</script>

<style scoped>
.post-card {
	display: flex;
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(31, 41, 88, 0.06);
}

.post-image {
	width: 160rpx;
	height: 160rpx;
	border-radius: 12rpx;
	flex-shrink: 0;
	margin-right: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.post-price {
	position: absolute;
	right: 8rpx;
	bottom: 8rpx;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	background: rgba(0, 0, 0, 0.55);
}

.price-num { font-size: 24rpx; color: #FF6B3D; font-weight: 700; }
.price-free { font-size: 22rpx; color: #22C55E; font-weight: 600; }

.post-info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
}

.post-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #1A1D28;
	display: block;
	margin-bottom: 6rpx;
}

.post-desc {
	font-size: 24rpx;
	color: #8B8FA3;
	line-height: 1.5;
	display: block;
	flex: 1;
}

.post-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 12rpx;
}

.post-status {
	font-size: 22rpx;
	color: #6B6F80;
}

.post-actions {
	display: flex;
	gap: 20rpx;
}

.action-link {
	font-size: 24rpx;
	color: #4F6EF7;
}

.action-link.danger {
	color: #EF4444;
}

.empty-sub { font-size: 24rpx; color: #6B6F80; margin-top: 8rpx; }
</style>
