<template>
	<view class="page-container--clean">
		<view class="page-body">
			<!-- 状态筛选 -->
			<view class="filter-tabs">
				<view
					v-for="tab in tabs"
					:key="tab.value"
					:class="['filter-tab', { active: activeTab === tab.value }]"
					@click="switchTab(tab.value)"
				>
					<text>{{ tab.label }}</text>
				</view>
			</view>

			<!-- 发布列表 -->
			<view v-if="filteredList.length > 0" class="post-list">
				<view v-for="item in filteredList" :key="item.id" class="card post-card">
					<view class="post-top">
						<view class="post-title-wrap">
							<text class="post-title text-ellipsis">{{ item.title }}</text>
						</view>
						<view class="status-badge" :style="{ background: statusInfo(item.status).bg, color: statusInfo(item.status).color }">
							<text>{{ statusInfo(item.status).label }}</text>
						</view>
					</view>

					<text v-if="item.desc" class="post-desc text-ellipsis">{{ item.desc }}</text>

					<view class="post-meta">
						<text class="post-price">¥{{ item.price }}</text>
						<text class="post-time">{{ formatTime(item.publishTime) }}</text>
					</view>

					<view class="post-stats">
						<view class="stat-item">
							<AppIcon name="eye" :size="26" color="#B0B4C0" />
							<text class="stat-text">{{ item.viewCount }}</text>
						</view>
						<view class="stat-item">
							<AppIcon name="heart" :size="26" color="#B0B4C0" />
							<text class="stat-text">{{ item.favCount }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else class="empty-state">
				<text class="empty-icon">📦</text>
				<text class="empty-text">暂无相关发布</text>
				<text class="empty-sub">去发布第一件闲置吧~</text>
				<view class="empty-action" @click="goPublish"><text>去发布</text></view>
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
			activeTab: 'all',
			list: [],
			tabs: [
				{ label: '全部', value: 'all' },
				{ label: '出售中', value: 'active' },
				{ label: '已售出', value: 'sold' },
				{ label: '已下架', value: 'offline' },
			],
		};
	},
	computed: {
		filteredList() {
			if (this.activeTab === 'all') return this.list;
			return this.list.filter((i) => i.status === this.activeTab);
		},
	},
	onShow() {
		this.loadData();
	},
	methods: {
		async loadData() {
			try {
				this.list = await get('/api/user/posts');
			} catch (e) {
				this.list = [];
			}
		},
		switchTab(value) {
			this.activeTab = value;
		},
		statusInfo(status) {
			const map = {
				active: { label: '出售中', color: '#4F6EF7', bg: '#EDF0FE' },
				sold: { label: '已售出', color: '#22C55E', bg: '#E8F8EE' },
				offline: { label: '已下架', color: '#999999', bg: '#F2F3F8' },
			};
			return map[status] || { label: '未知', color: '#999999', bg: '#F2F3F8' };
		},
		formatTime(ts) {
			if (!ts) return '';
			const diff = Date.now() - ts;
			const min = Math.floor(diff / 60000);
			if (min < 1) return '刚刚';
			if (min < 60) return min + '分钟前';
			const hours = Math.floor(min / 60);
			if (hours < 24) return hours + '小时前';
			const days = Math.floor(hours / 24);
			if (days < 7) return days + '天前';
			const d = new Date(ts);
			return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
		},
		goPublish() {
			uni.navigateTo({ url: '/pages/publish/index' });
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.filter-tabs {
	display: flex;
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 10rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.filter-tab {
	flex: 1;
	text-align: center;
	padding: 14rpx 0;
	border-radius: 12rpx;
	font-size: 26rpx;
	color: #666;
	transition: all 0.2s;
}
.filter-tab.active {
	background: linear-gradient(135deg, #4F6EF7, #6366F1);
	color: #FFF;
	font-weight: 600;
	box-shadow: 0 4rpx 12rpx rgba(79, 110, 247, 0.3);
}

.post-card { padding: 24rpx; }
.post-top { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; margin-bottom: 10rpx; }
.post-title-wrap { flex: 1; min-width: 0; }
.post-title { font-size: 30rpx; font-weight: 600; color: #1A1D28; display: block; }
.status-badge {
	flex-shrink: 0;
	padding: 4rpx 14rpx;
	border-radius: 8rpx;
	font-size: 22rpx;
}
.post-desc { font-size: 24rpx; color: #8B8FA3; line-height: 1.5; display: block; margin-bottom: 14rpx; }
.post-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.post-price { font-size: 32rpx; font-weight: 700; color: #FF6B3D; }
.post-time { font-size: 22rpx; color: #B0B4C0; }
.post-stats { display: flex; align-items: center; gap: 28rpx; padding-top: 16rpx; border-top: 1px solid #F5F5F5; }
.stat-item { display: flex; align-items: center; gap: 6rpx; }
.stat-text { font-size: 22rpx; color: #B0B4C0; }

.empty-sub { font-size: 24rpx; color: #B0B4C0; margin-top: 8rpx; margin-bottom: 32rpx; }
.empty-action {
	padding: 16rpx 48rpx;
	border-radius: 40rpx;
	background: linear-gradient(135deg, #4F6EF7, #6366F1);
	box-shadow: 0 6rpx 20rpx rgba(79, 110, 247, 0.25);
}
.empty-action:active { transform: scale(0.95); }
.empty-action text { font-size: 28rpx; font-weight: 600; color: #FFF; }
</style>
