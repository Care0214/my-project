<template>
	<view class="page-container--clean">
		<view class="page-body">
			<!-- 租借记录列表 -->
			<view v-if="list.length > 0" class="lease-list">
				<view v-for="item in list" :key="item.id" class="card lease-card">
					<view class="lease-top">
						<view class="lease-badges">
							<text class="role-badge" :style="{ background: roleInfo(item.role).bg, color: roleInfo(item.role).color }">
								{{ roleInfo(item.role).label }}
							</text>
							<text class="status-badge" :style="{ background: statusInfo(item.status).bg, color: statusInfo(item.status).color }">
								{{ statusInfo(item.status).label }}
							</text>
						</view>
						<text v-if="item.campus" class="lease-campus">{{ item.campus }}</text>
					</view>

					<text class="lease-title text-ellipsis-2">{{ item.title }}</text>

					<view class="lease-meta">
						<view class="meta-item">
							<text class="meta-label">租金</text>
							<text class="meta-value price">¥{{ item.price }}/天</text>
						</view>
						<view class="meta-item">
							<text class="meta-label">押金</text>
							<text class="meta-value">¥{{ item.deposit }}</text>
						</view>
						<view class="meta-item">
							<text class="meta-label">时长</text>
							<text class="meta-value">{{ item.duration }}天</text>
						</view>
					</view>

					<view class="lease-dates" v-if="item.startDate && item.endDate">
						<AppIcon name="clock" :size="24" color="#B0B4C0" />
						<text class="date-text">{{ formatDate(item.startDate) }} ~ {{ formatDate(item.endDate) }}</text>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else class="empty-state">
				<text class="empty-icon">📅</text>
				<text class="empty-text">暂无租借记录</text>
				<text class="empty-sub">去校园租借看看有什么好物可租吧~</text>
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
				this.list = await get('/api/user/lease-records');
			} catch (e) {
				this.list = [];
			}
		},
		roleInfo(role) {
			const map = {
				renter: { label: '借入方', color: '#4F6EF7', bg: '#EDF0FE' },
				lender: { label: '出租方', color: '#F59E0B', bg: '#FFF3E0' },
			};
			return map[role] || { label: '参与', color: '#666666', bg: '#F2F3F8' };
		},
		statusInfo(status) {
			const map = {
				active: { label: '租借中', color: '#4F6EF7', bg: '#EDF0FE' },
				returned: { label: '已归还', color: '#22C55E', bg: '#E8F8EE' },
				overdue: { label: '已逾期', color: '#FF4D4F', bg: '#FFF0F0' },
			};
			return map[status] || { label: '未知', color: '#999999', bg: '#F2F3F8' };
		},
		formatDate(ts) {
			if (!ts) return '';
			const d = new Date(ts);
			return `${d.getMonth() + 1}月${d.getDate()}日`;
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.lease-card { padding: 24rpx; }
.lease-top { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; margin-bottom: 14rpx; }
.lease-badges { display: flex; align-items: center; gap: 10rpx; }
.role-badge, .status-badge { padding: 4rpx 14rpx; border-radius: 8rpx; font-size: 22rpx; }
.lease-campus { font-size: 22rpx; color: #B0B4C0; }

.lease-title { font-size: 30rpx; font-weight: 600; color: #1A1D28; display: block; line-height: 1.4; margin-bottom: 18rpx; }

.lease-meta {
	display: flex;
	background: #F8F9FC;
	border-radius: 12rpx;
	padding: 20rpx 0;
	margin-bottom: 16rpx;
}
.meta-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6rpx; }
.meta-label { font-size: 22rpx; color: #B0B4C0; }
.meta-value { font-size: 26rpx; color: #1A1D28; font-weight: 600; }
.meta-value.price { color: #FF6B3D; }

.lease-dates { display: flex; align-items: center; gap: 6rpx; }
.date-text { font-size: 22rpx; color: #B0B4C0; }

.empty-sub { font-size: 24rpx; color: #B0B4C0; margin-top: 8rpx; }
</style>
