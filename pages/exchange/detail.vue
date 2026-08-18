<template>
	<view class="detail-page">
		<!-- 图片展示区 -->
		<view class="image-stage" :style="{ background: post.imageBg || '#F2F3F8' }">
			<swiper v-if="post.images && post.images.length > 0" class="image-swiper" indicator-dots indicator-color="rgba(255,255,255,0.5)" indicator-active-color="#FFFFFF">
				<swiper-item v-for="(img, idx) in post.images" :key="idx">
					<image :src="img" class="swiper-image" mode="aspectFill" />
				</swiper-item>
			</swiper>
			<view v-else class="image-placeholder">
				<AppIcon name="image" :size="80" color="#D0D3E0" />
			</view>

			<!-- 左上角返回 -->
			<view class="back-btn" @click="goBack">
				<AppIcon name="back" :size="36" color="#1A1D28" />
			</view>

			<!-- 右下角图片计数 -->
			<view class="image-count" v-if="post.images && post.images.length > 0">
				<text>1/{{ post.images.length }}</text>
			</view>
		</view>

		<!-- 信息区 -->
		<view class="info-section">
			<!-- 类型标签 -->
			<view class="type-row">
				<text :class="['type-tag', post.type === 'wish' ? 'type-wish' : 'type-exchange']">
					{{ post.type === 'wish' ? (post.isBorrow ? '求借' : '求购') : '以物换物' }}
				</text>
				<text v-if="post.status === 'closed'" class="status-closed">已结束</text>
			</view>

			<!-- 标题 -->
			<text class="post-title">{{ post.title }}</text>

			<!-- 分类 -->
			<view class="category-row" v-if="post.wantItem && post.wantItem.category">
				<view class="cat-badge">
					<AppIcon name="tag" :size="24" color="#4F6EF7" />
					<text>{{ post.wantItem.category }}</text>
				</view>
			</view>

			<!-- 交换/求购信息 -->
			<view class="exchange-box">
				<view v-if="post.type === 'exchange'" class="exchange-flow">
					<view class="flow-item">
						<text class="flow-label">我有</text>
						<text class="flow-value">{{ post.myItem.name }}</text>
						<text v-if="post.myItem.condition" class="flow-cond">{{ post.myItem.condition }}</text>
					</view>
					<view class="flow-arrow">
						<AppIcon name="exchange" :size="40" color="#4F6EF7" />
					</view>
					<view class="flow-item">
						<text class="flow-label">想换</text>
						<text class="flow-value">{{ post.wantItem.name }}</text>
						<text v-if="post.wantItem.category" class="flow-cond">{{ post.wantItem.category }}</text>
					</view>
				</view>
				<view v-else class="wish-info">
					<view class="wish-row">
						<text class="wish-label">目标物品</text>
						<text class="wish-value">{{ post.wantedItem.name }}</text>
					</view>
					<view v-if="post.wantedItem.budget > 0" class="wish-row">
						<text class="wish-label">预算</text>
						<text class="wish-budget">¥{{ post.wantedItem.budget }}</text>
					</view>
				</view>
			</view>

			<!-- 发布者卡片 -->
			<view class="seller-card">
				<view
					class="seller-avatar"
					:style="{ background: post.user ? post.user.avatarBg : '#8FA1F8' }"
				></view>
				<view class="seller-info">
					<view class="seller-top">
						<text class="seller-name">{{ post.user ? post.user.nickname : '未知用户' }}</text>
						<text class="seller-badge">已认证</text>
					</view>
					<text class="seller-stats">
						发布 {{ post.user && post.user.stats ? post.user.stats.exchanges || 0 : 0 }} 次互助
					</text>
				</view>
				<AppIcon name="arrow-right" :size="28" color="#D0D3E0" />
			</view>

			<!-- 详细描述 -->
			<view class="desc-section">
				<text class="section-label">详细描述</text>
				<text :class="['desc-text', { 'desc-folded': !descExpanded }]">{{ post.description }}</text>
				<text
					v-if="descNeedsFold"
					class="desc-toggle"
					@click="descExpanded = !descExpanded"
				>
					{{ descExpanded ? '收起' : '展开全文' }}
				</text>
			</view>

			<!-- 联系方式 -->
			<view class="contact-section">
				<text class="section-label">联系方式</text>
				<view class="contact-card">
					<view class="contact-item">
						<AppIcon name="chat" :size="32" color="#4F6EF7" />
						<text class="contact-text">点击下方"聊聊"按钮发送消息</text>
					</view>
				</view>
			</view>

			<!-- 物品详情图片 -->
			<view class="images-section" v-if="post.images && post.images.length > 0">
				<text class="section-label">物品图片</text>
				<view class="images-grid">
					<view v-for="(img, idx) in post.images" :key="idx" class="images-item">
						<image :src="img" class="images-preview" mode="aspectFill" @click="previewImage(idx)" />
					</view>
				</view>
			</view>

			<!-- 发布时间和浏览 -->
			<view class="meta-section">
				<view class="meta-item">
					<AppIcon name="clock" :size="28" color="#6B6F80" />
					<text class="meta-text">{{ post.createdAtText }}</text>
				</view>
				<view class="meta-item">
					<AppIcon name="eye" :size="28" color="#6B6F80" />
					<text class="meta-text">{{ post.views || 0 }} 次浏览</text>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-spacer"></view>
		</view>

		<!-- 底部操作栏 -->
		<view class="action-bar">
			<view class="action-share" @click="handleShare">
				<AppIcon name="share" :size="40" color="#6B6F80" />
				<text class="action-label">分享</text>
			</view>
			<view class="action-chat" @click="goChat">
				<AppIcon name="chat" :size="36" color="#FFFFFF" />
				<text class="action-chat-text">聊聊</text>
			</view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get } from '@/utils/request.js';
import store from '@/utils/store.js';

export default {
	components: { AppIcon },
	data() {
		return {
			postId: '',
			post: {},
			descExpanded: false,
		};
	},
	computed: {
		descNeedsFold() {
			return this.post.description && this.post.description.length > 100;
		},
	},
	onLoad(options) {
		this.postId = options.id || '';
		if (this.postId) {
			this.loadDetail();
		}
	},
	methods: {
		async loadDetail() {
			try {
				const post = await get('/api/exchange-posts/' + this.postId);
				this.post = post;
			} catch (e) {
				// mock 兜底
				this.post = {
					id: this.postId,
					type: 'exchange',
					title: '互助详情加载中...',
					description: '',
					myItem: { name: '', condition: '' },
					wantItem: { name: '', category: '' },
					images: [],
					imageBg: '#F2F3F8',
					user: { nickname: '未知用户', avatarBg: '#8FA1F8', stats: { exchanges: 0 } },
					createdAtText: '刚刚',
					views: 0,
				};
			}
		},

		async goChat() {
			if (!store.isLoggedIn) {
				uni.reLaunch({ url: '/pages/login/index' });
				return;
			}

			// 使用帖子所属用户创建/获取会话
			try {
				const convId = await get('/api/conversations/find-or-create', {
					userId: this.post.user.id,
					exchangePostId: this.postId,
				});
				uni.navigateTo({
					url: '/pages/chat/index?id=' + (convId.id || convId),
				});
			} catch (e) {
				// mock 模式直接跳转
				uni.navigateTo({
					url: '/pages/chat/index?id=conv1&exchangeId=' + this.postId,
				});
			}
		},

		previewImage(idx) {
			uni.previewImage({
				current: idx,
				urls: this.post.images,
			});
		},

		handleShare() {
			uni.showToast({ title: '分享功能开发中', icon: 'none' });
		},

		goBack() {
			uni.navigateBack();
		},
	},
};
</script>

<style scoped>
.detail-page {
	min-height: 100vh;
	background: #F2F3F8;
}

/* ========== 图片展示区 ========== */
.image-stage {
	width: 100%;
	height: 560rpx;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.image-swiper {
	width: 100%;
	height: 100%;
}

.swiper-image {
	width: 100%;
	height: 100%;
}

.image-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-btn {
	position: absolute;
	top: 24rpx;
	left: 24rpx;
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.85);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 12rpx rgba(31, 41, 88, 0.1);
	z-index: 10;
}

.back-btn:active {
	transform: scale(0.95);
}

.image-count {
	position: absolute;
	right: 24rpx;
	bottom: 24rpx;
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
	background: rgba(0, 0, 0, 0.45);
	font-size: 22rpx;
	color: #FFFFFF;
	z-index: 10;
}

/* ========== 信息区 ========== */
.info-section {
	padding: 0 24rpx;
}

/* 类型标签 */
.type-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-top: 24rpx;
	margin-bottom: 16rpx;
}

.type-tag {
	padding: 6rpx 20rpx;
	border-radius: 14rpx;
	font-size: 24rpx;
	font-weight: 600;
}

.type-wish {
	background: #FFF0EB;
	color: #FF6B3D;
}

.type-exchange {
	background: #EDF0FE;
	color: #4F6EF7;
}

.status-closed {
	padding: 6rpx 16rpx;
	border-radius: 14rpx;
	font-size: 22rpx;
	background: #F2F3F8;
	color: #8B8FA3;
}

/* 标题 */
.post-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #1A1D28;
	line-height: 1.4;
	display: block;
	margin-bottom: 16rpx;
}

/* 分类 */
.category-row {
	margin-bottom: 16rpx;
}

.cat-badge {
	display: inline-flex;
	align-items: center;
	gap: 6rpx;
	padding: 6rpx 16rpx;
	border-radius: 12rpx;
	background: #EDF0FE;
}

.cat-badge text {
	font-size: 24rpx;
	color: #4F6EF7;
	font-weight: 500;
}

/* 交换信息 */
.exchange-box {
	background: linear-gradient(135deg, #F8F9FC, #F0F2FF);
	border-radius: 16rpx;
	padding: 24rpx;
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
	font-size: 22rpx;
	color: #6B6F80;
	margin-bottom: 6rpx;
}

.flow-value {
	font-size: 28rpx;
	color: #1A1D28;
	font-weight: 600;
}

.flow-cond {
	font-size: 22rpx;
	color: #8B8FA3;
	margin-top: 4rpx;
}

.flow-arrow {
	padding: 0 20rpx;
}

.wish-info {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.wish-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.wish-label {
	font-size: 24rpx;
	color: #8B8FA3;
}

.wish-value {
	font-size: 28rpx;
	color: #1A1D28;
	font-weight: 600;
}

.wish-budget {
	font-size: 32rpx;
	color: #FF6B3D;
	font-weight: 700;
}

/* 卖家卡片 */
.seller-card {
	display: flex;
	align-items: center;
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(31, 41, 88, 0.06);
}

.seller-card:active { background: #F8F9FC; }

.seller-avatar {
	width: 88rpx;
	height: 88rpx;
	border-radius: 50%;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.seller-info { flex: 1; min-width: 0; }

.seller-top {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 6rpx;
}

.seller-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #1A1D28;
}

.seller-badge {
	padding: 2rpx 12rpx;
	border-radius: 10rpx;
	font-size: 22rpx;
	color: #4F6EF7;
	background: #EDF0FE;
}

.seller-stats {
	font-size: 22rpx;
	color: #6B6F80;
}

/* 描述 */
.desc-section {
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(31, 41, 88, 0.06);
}

.section-label {
	display: block;
	font-size: 26rpx;
	font-weight: 600;
	color: #1A1D28;
	margin-bottom: 14rpx;
}

.desc-text {
	font-size: 28rpx;
	color: #6B6F80;
	line-height: 1.7;
	display: block;
}

.desc-folded {
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 4;
	-webkit-box-orient: vertical;
}

.desc-toggle {
	display: block;
	margin-top: 12rpx;
	font-size: 26rpx;
	color: #4F6EF7;
	padding: 8rpx 0;
}

/* 联系方式 */
.contact-section {
	margin-bottom: 16rpx;
}

.contact-card {
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(31, 41, 88, 0.06);
}

.contact-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.contact-text {
	font-size: 26rpx;
	color: #6B6F80;
}

/* 物品图片 */
.images-section {
	margin-bottom: 16rpx;
}

.images-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.images-item {
	width: 210rpx;
	height: 210rpx;
	border-radius: 12rpx;
	overflow: hidden;
	background: #F2F3F8;
}

.images-preview {
	width: 100%;
	height: 100%;
}

/* 元数据 */
.meta-section {
	display: flex;
	gap: 40rpx;
	padding: 16rpx 0;
	margin-bottom: 16rpx;
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.meta-text {
	font-size: 24rpx;
	color: #6B6F80;
}

/* 底部占位 */
.bottom-spacer {
	height: 140rpx;
}

/* 底部操作栏 */
.action-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 16rpx 24rpx;
	padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
	background: #FFFFFF;
	box-shadow: 0 -4rpx 24rpx rgba(31, 41, 88, 0.08);
	z-index: 100;
}

.action-share {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2rpx;
	padding: 0 16rpx;
	flex-shrink: 0;
}

.action-label {
	font-size: 22rpx;
	color: #8B8FA3;
}

.action-chat {
	flex: 1;
	height: 88rpx;
	border-radius: 22rpx;
	background: linear-gradient(135deg, #4F6EF7, #3D56D4);
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	box-shadow: 0 6rpx 24rpx rgba(79, 110, 247, 0.25);
	transition: all 0.15s;
}

.action-chat:active {
	transform: scale(0.98);
	box-shadow: 0 4rpx 16rpx rgba(79, 110, 247, 0.15);
}

.action-chat-text {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
}
</style>
