<template>
	<view class="page-container--clean user-page">
		<view class="page-body">
			<!-- 用户信息头部 -->
			<view class="user-hero">
				<view class="hero-avatar" :style="{ background: user.avatarBg || 'linear-gradient(135deg, #4F6EF7, #3D56D4)' }">
					<text class="hero-avatar-text">{{ initial }}</text>
				</view>
				<view class="hero-info">
					<view class="hero-name-row">
						<text class="hero-name">{{ user.nickname || '匿名用户' }}</text>
						<view class="verify-badge">
							<AppIcon name="verify" :size="24" color="#22C55E" />
							<text class="verify-text">学生认证</text>
						</view>
					</view>
					<view class="hero-tags">
						<text class="hero-tag" v-if="user.school">{{ user.school }}</text>
						<text class="hero-tag" v-if="user.campus">{{ user.campus }}</text>
					</view>
					<text class="hero-bio">{{ user.bio || '这个人很懒，什么都没有留下~' }}</text>
				</view>
			</view>

			<!-- 数据统计 -->
			<view class="stats-card">
				<view class="stat-item">
					<text class="stat-num">{{ stats.sell }}</text>
					<text class="stat-label">在售</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-num">{{ stats.lease }}</text>
					<text class="stat-label">出租</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-num">{{ stats.posts }}</text>
					<text class="stat-label">互助</text>
				</view>
			</view>

			<!-- Tab 切换 -->
			<view class="tabs">
				<view
					v-for="t in tabs"
					:key="t.value"
					:class="['tab-item', { active: activeTab === t.value }]"
					@click="activeTab = t.value"
				>
					<text>{{ t.label }}</text>
				</view>
			</view>

			<!-- 在售物品（双列） -->
			<view v-if="activeTab === 'sell'">
				<view v-if="items.length > 0" class="item-grid">
					<view class="item-col">
						<view v-for="item in leftColumn" :key="item.id" class="item-card" @click="goItem(item)">
							<view class="item-image" :style="{ background: item.imageBg || '#F2F3F8' }">
								<image
									v-if="item.images && item.images.length > 0"
									:src="item.images[0]"
									class="item-image__img"
									mode="aspectFill"
									lazy-load
								/>
								<view v-else class="item-image__placeholder">
									<AppIcon name="image" :size="44" color="#D0D3E0" />
								</view>
								<view class="item-price-tag">
									<text v-if="item.price === 0" class="price-free">免费</text>
									<text v-else class="price-num">¥{{ item.price }}</text>
								</view>
							</view>
							<view class="item-info">
								<text class="item-title text-ellipsis-2">{{ item.title }}</text>
								<text class="item-campus">{{ item.campus || item.location }}</text>
							</view>
						</view>
					</view>
					<view class="item-col">
						<view v-for="item in rightColumn" :key="item.id" class="item-card" @click="goItem(item)">
							<view class="item-image" :style="{ background: item.imageBg || '#F2F3F8' }">
								<image
									v-if="item.images && item.images.length > 0"
									:src="item.images[0]"
									class="item-image__img"
									mode="aspectFill"
									lazy-load
								/>
								<view v-else class="item-image__placeholder">
									<AppIcon name="image" :size="44" color="#D0D3E0" />
								</view>
								<view class="item-price-tag">
									<text v-if="item.price === 0" class="price-free">免费</text>
									<text v-else class="price-num">¥{{ item.price }}</text>
								</view>
							</view>
							<view class="item-info">
								<text class="item-title text-ellipsis-2">{{ item.title }}</text>
								<text class="item-campus">{{ item.campus || item.location }}</text>
							</view>
						</view>
					</view>
				</view>
				<view v-else class="empty-state">
					<AppIcon name="daily" :size="64" color="#8B8FA3" />
					<text>暂无在售物品</text>
				</view>
			</view>

			<!-- 出租物品 -->
			<view v-else-if="activeTab === 'lease'">
				<view v-if="leaseItems.length > 0" class="lease-list">
					<view v-for="item in leaseItems" :key="item.id" class="card lease-card" @click="goLease(item)">
						<view class="lease-row">
							<view class="lease-img">
								<image v-if="item.images && item.images.length > 0" :src="item.images[0]" class="lease-img__img" mode="aspectFill" lazy-load />
								<view v-else class="lease-img-placeholder">
									<AppIcon name="lease" :size="40" color="#8B8FA3" />
								</view>
							</view>
							<view class="lease-info">
								<text class="lease-title text-ellipsis">{{ item.title }}</text>
								<text class="lease-price-row">
									<text class="price-num">¥{{ item.price }}</text>
									<text class="price-unit">/天</text>
								</text>
								<text class="lease-meta">{{ item.campus }} · 押金 ¥{{ item.deposit }}</text>
							</view>
						</view>
					</view>
				</view>
				<view v-else class="empty-state">
					<AppIcon name="lease" :size="64" color="#8B8FA3" />
					<text>暂无出租物品</text>
				</view>
			</view>

			<!-- 互助帖子 -->
			<view v-else>
				<view v-if="exchangePosts.length > 0" class="post-list">
					<view v-for="post in exchangePosts" :key="post.id" class="card post-card" @click="goPost(post)">
						<view class="post-top">
							<text class="post-title text-ellipsis">{{ post.title }}</text>
							<view class="post-tag">{{ post.tab || post.type }}</view>
						</view>
						<text class="post-desc text-ellipsis-2">{{ post.description }}</text>
					</view>
				</view>
				<view v-else class="empty-state">
					<AppIcon name="exchange" :size="64" color="#8B8FA3" />
					<text>暂无互助帖子</text>
				</view>
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
			userId: '',
			user: {},
			items: [],
			leaseItems: [],
			exchangePosts: [],
			activeTab: 'sell',
			tabs: [
				{ label: '在售', value: 'sell' },
				{ label: '出租', value: 'lease' },
				{ label: '互助', value: 'posts' },
			],
		};
	},
	computed: {
		initial() {
			return (this.user.nickname || '?').charAt(0);
		},
		stats() {
			return {
				sell: this.items.length,
				lease: this.leaseItems.length,
				posts: this.exchangePosts.length,
			};
		},
		leftColumn() {
			return this.items.filter((item, i) => i % 2 === 0);
		},
		rightColumn() {
			return this.items.filter((item, i) => i % 2 === 1);
		},
	},
	onLoad(options) {
		if (options.id) {
			this.userId = options.id;
			this.loadUser(options.id);
		}
	},
	methods: {
		async loadUser(id) {
			try {
				const data = await get('/api/users/' + id);
				this.user = data.user || {};
				this.items = data.items || [];
				this.leaseItems = data.leaseItems || [];
				this.exchangePosts = data.exchangePosts || [];
			} catch (e) {
				uni.showToast({ title: '用户不存在', icon: 'none' });
			}
		},
		goItem(item) {
			uni.navigateTo({ url: '/pages/goods-detail/index?id=' + item.id });
		},
		goLease(item) {
			uni.navigateTo({ url: '/pages/lease-detail/index?id=' + item.id });
		},
		goPost(post) {
			uni.navigateTo({ url: '/pages/exchange-detail/index?id=' + post.id });
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.user-hero {
	display: flex; align-items: center; gap: 24rpx;
	background: #FFF; border-radius: 20rpx; padding: 30rpx 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(31, 41, 88, 0.06); margin-bottom: 20rpx;
}
.hero-avatar {
	width: 120rpx; height: 120rpx; border-radius: 50%; flex-shrink: 0;
	display: flex; align-items: center; justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(31, 41, 88, 0.1);
}
.hero-avatar-text { font-size: 44rpx; font-weight: bold; color: #FFF; }
.hero-info { flex: 1; min-width: 0; }
.hero-name-row { display: flex; align-items: center; gap: 12rpx; }
.hero-name { font-size: 34rpx; font-weight: 700; color: #1A1D28; }
.verify-badge { display: flex; align-items: center; gap: 4rpx; background: #E8F8EE; padding: 4rpx 12rpx; border-radius: 20rpx; }
.verify-text { font-size: 22rpx; color: #22C55E; font-weight: 500; }
.hero-tags { display: flex; gap: 10rpx; margin-top: 10rpx; }
.hero-tag { padding: 4rpx 14rpx; background: #F2F3F8; border-radius: 8rpx; font-size: 22rpx; color: #6B6F80; }
.hero-bio { display: block; font-size: 22rpx; color: #8B8FA3; margin-top: 10rpx; }

.stats-card {
	display: flex; background: #FFF; border-radius: 20rpx; padding: 30rpx 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(31, 41, 88, 0.06); margin-bottom: 20rpx;
}
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6rpx; }
.stat-num { font-size: 36rpx; font-weight: bold; color: #1A1D28; }
.stat-label { font-size: 22rpx; color: #6B6F80; }
.stat-divider { width: 1px; height: 40rpx; background: #EEF0F5; align-self: center; }

.tabs {
	display: flex; background: #FFF; border-radius: 16rpx; padding: 10rpx;
	margin-bottom: 20rpx; box-shadow: 0 2rpx 12rpx rgba(31, 41, 88, 0.06);
}
.tab-item { flex: 1; text-align: center; padding: 14rpx 0; border-radius: 9999rpx; font-size: 26rpx; color: #6B6F80; }
.tab-item.active { background: linear-gradient(135deg, #4F6EF7, #3D56D4); color: #FFF; font-weight: 600; }

.item-grid { display: flex; gap: 16rpx; align-items: flex-start; }
.item-col { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16rpx; }
.item-card { background: #FFF; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(31, 41, 88, 0.06); }
.item-image { width: 100%; height: 260rpx; position: relative; overflow: hidden; }
.item-image__img { width: 100%; height: 100%; }
.item-image__placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.item-price-tag {
	position: absolute; right: 12rpx; bottom: 12rpx; padding: 4rpx 16rpx;
	border-radius: 20rpx; background: rgba(0, 0, 0, 0.6); z-index: 2;
}
.price-num { font-size: 26rpx; font-weight: 700; color: #FF6B3D; }
.price-free { font-size: 24rpx; font-weight: 600; color: #22C55E; }
.item-info { padding: 14rpx 14rpx 18rpx; display: flex; flex-direction: column; gap: 8rpx; }
.item-title { font-size: 25rpx; font-weight: 600; color: #1A1D28; line-height: 1.4; }
.item-campus { font-size: 22rpx; color: #6B6F80; }

.lease-card { padding: 20rpx; }
.lease-row { display: flex; gap: 20rpx; align-items: center; }
.lease-img { width: 140rpx; height: 140rpx; flex-shrink: 0; position: relative; }
.lease-img__img { width: 100%; height: 100%; border-radius: 16rpx; }
.lease-img-placeholder {
	width: 100%; height: 100%; border-radius: 16rpx; background: #F2F3F8;
	display: flex; align-items: center; justify-content: center;
}
.lease-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8rpx; }
.lease-title { font-size: 28rpx; font-weight: 600; color: #1A1D28; }
.price-num { font-size: 30rpx; font-weight: 700; color: #FF6B3D; }
.price-unit { font-size: 22rpx; color: #FF6B3D; }
.lease-meta { font-size: 22rpx; color: #6B6F80; }

.post-card { padding: 22rpx 24rpx; }
.post-top { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.post-title { font-size: 28rpx; font-weight: 600; color: #1A1D28; flex: 1; min-width: 0; }
.post-tag { flex-shrink: 0; padding: 4rpx 14rpx; background: #EDF0FE; color: #4F6EF7; font-size: 22rpx; border-radius: 8rpx; }
.post-desc { display: block; font-size: 24rpx; color: #8B8FA3; line-height: 1.5; margin-top: 10rpx; }
</style>
