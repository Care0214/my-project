<template>
	<view class="page-container">
		<view class="page-body">
			<view v-if="list.length > 0">
				<view v-for="item in list" :key="item.id" class="blacklist-card">
					<view class="bl-avatar" :style="{ background: item.user.avatarBg || '#E0E0E0' }"></view>
					<view class="bl-info">
						<text class="bl-name">{{ item.user.nickname }}</text>
						<text class="bl-reason">{{ item.reason }}</text>
						<text class="bl-time">拉黑时间：{{ item.blockedAt }}</text>
					</view>
					<view class="bl-action" @click="removeBlock(item)">
						<text class="bl-remove">移出</text>
					</view>
				</view>
			</view>

			<view v-else class="empty-state">
				<text class="empty-icon">🛡️</text>
				<text class="empty-text">黑名单为空</text>
				<text class="empty-sub">遇到不愉快的交易可以拉黑对方</text>
			</view>
		</view>
	</view>
</template>

<script>
import { get, del } from '@/utils/request.js';

export default {
	data() { return { list: [] }; },
	onShow() { this.loadData(); },
	methods: {
		async loadData() {
			try {
				this.list = await get('/api/blacklist');
			} catch (e) { this.list = []; }
		},
		removeBlock(item) {
			uni.showModal({
				title: '移出黑名单',
				content: '确定将「' + item.user.nickname + '」移出黑名单吗？',
				success: async (res) => {
					if (res.confirm) {
						try { await del('/api/blacklist/' + item.id); } catch (e) {}
						this.list = this.list.filter((b) => b.id !== item.id);
						uni.showToast({ title: '已移出黑名单', icon: 'success' });
					}
				},
			});
		},
	},
};
</script>

<style scoped>
.blacklist-card {
	display: flex;
	align-items: center;
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.bl-avatar { width: 88rpx; height: 88rpx; border-radius: 50%; flex-shrink: 0; margin-right: 20rpx; }
.bl-info { flex: 1; min-width: 0; }
.bl-name { font-size: 28rpx; font-weight: 600; color: #1A1D28; display: block; margin-bottom: 4rpx; }
.bl-reason { font-size: 24rpx; color: #8B8FA3; display: block; margin-bottom: 4rpx; }
.bl-time { font-size: 22rpx; color: #B0B4C0; display: block; }
.bl-action { flex-shrink: 0; }
.bl-remove {
	padding: 10rpx 24rpx; border-radius: 20rpx;
	font-size: 24rpx; color: #EF4444; background: #FEF2F2;
}
.empty-sub { font-size: 24rpx; color: #B0B4C0; margin-top: 8rpx; }
</style>
