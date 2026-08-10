<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 选项卡：我借的 / 我租出的 -->
			<view class="tab-row">
				<text
					v-for="(tab, i) in tabs"
					:key="i"
					:class="['tab-item', { active: currentTab === i }]"
					@click="switchTab(i)"
				>{{ tab }}</text>
			</view>

			<view v-if="list.length > 0">
				<view v-for="rental in list" :key="rental.id" class="rental-card">
					<view class="rental-item">
						<view class="rental-image" :style="{ background: rental.item.imageBg || '#F3F4F8' }">
							<AppIcon name="lease" :size="32" color="#D0D3E0" />
						</view>
						<view class="rental-info">
							<text class="rental-title text-ellipsis">{{ rental.item.title }}</text>
							<view class="rental-price-row">
								<text class="rental-price">¥{{ rental.item.price }}/天</text>
								<text class="rental-deposit">押金 ¥{{ rental.deposit }}</text>
							</view>
							<text class="rental-date">{{ rental.startDate }} — {{ rental.endDate }}</text>
						</view>
						<text :class="['rental-status', statusClass(rental.status)]">{{ rental.statusText }}</text>
					</view>
					<view class="rental-footer">
						<text class="rental-counterparty">
							{{ currentTab === 0 ? '出租方：' : '租借方：' }}{{ currentTab === 0 ? rental.lender.nickname : rental.borrower.nickname }}
						</text>
					</view>
				</view>
			</view>

			<view v-else class="empty-state">
				<text class="empty-icon">📋</text>
				<text class="empty-text">暂无租借记录</text>
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
			tabs: ['我借的', '我租出的'],
			list: [],
		};
	},
	onShow() { this.loadData(); },
	methods: {
		async loadData() {
			const role = this.currentTab === 0 ? 'borrower' : 'lender';
			try {
				this.list = await get('/api/rentals', { role });
			} catch (e) { this.list = []; }
		},
		switchTab(i) { this.currentTab = i; this.loadData(); },
		statusClass(status) {
			const map = { active: 'active', returned: 'done', expiring: 'warn' };
			return map[status] || '';
		},
	},
};
</script>

<style scoped>
.tab-row { display: flex; margin-bottom: 24rpx; gap: 12rpx; }
.tab-item {
	padding: 14rpx 36rpx; border-radius: 28rpx;
	font-size: 26rpx; color: #6B6F80; background: #FFFFFF; transition: all 0.2s;
}
.tab-item.active { color: #FFFFFF; background: #4F6EF7; font-weight: 500; }

.rental-card {
	background: #FFFFFF; border-radius: 20rpx; padding: 24rpx;
	margin-bottom: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.rental-item { display: flex; align-items: flex-start; margin-bottom: 16rpx; }
.rental-image {
	width: 100rpx; height: 100rpx; border-radius: 12rpx;
	flex-shrink: 0; margin-right: 20rpx;
	display: flex; align-items: center; justify-content: center;
}
.rental-info { flex: 1; min-width: 0; }
.rental-title { font-size: 26rpx; font-weight: 600; color: #1A1D28; display: block; margin-bottom: 6rpx; }
.rental-price-row { display: flex; align-items: center; gap: 16rpx; margin-bottom: 4rpx; }
.rental-price { font-size: 26rpx; font-weight: 700; color: #FF6B3D; }
.rental-deposit { font-size: 22rpx; color: #8B8FA3; }
.rental-date { font-size: 22rpx; color: #B0B4C0; display: block; }
.rental-status {
	padding: 6rpx 16rpx; border-radius: 12rpx;
	font-size: 22rpx; font-weight: 500; flex-shrink: 0;
}
.rental-status.active { background: #EDF0FE; color: #4F6EF7; }
.rental-status.warn { background: #FFF8E6; color: #F59E0B; }
.rental-status.done { background: #E8F9EF; color: #22C55E; }

.rental-footer { padding-top: 16rpx; border-top: 1px solid #F3F4F8; }
.rental-counterparty { font-size: 24rpx; color: #8B8FA3; }

.empty-sub { font-size: 24rpx; color: #B0B4C0; margin-top: 8rpx; }
</style>
