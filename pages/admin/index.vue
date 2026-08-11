<template>
	<view class="admin-page">
		<!-- 统计卡片 -->
		<view class="admin-stats">
			<view class="stat-card">
				<text class="stat-value">{{ stats.totalUsers }}</text>
				<text class="stat-label">注册用户</text>
			</view>
			<view class="stat-card">
				<text class="stat-value">{{ stats.totalItems }}</text>
				<text class="stat-label">物品总数</text>
			</view>
			<view class="stat-card">
				<text class="stat-value">{{ stats.totalTrades }}</text>
				<text class="stat-label">成交数量</text>
			</view>
			<view class="stat-card">
				<text class="stat-value">{{ stats.pendingReview }}</text>
				<text class="stat-label">待审核</text>
			</view>
		</view>

		<!-- 管理 Tabs -->
		<view class="admin-tabs">
			<view
				v-for="t in tabs"
				:key="t.value"
				:class="['admin-tab', { active: adminTab === t.value }]"
				@click="switchTab(t.value)"
			>
				<text>{{ t.label }}</text>
			</view>
		</view>

		<!-- 内容审核 -->
		<scroll-view scroll-y class="admin-scroll" v-if="adminTab === 'review'">
			<view v-if="reviewList.length > 0">
				<view class="card review-item" v-for="item in reviewList" :key="item.id">
					<view class="review-top">
						<view class="review-img">
							<AppIcon name="image" :size="36" color="#D0D3E0" />
						</view>
						<view class="review-info">
							<text class="review-title text-ellipsis">{{ item.title }}</text>
							<text class="review-user">{{ item.userName }} · {{ formatRelativeTime(item.createdAt) }}</text>
						</view>
					</view>
					<view class="review-bottom">
						<text class="review-category">分类：{{ item.category }}</text>
						<view class="review-actions">
							<view class="action-btn reject" @click="handleReview(item, 'reject')"><text>驳回</text></view>
							<view class="action-btn approve" @click="handleReview(item, 'approve')"><text>通过</text></view>
						</view>
					</view>
				</view>
			</view>
			<view v-else class="empty-state">
				<AppIcon name="check" :size="80" color="#CCC" />
				<text>暂无待审核内容</text>
			</view>
		</scroll-view>

		<!-- 用户管理 -->
		<scroll-view scroll-y class="admin-scroll" v-if="adminTab === 'user'">
			<view v-if="userList.length > 0">
				<view class="card user-item" v-for="user in userList" :key="user.id">
					<view class="user-top">
						<view class="user-avatar">
							<text>{{ (user.nickname || '?').charAt(0) }}</text>
						</view>
						<view class="user-info">
							<text class="user-name">{{ user.nickname }}</text>
							<text class="user-meta">学号：{{ user.studentId }} · 信誉：{{ user.creditScore }}</text>
						</view>
					</view>
					<view class="user-bottom">
						<text :class="['user-status', user.status]">{{ user.status === 'normal' ? '正常' : '已拉黑' }}</text>
						<view v-if="user.status === 'normal'" class="action-btn warn sm" @click="handleBlacklist(user)"><text>拉黑</text></view>
						<view v-else class="action-btn sm" @click="handleUnblock(user)"><text>解封</text></view>
					</view>
				</view>
			</view>
			<view v-else class="empty-state">
				<AppIcon name="user" :size="80" color="#CCC" />
				<text>暂无用户</text>
			</view>
		</scroll-view>

		<!-- 举报处理 -->
		<scroll-view scroll-y class="admin-scroll" v-if="adminTab === 'report'">
			<view v-if="reportList.length > 0">
				<view class="card report-item" v-for="r in reportList" :key="r.id">
					<view class="report-top">
						<text :class="['report-type', r.type]">{{ r.type === 'fake' ? '虚假信息' : r.type === 'violation' ? '违规内容' : '其他' }}</text>
						<text class="report-time">{{ formatRelativeTime(r.createdAt) }}</text>
					</view>
					<text class="report-reason">{{ r.reason }}</text>
					<text class="report-target">关联内容：{{ r.targetTitle }}</text>
					<view class="review-bottom">
						<view class="report-actions">
							<view class="action-btn reject" @click="handleReport(r, 'dismiss')"><text>忽略</text></view>
							<view class="action-btn warn" @click="handleReport(r, 'handle')"><text>处理</text></view>
						</view>
					</view>
				</view>
			</view>
			<view v-else class="empty-state">
				<AppIcon name="shield" :size="80" color="#CCC" />
				<text>暂无举报</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get, post } from '@/utils/request.js';

export default {
	components: { AppIcon },
	data() {
		return {
			adminTab: 'review',
			tabs: [
				{ label: '内容审核', value: 'review' },
				{ label: '用户管理', value: 'user' },
				{ label: '举报处理', value: 'report' },
			],
			stats: { totalUsers: 0, totalItems: 0, totalTrades: 0, pendingReview: 0 },
			reviewList: [],
			userList: [],
			reportList: [],
			loading: false,
		};
	},
	onShow() {
		this.loadAll();
	},
	methods: {
		switchTab(value) {
			this.adminTab = value;
		},
		formatRelativeTime(ts) {
			if (!ts) return '';
			const diff = Date.now() - ts;
			const min = Math.floor(diff / 60000);
			if (min < 1) return '刚刚';
			if (min < 60) return min + '分钟前';
			const hours = Math.floor(min / 60);
			if (hours < 24) return hours + '小时前';
			const days = Math.floor(hours / 24);
			if (days < 30) return days + '天前';
			const d = new Date(ts);
			return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
		},
		async loadAll() {
			if (this.loading) return;
			this.loading = true;
			try {
				const [stats, reviews, users, reports] = await Promise.all([
					get('/api/admin/statistics'),
					get('/api/admin/review-list'),
					get('/api/admin/user-list'),
					get('/api/admin/reports'),
				]);
				this.stats = stats || this.stats;
				this.reviewList = reviews || [];
				this.userList = users || [];
				this.reportList = reports || [];
			} catch (e) {
				/* mock 兜底 */
			} finally {
				this.loading = false;
			}
		},
		handleReview(item, action) {
			const text = action === 'approve' ? '通过' : '驳回';
			uni.showModal({
				title: '确认' + text,
				content: '确定' + text + '「' + item.title + '」吗？',
				success: async (res) => {
					if (!res.confirm) return;
					try {
						await post('/api/admin/review', { id: item.id, action });
					} catch (e) { /* 本地同步 */ }
					this.reviewList = this.reviewList.filter((r) => r.id !== item.id);
					this.stats.pendingReview = Math.max(0, (this.stats.pendingReview || 1) - 1);
					uni.showToast({ title: '已' + text, icon: 'success' });
				},
			});
		},
		handleBlacklist(user) {
			uni.showModal({
				title: '拉黑用户',
				content: '确定将「' + user.nickname + '」加入黑名单？',
				success: async (res) => {
					if (!res.confirm) return;
					try {
						await post('/api/admin/handle-user', { id: user.id, action: 'block' });
					} catch (e) { /* 本地同步 */ }
					user.status = 'blocked';
					uni.showToast({ title: '已拉黑', icon: 'success' });
				},
			});
		},
		handleUnblock(user) {
			uni.showModal({
				title: '解除拉黑',
				content: '确定解除「' + user.nickname + '」的黑名单？',
				success: async (res) => {
					if (!res.confirm) return;
					try {
						await post('/api/admin/handle-user', { id: user.id, action: 'unblock' });
					} catch (e) { /* 本地同步 */ }
					user.status = 'normal';
					uni.showToast({ title: '已解封', icon: 'success' });
				},
			});
		},
		handleReport(r, action) {
			post('/api/admin/report', { id: r.id, action }).catch(() => {});
			this.reportList = this.reportList.filter((item) => item.id !== r.id);
			uni.showToast({ title: action === 'handle' ? '已处理' : '已忽略', icon: 'success' });
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.admin-page { min-height: 100vh; background: #F5F5F5; }
.admin-stats {
	display: flex; background: #FFF; padding: 28rpx 12rpx;
	margin-bottom: 16rpx;
}
.stat-card { flex: 1; text-align: center; }
.stat-value { font-size: 40rpx; font-weight: 700; color: #4F6EF7; display: block; }
.stat-label { font-size: 22rpx; color: #999; margin-top: 6rpx; display: block; }

.admin-tabs {
	display: flex; background: #FFF; padding: 0 24rpx;
	border-bottom: 1rpx solid #F0F0F0;
}
.admin-tab {
	flex: 1; text-align: center; padding: 24rpx 0;
	font-size: 28rpx; color: #666; position: relative;
}
.admin-tab.active { color: #4F6EF7; font-weight: 700; }
.admin-tab.active::after {
	content: ''; position: absolute; bottom: 0; left: 50%;
	transform: translateX(-50%); width: 40rpx; height: 6rpx;
	background: #4F6EF7; border-radius: 3rpx;
}

.admin-scroll { padding: 20rpx 24rpx; }
.card { margin: 0 0 16rpx; padding: 22rpx 24rpx; }

.review-top { display: flex; align-items: center; gap: 16rpx; }
.review-img {
	width: 88rpx; height: 88rpx; border-radius: 12rpx; flex-shrink: 0;
	background: #F5F5F5; display: flex; align-items: center; justify-content: center;
}
.review-info { flex: 1; min-width: 0; }
.review-title { font-size: 28rpx; color: #333; font-weight: 600; display: block; }
.review-user { font-size: 22rpx; color: #BBB; display: block; margin-top: 6rpx; }
.review-bottom {
	display: flex; align-items: center; justify-content: space-between;
	margin-top: 16rpx; padding-top: 16rpx; border-top: 1rpx solid #F5F5F5;
}
.review-category { font-size: 24rpx; color: #999; }
.review-actions, .report-actions { display: flex; gap: 12rpx; }

.action-btn {
	padding: 10rpx 28rpx; border-radius: 10rpx; font-size: 24rpx;
	background: #F5F5F5; color: #666;
}
.action-btn.approve { background: #E8F8EE; color: #22C55E; }
.action-btn.reject { background: #FFF0F0; color: #FF4D4F; }
.action-btn.warn { background: #FFF8E1; color: #F59E0B; }
.action-btn.sm { padding: 6rpx 20rpx; font-size: 22rpx; }

.user-top { display: flex; align-items: center; gap: 16rpx; }
.user-avatar {
	width: 76rpx; height: 76rpx; border-radius: 50%; flex-shrink: 0;
	background: linear-gradient(135deg, #4F6EF7, #6366F1);
	display: flex; align-items: center; justify-content: center;
}
.user-avatar text { font-size: 30rpx; font-weight: bold; color: #FFF; }
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 28rpx; color: #333; font-weight: 600; display: block; }
.user-meta { font-size: 22rpx; color: #999; display: block; margin-top: 6rpx; }
.user-bottom {
	display: flex; align-items: center; justify-content: flex-end; gap: 12rpx;
	margin-top: 16rpx; padding-top: 16rpx; border-top: 1rpx solid #F5F5F5;
}
.user-status { font-size: 22rpx; padding: 4rpx 14rpx; border-radius: 6rpx; }
.user-status.normal { background: #E8F8EE; color: #22C55E; }
.user-status.blocked { background: #FFF0F0; color: #FF4D4F; }

.report-top { display: flex; align-items: center; justify-content: space-between; }
.report-type { font-size: 22rpx; padding: 4rpx 14rpx; border-radius: 6rpx; }
.report-type.fake { background: #FFF0F0; color: #FF4D4F; }
.report-type.violation { background: #FFF8E1; color: #F59E0B; }
.report-time { font-size: 22rpx; color: #CCC; }
.report-reason { font-size: 26rpx; color: #333; display: block; margin-top: 14rpx; }
.report-target { font-size: 24rpx; color: #999; display: block; margin-top: 8rpx; }
</style>
