<template>
	<view class="page-container">
		<view class="page-body">
			<view v-if="list.length > 0">
				<view
					v-for="post in list"
					:key="post.id"
					class="exchange-card"
				>
					<view class="card-top">
						<text class="card-title text-ellipsis">{{ post.title }}</text>
						<text :class="['status-tag', post.status === 'active' ? 'active' : 'closed']">
							{{ post.status === 'active' ? '进行中' : '已关闭' }}
						</text>
					</view>
					<text class="card-desc text-ellipsis-2">{{ post.description }}</text>
					<view class="card-footer">
						<text class="footer-meta">{{ post.views }} 次浏览 · {{ post.createdAtText }}</text>
						<text class="footer-action" @click="closePost(post)" v-if="post.status === 'active'">关闭</text>
					</view>
				</view>
			</view>

			<view v-else class="empty-state">
				<text class="empty-icon">🤝</text>
				<text class="empty-text">还没有发布互助帖子</text>
				<text class="empty-sub">去互助板块发布心愿或交换吧~</text>
			</view>
		</view>
	</view>
</template>

<script>
import { get } from '@/utils/request.js';

export default {
	data() { return { list: [] }; },
	onShow() { this.loadData(); },
	methods: {
		async loadData() {
			try {
				this.list = await get('/api/user/exchange-posts');
			} catch (e) { this.list = []; }
		},
		closePost(post) {
			uni.showModal({
				title: '关闭帖子',
				content: '确定关闭「' + post.title + '」吗？',
				success: (res) => {
					if (res.confirm) {
						post.status = 'closed';
						uni.showToast({ title: '已关闭', icon: 'success' });
					}
				},
			});
		},
	},
};
</script>

<style scoped>
.exchange-card {
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(31, 41, 88, 0.06);
}
.card-top {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 10rpx;
}
.card-title { font-size: 28rpx; font-weight: 600; color: #1A1D28; flex: 1; margin-right: 16rpx; }
.status-tag {
	padding: 4rpx 14rpx;
	border-radius: 12rpx;
	font-size: 22rpx;
	font-weight: 500;
	flex-shrink: 0;
}
.status-tag.active { background: #EDF0FE; color: #4F6EF7; }
.status-tag.closed { background: #F2F3F8; color: #6B6F80; }
.card-desc { font-size: 24rpx; color: #8B8FA3; line-height: 1.5; display: block; margin-bottom: 14rpx; }
.card-footer { display: flex; justify-content: space-between; align-items: center; }
.footer-meta { font-size: 22rpx; color: #6B6F80; }
.footer-action { font-size: 24rpx; color: #EF4444; }
.empty-sub { font-size: 24rpx; color: #6B6F80; margin-top: 8rpx; }
</style>
