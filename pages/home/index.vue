<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 搜索栏 -->
			<view class="search-bar" @click="goSearch">
				<AppIcon name="search" :size="36" color="#B0B4C0" />
				<text class="search-placeholder">搜索你需要的物品或服务</text>
			</view>

			<!-- 分类快捷入口 -->
			<view class="category-scroll">
				<view
					v-for="cat in categories"
					:key="cat.id"
					:class="['category-item', { active: activeCategory === cat.id }]"
					@click="onCategoryChange(cat.id)"
				>
					<view
						class="category-icon"
						:style="{ background: cat.color + '18' }"
					>
						<AppIcon :name="cat.icon" :size="40" :color="cat.color" />
					</view>
					<text class="category-name">{{ cat.name }}</text>
				</view>
			</view>

			<!-- 热门推荐 / 最新发布 切换 -->
			<view class="section-header">
				<text class="section-title">{{ activeCategory ? '分类浏览' : '为你推荐' }}</text>
				<view class="sort-tabs">
					<text
						:class="['sort-tab', { active: sortBy === 'latest' }]"
						@click="sortBy = 'latest'; refreshList()"
					>最新</text>
					<text
						:class="['sort-tab', { active: sortBy === 'hot' }]"
						@click="sortBy = 'hot'; refreshList()"
					>热门</text>
				</view>
			</view>

			<!-- 物品列表 -->
			<view v-if="itemList.length > 0" class="item-list">
				<view
					v-for="item in itemList"
					:key="item.id"
					class="item-card"
					@click="goDetail(item)"
				>
					<!-- 物品图 -->
					<view class="item-image" :style="{ background: item.imageBg || '#F3F4F8' }">
						<image
							v-if="item.images && item.images.length > 0"
							:src="item.images[0]"
							class="item-image__img"
							mode="aspectFill"
						/>
						<view v-else class="item-image__placeholder">
							<AppIcon name="image" :size="56" color="#D0D3E0" />
						</view>
						<!-- 价格标签 -->
						<view class="item-price-tag">
							<text v-if="item.price === 0" class="price-free">免费</text>
							<text v-else class="price-num">¥{{ item.price }}</text>
						</view>
						<!-- 类型标签 -->
						<view v-if="item.type === 'lease'" class="item-type-tag">
							<text>可租</text>
						</view>
					</view>

					<view class="item-info">
						<text class="item-title text-ellipsis">{{ item.title }}</text>
						<text class="item-desc text-ellipsis-2">{{ item.description }}</text>

						<view class="item-footer">
							<view class="item-seller">
								<view
									class="item-avatar-sm"
									:style="{ background: item.seller && item.seller.avatarBg ? item.seller.avatarBg : '#E0E0E0' }"
								></view>
								<text class="item-seller-name">{{ item.seller ? item.seller.nickname : '匿名' }}</text>
							</view>
							<view class="item-meta">
								<view class="item-meta-item" v-if="item.viewCount">
									<AppIcon name="eye" :size="22" color="#B0B4C0" />
									<text>{{ item.viewCount }}</text>
								</view>
								<text class="item-location" v-if="item.location">{{ item.location }}</text>
								<text class="item-time">{{ item.publishTimeText }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else-if="!loading" class="empty-state">
				<text class="empty-icon">📦</text>
				<text class="empty-text">暂无物品</text>
				<text class="empty-sub">下拉刷新试试，或者去发布闲置吧~</text>
			</view>

			<!-- 加载状态 -->
			<view v-if="loading" class="loading-row">
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 没有更多 -->
			<view v-if="!hasMore && itemList.length > 0" class="loading-row">
				<text class="loading-text">— 已经到底了 —</text>
			</view>
		</view>

		<AppTabBar :current="0" />
	</view>
</template>

<script>
import AppTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';
import { get } from '@/utils/request.js';

export default {
	components: { AppTabBar, AppIcon },
	data() {
		return {
			categories: [],
			activeCategory: '',
			sortBy: 'latest',
			itemList: [],
			page: 1,
			pageSize: 10,
			hasMore: true,
			loading: false,
		};
	},
	onLoad() {
		this.loadCategories();
		this.loadItems();
	},
	// 下拉刷新
	onPullDownRefresh() {
		this.refreshList();
	},
	// 上拉加载更多
	onReachBottom() {
		if (this.hasMore && !this.loading) {
			this.page++;
			this.loadItems(true);
		}
	},
	methods: {
		async loadCategories() {
			try {
				const cats = await get('/api/categories');
				this.categories = cats;
			} catch (e) {
				this.categories = [
					{ id: 'c1', name: '教材教辅', icon: 'book', color: '#4F6EF7' },
					{ id: 'c2', name: '数码电子', icon: 'device', color: '#6366F1' },
					{ id: 'c3', name: '生活用品', icon: 'shirt', color: '#FF6B3D' },
					{ id: 'c4', name: '运动户外', icon: 'sport', color: '#22C55E' },
					{ id: 'c5', name: '免费赠送', icon: 'gift', color: '#F59E0B' },
					{ id: 'c6', name: '其他', icon: 'category', color: '#8B5CF6' },
				];
			}
		},

		async loadItems(append = false) {
			if (this.loading) return;
			this.loading = true;

			try {
				const data = await get('/api/items', {
					page: this.page,
					pageSize: this.pageSize,
					categoryId: this.activeCategory || undefined,
					sort: this.sortBy,
				});

				if (append) {
					this.itemList = [...this.itemList, ...data.list];
				} else {
					this.itemList = data.list;
				}
				this.hasMore = data.hasMore;
			} catch (e) {
				// mock 数据已内置
			} finally {
				this.loading = false;
				uni.stopPullDownRefresh();
			}
		},

		refreshList() {
			this.page = 1;
			this.hasMore = true;
			this.loadItems(false);
		},

		onCategoryChange(catId) {
			if (this.activeCategory === catId) {
				this.activeCategory = '';
			} else {
				this.activeCategory = catId;
			}
			this.refreshList();
		},

		goSearch() {
			uni.navigateTo({ url: '/pages/search/index' });
		},

		goDetail(item) {
			uni.navigateTo({ url: '/pages/item-detail/index?id=' + item.id });
		},
	},
};
</script>

<style scoped>
/* 搜索栏 */
.search-bar {
	display: flex;
	align-items: center;
	background: #FFFFFF;
	border-radius: 40rpx;
	padding: 20rpx 28rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.search-placeholder {
	color: #B0B4C0;
	font-size: 26rpx;
	margin-left: 16rpx;
}

/* 分类 */
.category-scroll {
	display: flex;
	justify-content: space-between;
	margin-bottom: 28rpx;
}

.category-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.category-icon {
	width: 96rpx;
	height: 96rpx;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 8rpx;
	transition: all 0.2s;
}

.category-item.active .category-icon {
	transform: scale(1.08);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.category-name {
	font-size: 22rpx;
	color: #6B6F80;
}

/* 排序 */
.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.section-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #1A1D28;
}

.sort-tabs {
	display: flex;
	gap: 8rpx;
}

.sort-tab {
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
	color: #6B6F80;
	background: #FFFFFF;
	transition: all 0.15s;
}

.sort-tab.active {
	color: #4F6EF7;
	background: #EDF0FE;
	font-weight: 500;
}

/* 物品卡片 */
.item-card {
	background: #FFFFFF;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	transition: all 0.15s;
}

.item-card:active {
	transform: scale(0.99);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.item-image {
	width: 100%;
	height: 340rpx;
	position: relative;
	overflow: hidden;
}

.item-image__img {
	width: 100%;
	height: 100%;
}

.item-image__placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.item-price-tag {
	position: absolute;
	right: 20rpx;
	bottom: 20rpx;
	padding: 6rpx 20rpx;
	border-radius: 20rpx;
	background: rgba(0, 0, 0, 0.6);
	/* backdrop-filter 在小程序中不支持，使用更高不透明度替代 */
	z-index: 2;
}

.price-num {
	font-size: 30rpx;
	font-weight: 700;
	color: #FF6B3D;
}

.price-free {
	font-size: 26rpx;
	font-weight: 600;
	color: #22C55E;
}

.item-type-tag {
	position: absolute;
	left: 20rpx;
	top: 20rpx;
	padding: 4rpx 16rpx;
	border-radius: 12rpx;
	background: rgba(34, 197, 94, 0.85);
	z-index: 2;
}

.item-type-tag text {
	font-size: 22rpx;
	color: #FFFFFF;
	font-weight: 500;
}

.item-info {
	padding: 20rpx 24rpx 24rpx;
}

.item-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #1A1D28;
	display: block;
	margin-bottom: 8rpx;
}

.item-desc {
	font-size: 24rpx;
	color: #8B8FA3;
	line-height: 1.5;
	display: block;
	margin-bottom: 16rpx;
}

.item-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.item-seller {
	display: flex;
	align-items: center;
}

.item-avatar-sm {
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	margin-right: 10rpx;
}

.item-seller-name {
	font-size: 24rpx;
	color: #6B6F80;
}

.item-meta {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.item-meta-item {
	display: flex;
	align-items: center;
	gap: 4rpx;
}

.item-meta-item text {
	font-size: 22rpx;
	color: #B0B4C0;
}

.item-location,
.item-time {
	font-size: 22rpx;
	color: #B0B4C0;
}

/* 加载 */
.loading-row {
	display: flex;
	justify-content: center;
	padding: 30rpx 0;
}

.loading-text {
	font-size: 24rpx;
	color: #B0B4C0;
}

.empty-sub {
	font-size: 24rpx;
	color: #B0B4C0;
	margin-top: 8rpx;
}
</style>
