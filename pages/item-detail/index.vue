<template>
	<view class="detail-page">
		<!-- 图片展示区 -->
		<view class="image-stage" :style="{ background: item.imageBg || '#F2F3F8' }">
			<!-- 模拟物品大图 -->
			<view class="image-placeholder">
				<AppIcon name="image" :size="80" color="#D0D3E0" />
			</view>

			<!-- 左上角返回 -->
			<view class="back-btn" @click="goBack">
				<AppIcon name="back" :size="36" color="#1A1D28" />
			</view>

			<!-- 右下角图片计数 -->
			<view class="image-count" v-if="item.images && item.images.length > 0">
				<text>1/{{ item.images.length }}</text>
			</view>

			<!-- 底部渐隐 -->
			<view class="image-fade"></view>
		</view>

		<!-- 信息区 -->
		<view class="info-section">
			<!-- 价格行 -->
			<view class="price-row">
				<view class="price-main">
					<text v-if="item.price === 0" class="price-zero">免费</text>
					<text v-else class="price-value">¥{{ item.price }}</text>
					<text v-if="item.originalPrice" class="price-original">¥{{ item.originalPrice }}</text>
				</view>
				<view class="condition-tag">{{ item.condition }}</view>
			</view>

			<!-- 标题 -->
			<text class="item-title">{{ item.title }}</text>

			<!-- 标签 -->
			<view class="tags-row">
				<text class="tag-item">{{ item.category }}</text>
				<text v-if="item.tag" class="tag-item">{{ item.tag }}</text>
			</view>

			<!-- 卖家卡片 -->
			<view class="seller-card">
				<view
					class="seller-avatar"
					:style="{ background: item.seller ? item.seller.avatarBg : '#8FA1F8' }"
				></view>
				<view class="seller-info">
					<view class="seller-top">
						<text class="seller-name">{{ item.seller ? item.seller.nickname : '未知用户' }}</text>
						<text class="seller-badge">已认证</text>
					</view>
					<text class="seller-stats">
						发布 {{ item.seller && item.seller.stats ? item.seller.stats.posts : 0 }} ·
						成交 {{ item.seller && item.seller.stats ? Math.floor(item.seller.stats.posts * 0.7) : 0 }}
					</text>
				</view>
				<AppIcon name="arrow-right" :size="28" color="#D0D3E0" />
			</view>

			<!-- 物品描述 -->
			<view class="desc-section">
				<text class="section-label">物品描述</text>
				<text :class="['desc-text', { 'desc-folded': !descExpanded }]">{{ item.description }}</text>
				<text
					v-if="descNeedsFold"
					class="desc-toggle"
					@click="descExpanded = !descExpanded"
				>
					{{ descExpanded ? '收起' : '展开全文' }}
				</text>
			</view>

			<!-- 交易信息 -->
			<view class="meta-section">
				<text class="section-label">交易信息</text>
				<view class="meta-grid">
					<view class="meta-item">
						<AppIcon name="location" :size="32" color="#8B8FA3" />
						<text class="meta-text">{{ item.location || '校内' }}</text>
					</view>
					<view class="meta-item">
						<AppIcon name="clock" :size="32" color="#8B8FA3" />
						<text class="meta-text">{{ item.publishTimeText || '刚刚' }}</text>
					</view>
					<view class="meta-item">
						<AppIcon name="eye" :size="32" color="#8B8FA3" />
						<text class="meta-text">{{ item.viewCount || 0 }} 次浏览</text>
					</view>
				</view>
			</view>

			<!-- 底部占位（防止被固定栏遮挡） -->
			<view class="bottom-spacer"></view>
		</view>

		<!-- 底部操作栏 -->
		<view class="action-bar">
			<view class="action-fav" @click="toggleFavorite">
				<AppIcon
					:name="isFavorited ? 'heart-filled' : 'heart'"
					:size="44"
					:color="isFavorited ? '#EF4444' : '#6B6F80'"
				/>
				<text :class="['fav-text', { active: isFavorited }]">{{ isFavorited ? '已收藏' : '收藏' }}</text>
			</view>
			<view class="action-chat" @click="contactSeller">
				<AppIcon name="chat" :size="36" color="#FFFFFF" />
				<text class="action-chat-text">我想要</text>
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
			itemId: '',
			item: {},
			isFavorited: false,
			descExpanded: false,
		};
	},
	computed: {
		descNeedsFold() {
			return this.item.description && this.item.description.length > 80;
		},
	},
	onLoad(options) {
		this.itemId = options.id || '';
		if (this.itemId) {
			this.loadDetail();
		}
	},
	methods: {
		async loadDetail() {
			try {
				const item = await get('/api/items/' + this.itemId);
				this.item = item;
			} catch (e) {
				// mock 兜底
				this.item = {
					id: this.itemId,
					title: '物品详情加载中...',
					description: '',
					price: 0,
					imageBg: '#F2F3F8',
					condition: '全新',
					seller: { nickname: '未知用户', avatarBg: '#8FA1F8', stats: { posts: 0 } },
					publishTimeText: '刚刚',
					viewCount: 0,
				};
				uni.showToast({ title: '加载失败', icon: 'none' });
			}
		},

		toggleFavorite() {
			this.isFavorited = !this.isFavorited;
			uni.showToast({
				title: this.isFavorited ? '已收藏' : '已取消收藏',
				icon: 'success',
			});
		},

		contactSeller() {
			// 检查登录态
			if (!store.isLoggedIn) {
				uni.reLaunch({ url: '/pages/login/index' });
				return;
			}
			// 跳转到聊天页（携带物品信息作为关联物品）
			uni.navigateTo({
				url: '/pages/chat/index?id=conv1&itemId=' + this.itemId,
			});
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

.image-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
}

.image-fade {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 80rpx;
	background: linear-gradient(to top, rgba(31, 41, 88, 0.08), transparent);
}

/* 返回按钮 */
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
	/* backdrop-filter 在小程序中不支持，使用更高不透明度替代 */
	box-shadow: 0 2rpx 12rpx rgba(31, 41, 88, 0.1);
	z-index: 10;
}

.back-btn:active {
	transform: scale(0.95);
}

/* 图片计数 */
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

/* 价格行 */
.price-row {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	margin-top: 24rpx;
	margin-bottom: 12rpx;
}

.price-main {
	display: flex;
	align-items: baseline;
	gap: 12rpx;
}

.price-value {
	font-size: 48rpx;
	font-weight: 800;
	color: #FF6B3D;
	line-height: 1;
}

.price-zero {
	font-size: 44rpx;
	font-weight: 800;
	color: #22C55E;
	line-height: 1;
}

.price-original {
	font-size: 26rpx;
	color: #6B6F80;
	text-decoration: line-through;
}

.condition-tag {
	padding: 6rpx 16rpx;
	border-radius: 12rpx;
	font-size: 22rpx;
	font-weight: 500;
	background: #EDF0FE;
	color: #4F6EF7;
}

/* 标题 */
.item-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #1A1D28;
	line-height: 1.4;
	display: block;
	margin-bottom: 16rpx;
}

/* 标签 */
.tags-row {
	display: flex;
	gap: 12rpx;
	margin-bottom: 24rpx;
}

.tag-item {
	padding: 8rpx 20rpx;
	border-radius: 16rpx;
	font-size: 22rpx;
	color: #6B6F80;
	background: #FFFFFF;
}

/* ========== 卖家卡片 ========== */
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

/* ========== 描述 ========== */
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
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
}

.desc-toggle {
	display: block;
	margin-top: 12rpx;
	font-size: 26rpx;
	color: #4F6EF7;
	padding: 8rpx 0;
}

/* ========== 交易信息 ========== */
.meta-section {
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(31, 41, 88, 0.06);
}

.meta-grid {
	display: flex;
	gap: 40rpx;
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.meta-text {
	font-size: 24rpx;
	color: #8B8FA3;
}

/* ========== 底部占位 ========== */
.bottom-spacer {
	height: 140rpx;
}

/* ========== 底部操作栏 ========== */
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

.action-fav {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2rpx;
	padding: 0 16rpx;
	flex-shrink: 0;
}

.fav-text {
	font-size: 22rpx;
	color: #8B8FA3;
	transition: color 0.2s;
}

.fav-text.active { color: #EF4444; }

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
