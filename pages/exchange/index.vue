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
					@click="onTabChange(i)"
				>
					{{ tab.label }}
				</text>
			</view>

			<!-- 帖子列表 -->
			<view v-if="postList.length > 0">
				<view
					v-for="post in postList"
					:key="post.id"
					class="exchange-card"
					@click="goDetail(post)"
				>
					<!-- 卡片头部 -->
					<view class="card-header">
						<view
							class="avatar"
							:style="{ background: post.user.avatarBg || '#E0E0E0' }"
						></view>
						<view class="card-meta">
							<text class="card-username">{{ post.user.nickname }}</text>
							<text class="card-time">{{ post.createdAtText }}</text>
						</view>
						<text :class="['tag', post.type === 'wish' ? 'tag-wish' : 'tag-exchange']">
							{{ post.type === 'wish' ? (post.isBorrow ? '求借' : '求购') : '以物换物' }}
						</text>
					</view>

					<!-- 标题 -->
					<text class="card-title">{{ post.title }}</text>
					<text class="card-desc text-ellipsis-2">{{ post.description }}</text>

					<!-- 交换/求购信息 -->
					<view class="exchange-info">
						<view v-if="post.type === 'exchange'" class="exchange-flow">
							<view class="flow-item">
								<text class="flow-label">我有</text>
								<text class="flow-value">{{ post.myItem.name }}</text>
							</view>
							<view class="flow-arrow">
								<AppIcon name="exchange" :size="32" color="#4F6EF7" />
							</view>
							<view class="flow-item">
								<text class="flow-label">想换</text>
								<text class="flow-value">{{ post.wantItem.name }}</text>
							</view>
						</view>
						<view v-else class="wish-info">
							<text class="wish-target">目标：{{ post.wantedItem.name }}</text>
							<text v-if="post.wantedItem.budget > 0" class="wish-budget">
								预算 ¥{{ post.wantedItem.budget }}
							</text>
						</view>
					</view>

					<!-- 物品预览图 -->
					<view v-if="post.images && post.images.length > 0" class="card-images">
						<image
							v-for="(img, idx) in post.images.slice(0, 3)"
							:key="idx"
							:src="img"
							class="card-image-item"
							mode="aspectFill"
						/>
						<view v-if="post.images.length > 3" class="card-image-more">
							<text>+{{ post.images.length - 3 }}</text>
						</view>
					</view>

					<!-- 底部操作 -->
					<view class="card-footer">
						<text class="footer-views">{{ post.views }} 次浏览</text>
						<view class="footer-action" @click.stop="goChat(post)">
							<AppIcon name="chat" :size="28" color="#4F6EF7" />
							<text class="action-text">聊聊</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else class="empty-state">
				<text class="empty-icon">🤝</text>
				<text class="empty-text">暂无互助帖子</text>
				<text class="empty-sub">发布第一个心愿或求出帖吧~</text>
			</view>
		</view>

		<AppTabBar :current="1" />
	</view>
</template>

<script>
import AppTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';
import { get } from '@/utils/request.js';
import store from '@/utils/store.js';

export default {
	components: { AppTabBar, AppIcon },
	data() {
		return {
			currentTab: 0,
			tabs: [
				{ label: '全部', value: '' },
				{ label: '以物换物', value: 'exchange' },
				{ label: '求购', value: 'wish' },
				{ label: '求借', value: 'borrow' },
			],
			postList: [],
		};
	},
	onShow() {
		this.loadPosts();
	},
	methods: {
		async loadPosts() {
			try {
				const params = { page: 1, pageSize: 20 };
				const tab = this.tabs[this.currentTab];
				if (tab.value === 'exchange') {
					params.type = 'exchange';
				} else if (tab.value === 'wish') {
					params.type = 'wish';
				}
				const data = await get('/api/exchange-posts', params);
				let list = data.list;
				// 前端过滤求借
				if (tab.value === 'borrow') {
					list = list.filter((p) => p.type === 'wish' && p.isBorrow);
				}
				this.postList = list;
			} catch (e) {
				this.postList = [];
			}
		},
		onTabChange(i) {
			this.currentTab = i;
			this.loadPosts();
		},
		goDetail(post) {
			uni.navigateTo({ url: '/pages/exchange/detail?id=' + post.id });
		},
		goChat(post) {
			if (!store.isLoggedIn) {
				uni.reLaunch({ url: '/pages/login/index' });
				return;
			}
			// 跳转到聊天页
			uni.navigateTo({
				url: '/pages/chat/index?id=conv1&exchangeId=' + post.id,
			});
		},
	},
};
</script>

<style scoped>
.tab-row {
	display: flex;
	margin-bottom: 24rpx;
	gap: 12rpx;
}

.tab-item {
	padding: 12rpx 28rpx;
	border-radius: 28rpx;
	font-size: 26rpx;
	color: #6B6F80;
	background: #FFFFFF;
	transition: all 0.2s;
}

.tab-item.active {
	color: #FFFFFF;
	background: #4F6EF7;
	font-weight: 500;
}

/* 帖子卡片 */
.exchange-card {
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.card-header {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
}

.avatar {
	width: 64rpx;
	height: 64rpx;
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
	font-size: 26rpx;
	color: #1A1D28;
	font-weight: 500;
}

.card-time {
	font-size: 22rpx;
	color: #B0B4C0;
	margin-top: 2rpx;
}

.tag {
	padding: 6rpx 16rpx;
	border-radius: 12rpx;
	font-size: 22rpx;
	font-weight: 500;
}

.tag-wish {
	background: #FFF0EB;
	color: #FF6B3D;
}

.tag-exchange {
	background: #EDF0FE;
	color: #4F6EF7;
}

.card-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #1A1D28;
	display: block;
	margin-bottom: 8rpx;
}

.card-desc {
	font-size: 24rpx;
	color: #8B8FA3;
	line-height: 1.5;
	display: block;
	margin-bottom: 16rpx;
}

/* 物品预览图 */
.card-images {
	display: flex;
	gap: 8rpx;
	margin-bottom: 16rpx;
}

.card-image-item {
	width: 140rpx;
	height: 140rpx;
	border-radius: 10rpx;
	background: #F3F4F8;
}

.card-image-more {
	width: 140rpx;
	height: 140rpx;
	border-radius: 10rpx;
	background: rgba(0, 0, 0, 0.35);
	display: flex;
	align-items: center;
	justify-content: center;
}

.card-image-more text {
	font-size: 30rpx;
	color: #FFFFFF;
	font-weight: 600;
}

/* 交换信息区 */
.exchange-info {
	background: #F8F9FC;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 16rpx;
}

.exchange-flow {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.flow-item {
	display: flex;
	flex-direction: column;
	flex: 1;
}

.flow-label {
	font-size: 20rpx;
	color: #B0B4C0;
	margin-bottom: 4rpx;
}

.flow-value {
	font-size: 26rpx;
	color: #1A1D28;
	font-weight: 500;
}

.flow-arrow {
	padding: 0 16rpx;
}

.wish-info {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.wish-target {
	font-size: 26rpx;
	color: #1A1D28;
	font-weight: 500;
}

.wish-budget {
	font-size: 28rpx;
	color: #FF6B3D;
	font-weight: 700;
}

/* 底部 */
.card-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.footer-views {
	font-size: 22rpx;
	color: #B0B4C0;
}

.footer-action {
	display: flex;
	align-items: center;
	gap: 6rpx;
	padding: 10rpx 20rpx;
	border-radius: 20rpx;
	background: #EDF0FE;
	transition: all 0.15s;
}

.footer-action:active {
	background: #DEE3FD;
}

.action-text {
	font-size: 24rpx;
	color: #4F6EF7;
	font-weight: 500;
}

.empty-sub {
	font-size: 24rpx;
	color: #B0B4C0;
	margin-top: 8rpx;
}
</style>
