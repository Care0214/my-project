<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 选项卡：我买的 / 我卖的 -->
			<view class="tab-row">
				<text
					v-for="(tab, i) in tabs"
					:key="i"
					:class="['tab-item', { active: currentTab === i }]"
					@click="switchTab(i)"
				>{{ tab }}</text>
			</view>

			<view v-if="list.length > 0">
				<view v-for="order in list" :key="order.id" class="order-card">
					<view class="order-item">
						<view class="order-image" :style="{ background: order.item.imageBg || '#F2F3F8' }">
							<AppIcon name="image" :size="32" color="#D0D3E0" />
						</view>
						<view class="order-info">
							<text class="order-title text-ellipsis">{{ order.item.title }}</text>
							<text class="order-price">¥{{ order.price }}</text>
						</view>
						<text :class="['order-status', statusClass(order.status)]">{{ order.statusText }}</text>
					</view>
					<view class="order-footer">
						<text class="order-counterparty">
							{{ currentTab === 0 ? '卖家：' : '买家：' }}{{ currentTab === 0 ? order.seller.nickname : order.buyer.nickname }}
						</text>
						<text class="order-action" v-if="order.status === 'pending'" @click="cancelOrder(order)">取消订单</text>
						<text class="order-action done" v-if="order.status === 'completed'">已评价</text>
					</view>
				</view>
			</view>

			<view v-else class="empty-state">
				<text class="empty-icon">🛒</text>
				<text class="empty-text">{{ currentTab === 0 ? '还没有购买记录' : '还没有卖出记录' }}</text>
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
			currentTab: 0,
			tabs: ['我买的', '我卖的'],
			list: [],
		};
	},
	onShow() { this.loadData(); },
	methods: {
		async loadData() {
			const role = this.currentTab === 0 ? 'buyer' : 'seller';
			try {
				this.list = await get('/api/orders', { role });
			} catch (e) { this.list = []; }
		},
		switchTab(i) {
			this.currentTab = i;
			this.loadData();
		},
		statusClass(status) {
			const map = { pending: 'pending', paid: 'paid', shipped: 'shipped', completed: 'completed' };
			return map[status] || '';
		},
		cancelOrder(order) {
			uni.showModal({
				title: '取消订单',
				content: '确定取消此订单吗？',
				success: (res) => {
					if (res.confirm) {
						this.list = this.list.filter((o) => o.id !== order.id);
						uni.showToast({ title: '已取消', icon: 'success' });
					}
				},
			});
		},
	},
};
</script>

<style scoped>
.tab-row { display: flex; margin-bottom: 24rpx; gap: 12rpx; }
.tab-item {
	padding: 14rpx 36rpx;
	border-radius: 28rpx;
	font-size: 26rpx;
	color: #6B6F80;
	background: #FFFFFF;
	transition: all 0.2s;
}
.tab-item.active { color: #FFFFFF; background: #3D56D4; font-weight: 500; }

.order-card {
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(31, 41, 88, 0.06);
}
.order-item { display: flex; align-items: center; margin-bottom: 16rpx; }
.order-image {
	width: 100rpx; height: 100rpx;
	border-radius: 12rpx;
	flex-shrink: 0; margin-right: 20rpx;
	display: flex; align-items: center; justify-content: center;
}
.order-info { flex: 1; min-width: 0; }
.order-title { font-size: 26rpx; font-weight: 600; color: #1A1D28; display: block; margin-bottom: 6rpx; }
.order-price { font-size: 28rpx; font-weight: 700; color: #FF6B3D; }
.order-status {
	padding: 6rpx 16rpx;
	border-radius: 12rpx;
	font-size: 22rpx;
	font-weight: 500;
	flex-shrink: 0;
}
.order-status.pending { background: #FFF8E6; color: #F59E0B; }
.order-status.paid { background: #EDF0FE; color: #4F6EF7; }
.order-status.shipped { background: #E8F0FF; color: #6366F1; }
.order-status.completed { background: #E8F9EF; color: #22C55E; }

.order-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16rpx; border-top: 1px solid #F2F3F8; }
.order-counterparty { font-size: 24rpx; color: #8B8FA3; }
.order-action { font-size: 24rpx; color: #EF4444; }
.order-action.done { color: #6B6F80; }

.empty-sub { font-size: 24rpx; color: #6B6F80; margin-top: 8rpx; }
</style>
