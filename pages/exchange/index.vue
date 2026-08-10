<template>
	<view class="page-container">
		<view class="page-body">
			<text class="page-title">互助</text>

			<!-- 分类切换 -->
			<view class="tab-row">
				<text
					v-for="(tab, i) in tabs"
					:key="i"
					:class="['tab-item', { active: currentTab === i }]"
					@click="currentTab = i"
				>
					{{ tab }}
				</text>
			</view>

			<!-- 求助列表 -->
			<view class="card" v-for="i in 3" :key="i">
				<view class="card-header">
					<view class="avatar"></view>
					<view class="card-meta">
						<text class="card-username">用户昵称</text>
						<text class="card-time">10分钟前</text>
					</view>
					<text class="tag">求帮助</text>
				</view>
				<text class="card-title">帮忙取快递</text>
				<text class="card-desc text-ellipsis-2">
					下午有个快递到菜鸟驿站，有没有顺路的同学帮忙取一下，有偿感谢~
				</text>
				<view class="card-footer">
					<view class="footer-left">
						<AppIcon name="location" :size="28" color="#999" />
						<text class="footer-text">北区菜鸟驿站</text>
					</view>
					<text class="footer-reward">¥5</text>
				</view>
			</view>
		</view>

		<AppTabBar :current="1" />
	</view>
</template>

<script>
import AppTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';

export default {
	components: {
		AppTabBar,
		AppIcon,
	},
	data() {
		return {
			currentTab: 0,
			tabs: ['全部', '代取快递', '拼单', '求助', '其他'],
		};
	},
};
</script>

<style scoped>
.tab-row {
	display: flex;
	margin-bottom: 24rpx;
	gap: 12rpx;
	flex-wrap: wrap;
}

.tab-item {
	padding: 10rpx 28rpx;
	border-radius: 30rpx;
	font-size: 26rpx;
	color: #666;
	background: #FFFFFF;
	transition: all 0.2s;
}

.tab-item.active {
	color: #FFFFFF;
	background: #3C7DFF;
}

.card-header {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
}

.avatar {
	width: 72rpx;
	height: 72rpx;
	background: #E0E0E0;
	border-radius: 50%;
	margin-right: 16rpx;
	flex-shrink: 0;
}

.card-meta {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.card-username {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.card-time {
	font-size: 22rpx;
	color: #999;
	margin-top: 4rpx;
}

.card-title {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
	display: block;
	margin-bottom: 10rpx;
}

.card-desc {
	font-size: 26rpx;
	color: #999;
	line-height: 1.5;
	display: block;
	margin-bottom: 16rpx;
}

.card-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.footer-left {
	display: flex;
	align-items: center;
}

.footer-text {
	font-size: 24rpx;
	color: #999;
	margin-left: 6rpx;
}

.footer-reward {
	font-size: 30rpx;
	color: #FF6B35;
	font-weight: bold;
}
</style>
