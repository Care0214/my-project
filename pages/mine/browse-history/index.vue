<template>
	<view class="page-container--clean">
		<view class="page-body">
			<view class="list-header">
				<text class="header-title-sm">浏览记录</text>
				<text class="header-desc">最近浏览过的物品和帖子</text>
			</view>

			<view v-if="list.length > 0">
				<view class="card history-card" v-for="item in list" :key="item.id" @click="goDetail(item)">
					<view class="history-row">
						<view class="history-icon">
							<image v-if="item.type !== 'lease'" class="history-cart-icon" :src="cartIcon" mode="aspectFit" />
							<AppIcon v-else name="lease" :size="44" color="#77C9F1" />
						</view>
						<view class="history-info">
							<text class="history-title text-ellipsis">{{ item.title }}</text>
							<view class="history-meta">
								<view :class="['type-tag', item.type === 'lease' ? 'tag-lease' : 'tag-sell']">
									{{ item.type === 'lease' ? '出租' : '出售' }}
								</view>
								<text class="history-price" v-if="item.price">¥{{ item.price }}</text>
								<text class="history-time">{{ formatTime(item.time) }}</text>
							</view>
						</view>
						<AppIcon name="arrow-right" :size="44" color="#8B8FA3" />
					</view>
				</view>

				<view class="clear-all" @click="clearAll">
					<text class="clear-all-text">清除全部记录</text>
				</view>
			</view>

			<view v-else class="empty-state">
				<image class="empty-clock-icon" :src="clockIcon" mode="aspectFit" />
				<text>暂无浏览记录</text>
				<text class="mt-8 empty-sub-text">去首页逛逛吧~</text>
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
		return {
			list: [],
			cartIcon: require('@/imgs/cart.png'),
			clockIcon: require('@/imgs/clock.png'),
		};
	},
	onShow() { this.loadList(); },
	methods: {
		async loadList() {
			try { this.list = await get('/api/browse-history'); } catch (e) { this.list = []; }
		},
		formatTime(ts) {
			var diff = Date.now() - ts;
			var mins = Math.floor(diff / 60000);
			if (mins < 60) return mins + '分钟前';
			var hours = Math.floor(mins / 60);
			if (hours < 24) return hours + '小时前';
			var days = Math.floor(hours / 24);
			if (days < 30) return days + '天前';
			return new Date(ts).toLocaleDateString('zh-CN');
		},
		goDetail(item) {
			if (item.type === 'lease') {
				uni.navigateTo({ url: '/pages/lease-detail/index?id=' + item.itemId });
			} else {
				uni.navigateTo({ url: '/pages/goods-detail/index?id=' + item.itemId });
			}
		},
		clearAll() {
			var that = this;
			uni.showModal({
				title: '清除记录',
				content: '确定要清除全部浏览记录吗？',
				success: function(res) {
					if (res.confirm) {
						var deletes = that.list.map(function(h) { return del('/api/browse-history/' + h.id).catch(function() {}); });
						Promise.all(deletes).then(function() {
							that.list = [];
							uni.showToast({ title: '已清除', icon: 'success' });
						});
					}
				},
			});
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.list-header { margin-bottom: 24rpx; }
.header-title-sm { font-size: 36rpx; font-weight: bold; color: #1A1D28; display: block; }
.header-desc { font-size: 28rpx; color: #6B6F80; margin-top: 8rpx; display: block; }

.history-card { padding: 20rpx 24rpx; }
.history-row { display: flex; align-items: center; gap: 16rpx; }
.history-icon {
	width: 64rpx; height: 64rpx; border-radius: 50%; background: #EAF1FE;
	display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.history-cart-icon { width: 44rpx; height: 44rpx; }
.empty-clock-icon { width: 64rpx; height: 64rpx; }
.history-info { flex: 1; min-width: 0; }
.history-title { font-size: 28rpx; color: #1A1D28; font-weight: 500; display: block; margin-bottom: 8rpx; }
.history-meta { display: flex; align-items: center; gap: 12rpx; }
.type-tag { padding: 2rpx 12rpx; border-radius: 8rpx; font-size: 26rpx; }
.tag-sell { background: #EAF1FE; color: #77C9F1; }
.tag-lease { background: #FFF3E0; color: #F59E0B; }
.history-price { font-size: 28rpx; color: #FF6B3D; font-weight: 500; }
.history-time { font-size: 26rpx; color: #8B8FA3; }

.clear-all { display: flex; justify-content: center; padding: 30rpx 0; }
.clear-all-text { font-size: 28rpx; color: #FF4D4F; }
.empty-sub-text { font-size: 28rpx; color: #8B8FA3; }
</style>
