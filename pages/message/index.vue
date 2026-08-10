<template>
	<view class="page-container">
		<view class="page-body">
			<text class="page-title">消息</text>

			<!-- 消息列表 -->
			<view class="card" v-for="(msg, i) in messages" :key="i">
				<view class="msg-row">
					<view class="avatar"></view>
					<view class="msg-info">
						<view class="msg-top">
							<text class="msg-username">{{ msg.name }}</text>
							<text class="msg-time">{{ msg.time }}</text>
						</view>
						<text class="msg-preview text-ellipsis">{{ msg.preview }}</text>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="messages.length === 0" class="empty-state">
				<text class="empty-icon">📭</text>
				<text>暂无消息</text>
			</view>
		</view>

		<AppTabBar :current="3" />
	</view>
</template>

<script>
import AppTabBar from '@/components/CustomTabBar.vue';

export default {
	components: {
		AppTabBar,
	},
	data() {
		return {
			messages: [
				{
					name: '系统通知',
					time: '刚刚',
					preview: '欢迎使用校园互助平台！',
				},
				{
					name: '张三',
					time: '10分钟前',
					preview: '好的，我下午去拿，谢谢！',
				},
				{
					name: '李四',
					time: '1小时前',
					preview: '请问东西还在吗？',
				},
			],
		};
	},
};
</script>

<style scoped>
.msg-row {
	display: flex;
	align-items: center;
}

.avatar {
	width: 88rpx;
	height: 88rpx;
	background: #E0E0E0;
	border-radius: 50%;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.msg-info {
	flex: 1;
	min-width: 0;
}

.msg-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}

.msg-username {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.msg-time {
	font-size: 22rpx;
	color: #999;
	flex-shrink: 0;
	margin-left: 16rpx;
}

.msg-preview {
	font-size: 24rpx;
	color: #999;
	display: block;
}
</style>
