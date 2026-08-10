<template>
	<view class="page-container">
		<view class="page-body">
			<view v-if="list.length > 0">
				<!-- 按日期分组 -->
				<view v-for="(group, date) in groupedList" :key="date" class="history-group">
					<text class="group-date">{{ date }}</text>
					<view
						v-for="item in group"
						:key="item.item.id"
						class="history-card"
						@click="goDetail(item.item)"
					>
						<view class="hist-image" :style="{ background: item.item.imageBg || '#F3F4F8' }">
							<AppIcon name="image" :size="32" color="#D0D3E0" />
						</view>
						<view class="hist-info">
							<text class="hist-title text-ellipsis">{{ item.item.title }}</text>
							<text class="hist-price" v-if="item.item.price > 0">¥{{ item.item.price }}</text>
							<text class="hist-price free" v-else>免费</text>
						</view>
						<AppIcon name="arrow-right" :size="28" color="#D0D3E0" />
					</view>
				</view>
			</view>

			<view v-else class="empty-state">
				<text class="empty-icon">👀</text>
				<text class="empty-text">暂无浏览记录</text>
				<text class="empty-sub">去首页逛逛吧~</text>
			</view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get } from '@/utils/request.js';

export default {
	components: { AppIcon },
	data() { return { list: [] }; },
	computed: {
		groupedList() {
			const groups = {};
			this.list.forEach((h) => {
				const d = new Date(h.viewedAt);
				const today = new Date();
				const yesterday = new Date(today.getTime() - 86400000);
				let key;
				const dStr = d.toDateString();
				if (dStr === today.toDateString()) key = '今天';
				else if (dStr === yesterday.toDateString()) key = '昨天';
				else key = `${d.getMonth() + 1}月${d.getDate()}日`;
				if (!groups[key]) groups[key] = [];
				groups[key].push(h);
			});
			return groups;
		},
	},
	onShow() { this.loadData(); },
	methods: {
		async loadData() {
			try {
				this.list = await get('/api/browse-history');
			} catch (e) { this.list = []; }
		},
		goDetail(item) {
			uni.navigateTo({ url: '/pages/item-detail/index?id=' + item.id });
		},
	},
};
</script>

<style scoped>
.history-group { margin-bottom: 16rpx; }
.group-date {
	font-size: 24rpx;
	color: #B0B4C0;
	font-weight: 500;
	display: block;
	margin-bottom: 12rpx;
	padding-left: 4rpx;
}
.history-card {
	display: flex;
	align-items: center;
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 8rpx;
}
.hist-image {
	width: 96rpx;
	height: 96rpx;
	border-radius: 12rpx;
	flex-shrink: 0;
	margin-right: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.hist-info { flex: 1; min-width: 0; }
.hist-title { font-size: 28rpx; font-weight: 600; color: #1A1D28; display: block; margin-bottom: 6rpx; }
.hist-price { font-size: 26rpx; font-weight: 700; color: #FF6B3D; }
.hist-price.free { color: #22C55E; }
.empty-sub { font-size: 24rpx; color: #B0B4C0; margin-top: 8rpx; }
</style>
