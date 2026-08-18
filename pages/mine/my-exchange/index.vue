<template>
	<view class="page-container--clean">
		<view class="page-body">
			<!-- 互助记录列表 -->
			<view v-if="list.length > 0" class="ex-list">
				<view v-for="item in list" :key="item.id" class="card ex-card">
					<view class="ex-top">
						<view class="ex-badges">
							<text class="role-badge" :style="{ background: roleInfo(item.role).bg, color: roleInfo(item.role).color }">
								{{ roleInfo(item.role).label }}
							</text>
							<text class="status-badge" :style="{ background: statusInfo(item.status).bg, color: statusInfo(item.status).color }">
								{{ statusInfo(item.status).label }}
							</text>
							<text v-if="item.tab" class="tab-badge">{{ item.tab }}</text>
						</view>
						<text class="ex-time">{{ formatTime(item.publishTime) }}</text>
					</view>

					<text class="ex-title text-ellipsis-2">{{ item.title }}</text>
					<text v-if="item.desc" class="ex-desc text-ellipsis">{{ item.desc }}</text>

					<view class="ex-meta">
						<view class="ex-meta-left">
							<view v-if="item.reward" class="reward-tag">
								<AppIcon name="price" :size="24" color="#F59E0B" />
								<text class="reward-text">¥{{ item.reward }}</text>
							</view>
							<text v-if="item.campus" class="ex-campus">{{ item.campus }}</text>
						</view>
						<view class="ex-replies">
							<AppIcon name="chat-bubble" :size="26" color="#6B6F80" />
							<text class="reply-text">{{ item.replyCount || 0 }} 回复</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else class="empty-state">
				<AppIcon name="exchange" :size="64" color="#8B8FA3" />
				<text class="empty-text">暂无互助记录</text>
				<text class="empty-sub">去互助广场看看同学们的需求吧~</text>
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
				this.list = await get('/api/user/exchange-posts');
			} catch (e) {
				this.list = [];
			}
		},
		roleInfo(role) {
			const map = {
				publish: { label: '我发布的', color: '#4F6EF7', bg: '#EDF0FE' },
				join: { label: '我参与的', color: '#F59E0B', bg: '#FFF3E0' },
			};
			return map[role] || { label: '参与', color: '#6B6F80', bg: '#F2F3F8' };
		},
		statusInfo(status) {
			const map = {
				active: { label: '进行中', color: '#4F6EF7', bg: '#EDF0FE' },
				done: { label: '已完成', color: '#22C55E', bg: '#E8F8EE' },
				closed: { label: '已关闭', color: '#6B6F80', bg: '#F2F3F8' },
				offline: { label: '已关闭', color: '#6B6F80', bg: '#F2F3F8' },
			};
			return map[status] || { label: '未知', color: '#6B6F80', bg: '#F2F3F8' };
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
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.ex-card { padding: 24rpx; }
.ex-top { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; margin-bottom: 14rpx; }
.ex-badges { display: flex; align-items: center; gap: 10rpx; flex-wrap: wrap; }
.role-badge, .status-badge, .tab-badge {
	padding: 4rpx 14rpx; border-radius: 8rpx; font-size: 22rpx;
}
.tab-badge { background: #F2F3F8; color: #6B6F80; }
.ex-time { font-size: 22rpx; color: #6B6F80; flex-shrink: 0; }

.ex-title { font-size: 30rpx; font-weight: 600; color: #1A1D28; display: block; line-height: 1.4; }
.ex-desc { font-size: 24rpx; color: #8B8FA3; line-height: 1.5; display: block; margin-top: 10rpx; }

.ex-meta {
	display: flex; align-items: center; justify-content: space-between;
	margin-top: 18rpx; padding-top: 16rpx; border-top: 1px solid #F2F3F8;
}
.ex-meta-left { display: flex; align-items: center; gap: 14rpx; }
.reward-tag {
	display: flex; align-items: center; gap: 4rpx;
	padding: 4rpx 12rpx; border-radius: 8rpx; background: #FFF3E0;
}
.reward-text { font-size: 22rpx; color: #F59E0B; font-weight: 600; }
.ex-campus { font-size: 22rpx; color: #8B8FA3; }
.ex-replies { display: flex; align-items: center; gap: 6rpx; }
.reply-text { font-size: 22rpx; color: #6B6F80; }

.empty-sub { font-size: 24rpx; color: #6B6F80; margin-top: 8rpx; }
</style>
