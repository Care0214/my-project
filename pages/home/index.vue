<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 搜索栏 -->
			<view class="search-bar" @click="goSearch">
				<AppIcon name="search" :size="36" color="#999" />
				<text class="search-placeholder">搜索闲置物品、教材、数码…</text>
				<view class="search-filter">
					<AppIcon name="camera" :size="32" color="#999" />
				</view>
			</view>

			<!-- 分类快捷入口 -->
			<view class="category-section card">
				<view class="scroll-x">
					<view
						v-for="cat in categories"
						:key="cat.id"
						class="category-item-text"
						@click="goCategory(cat)"
					>
						<view class="category-icon-sm" :style="{ background: cat.color + '18' }">
							<AppIcon :name="cat.icon" :size="36" :color="cat.color" />
						</view>
						<text class="category-text">{{ cat.name }}</text>
					</view>
				</view>
			</view>

			<!-- 筛选栏：校区 / 排序 -->
			<view class="filter-row">
				<view class="flex-row">
					<view class="filter-chip" @click="showCampusPicker = true">
						<AppIcon name="location" :size="28" color="#4F6EF7" />
						<text class="filter-chip-text">{{ currentCampus }}</text>
					</view>
				</view>
				<view class="scroll-x filter-sorts">
					<text
						v-for="s in sortOptions"
						:key="s.value"
						:class="['sort-item', { active: currentSort === s.value }]"
						@click="applySort(s.value)"
					>{{ s.label }}</text>
				</view>
			</view>

			<!-- ========== 猜你喜欢 - 个性化推荐 ========== -->
			<view class="recommend-section" v-if="recommendList.length > 0">
				<view class="section-header">
					<text class="section-title">🎯 猜你喜欢</text>
					<text class="section-sub" v-if="browseCount > 0">基于你最近的 {{ browseCount }} 次浏览推荐</text>
				</view>
				<scroll-view scroll-x class="recommend-scroll">
					<view class="recommend-item" v-for="item in recommendList" :key="item.id" @click="goDetail(item)">
						<view class="rec-image">
							<image
								v-if="item.images && item.images.length > 0"
								:src="item.images[0]"
								class="rec-image__img"
								mode="aspectFill"
								lazy-load
							/>
							<view v-else class="rec-image-placeholder">
								<AppIcon :name="getCategoryIcon(item.category)" :size="52" color="#CCC" />
							</view>
							<view class="rec-type-tag">{{ item.type === 'sell' ? '出售' : item.type === 'lease' ? '出租' : '置换' }}</view>
						</view>
						<view class="rec-body">
							<text class="rec-title text-ellipsis-2">{{ item.title }}</text>
							<view class="rec-price-row">
								<text class="rec-price" v-if="item.price">¥{{ item.price }}</text>
								<text class="rec-free" v-else>免费</text>
							</view>
							<view class="rec-reason">
								<AppIcon name="ai" :size="22" color="#4F6EF7" />
								<text class="rec-reason-text">{{ item.matchReason }}</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- ========== 智能匹配 - 双向匹配 ========== -->
			<view class="match-section" v-if="matchList.length > 0">
				<view class="section-header">
					<text class="section-title">⚡ 智能匹配</text>
					<text class="section-sub">人找物 · 物找人 双向精准对接</text>
				</view>
				<view class="match-card" v-for="match in matchList" :key="match.id">
					<view class="match-header">
						<view :class="['match-badge', match.type === 'item-to-wish' ? 'badge-find-people' : 'badge-find-item']">
							{{ match.type === 'item-to-wish' ? '物找人' : '人找物' }}
						</view>
						<text class="match-title">{{ match.title }}</text>
					</view>
					<scroll-view scroll-x class="match-scroll">
						<view class="match-item" v-for="m in match.matches" :key="m.id" @click="goMatchDetail(m)">
							<view class="match-user-row">
								<view class="match-avatar">
									<text class="match-avatar-text">{{ m.user.nickname.charAt(0) }}</text>
								</view>
								<text class="match-nickname">{{ m.user.nickname }}</text>
							</view>
							<text class="match-item-title text-ellipsis-2">{{ m.title }}</text>
							<text class="match-item-desc text-ellipsis">{{ m.desc }}</text>
							<view class="match-price-row" v-if="m.price">
								<text class="match-price">¥{{ m.price }}</text>
							</view>
							<view class="match-meta">
								<AppIcon name="location" :size="18" color="#CCC" />
								<text class="match-meta-text">{{ m.campus }}</text>
							</view>
						</view>
					</scroll-view>
				</view>
			</view>

			<!-- 物品Feed流 -->
			<view class="section-header" v-if="itemList.length > 0 || loading">
				<text class="section-title">{{ activeCategory ? '分类浏览' : '最新发布' }}</text>
			</view>

			<!-- 骨架屏 -->
			<view v-if="loading && itemList.length === 0" class="item-grid">
				<view class="item-col">
					<view class="skeleton-card" v-for="i in 4" :key="'skl' + i">
						<view class="skeleton-block skeleton-img"></view>
						<view class="skeleton-body">
							<view class="skeleton-block skeleton-line"></view>
							<view class="skeleton-block skeleton-line short"></view>
							<view class="skeleton-block skeleton-price"></view>
						</view>
					</view>
				</view>
				<view class="item-col">
					<view class="skeleton-card" v-for="i in 4" :key="'skr' + i">
						<view class="skeleton-block skeleton-img"></view>
						<view class="skeleton-body">
							<view class="skeleton-block skeleton-line"></view>
							<view class="skeleton-block skeleton-line short"></view>
							<view class="skeleton-block skeleton-price"></view>
						</view>
					</view>
				</view>
			</view>

			<!-- 双列商品网格 -->
			<view v-if="itemList.length > 0" class="item-grid">
				<view class="item-col">
					<view v-for="item in leftColumn" :key="item.id" class="item-card" @click="goDetail(item)">
						<view class="item-image" :style="{ background: item.imageBg || '#F3F4F8' }">
							<image
								v-if="item.images && item.images.length > 0"
								:src="item.images[0]"
								class="item-image__img"
								mode="aspectFill"
								lazy-load
							/>
							<view v-else class="item-image__placeholder">
								<AppIcon name="image" :size="48" color="#D0D3E0" />
							</view>
							<view class="item-price-tag">
								<text v-if="item.price === 0" class="price-free">免费</text>
								<text v-else class="price-num">¥{{ item.price }}</text>
							</view>
							<view v-if="item.type === 'lease'" class="item-type-tag">
								<text>可租</text>
							</view>
							<view v-if="item.isHot" class="tag-hot-corner">热门</view>
							<view v-else-if="item.isNew" class="tag-new-corner">上新</view>
						</view>
						<view class="item-info">
							<text class="item-title text-ellipsis-2">{{ item.title }}</text>
							<view class="item-meta-row">
								<view class="item-meta-item" v-if="item.viewCount">
									<AppIcon name="eye" :size="20" color="#B0B4C0" />
									<text>{{ item.viewCount }}</text>
								</view>
								<text class="item-location">{{ item.location || item.campus }}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="item-col">
					<view v-for="item in rightColumn" :key="item.id" class="item-card" @click="goDetail(item)">
						<view class="item-image" :style="{ background: item.imageBg || '#F3F4F8' }">
							<image
								v-if="item.images && item.images.length > 0"
								:src="item.images[0]"
								class="item-image__img"
								mode="aspectFill"
								lazy-load
							/>
							<view v-else class="item-image__placeholder">
								<AppIcon name="image" :size="48" color="#D0D3E0" />
							</view>
							<view class="item-price-tag">
								<text v-if="item.price === 0" class="price-free">免费</text>
								<text v-else class="price-num">¥{{ item.price }}</text>
							</view>
							<view v-if="item.type === 'lease'" class="item-type-tag">
								<text>可租</text>
							</view>
							<view v-if="item.isHot" class="tag-hot-corner">热门</view>
							<view v-else-if="item.isNew" class="tag-new-corner">上新</view>
						</view>
						<view class="item-info">
							<text class="item-title text-ellipsis-2">{{ item.title }}</text>
							<view class="item-meta-row">
								<view class="item-meta-item" v-if="item.viewCount">
									<AppIcon name="eye" :size="20" color="#B0B4C0" />
									<text>{{ item.viewCount }}</text>
								</view>
								<text class="item-location">{{ item.location || item.campus }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载失败 -->
			<view v-else-if="loadError && !loading" class="error-state">
				<text class="error-icon">⚠️</text>
				<text class="error-text">加载失败，请检查网络后重试</text>
				<view class="retry-btn" @click="retryLoad"><text>重新加载</text></view>
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
			<view v-if="!hasMore && itemList.length > 0" class="loading-row">
				<text class="loading-text">— 已经到底了 —</text>
			</view>
		</view>

		<!-- 校区选择弹窗 -->
		<view class="picker-mask" v-if="showCampusPicker" @click="showCampusPicker = false">
			<view class="picker-panel" @click.stop>
				<text class="picker-title">选择校区</text>
				<view
					v-for="c in campuses"
					:key="c.id"
					:class="['picker-item', { active: currentCampus === c.name }]"
					@click="selectCampus(c)"
				>
					<text>{{ c.name }}</text>
					<AppIcon v-if="currentCampus === c.name" name="check" :size="36" color="#4F6EF7" />
				</view>
				<view class="picker-cancel btn-primary" @click="showCampusPicker = false">确定</view>
			</view>
		</view>

		<CustomTabBar :current="0" />
	</view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';
import { get, post } from '@/utils/request.js';

export default {
	components: { CustomTabBar, AppIcon },
	data() {
		return {
			categories: [],
			activeCategory: '',
			currentSort: 'latest',
			currentCampus: '全部校区',
			showCampusPicker: false,
			sortOptions: [
				{ label: '最新', value: 'latest' },
				{ label: '热门', value: 'hot' },
				{ label: '价格最低', value: 'price_asc' },
				{ label: '价格最高', value: 'price_desc' },
			],
			campuses: [
				{ id: 1, name: '全部校区' },
				{ id: 2, name: '主校区' },
				{ id: 3, name: '东校区' },
				{ id: 4, name: '西校区' },
				{ id: 5, name: '南校区' },
				{ id: 6, name: '北校区' },
			],
			itemList: [],
			recommendList: [],
			matchList: [],
			browseCount: 0,
			page: 1,
			pageSize: 10,
			hasMore: true,
			loading: false,
			loadError: false,
		};
	},
	computed: {
		leftColumn() {
			return this.itemList.filter((item, i) => i % 2 === 0);
		},
		rightColumn() {
			return this.itemList.filter((item, i) => i % 2 === 1);
		},
	},
	onLoad() {
		this.loadCategories();
		this.loadItems();
		this.loadRecommendations();
		this.loadMatches();
	},
	onShow() {
		// 刷新浏览记录数
		this.loadBrowseCount();
		// 每次回到首页刷新推荐
		this.loadRecommendations();
	},
	onPullDownRefresh() {
		this.refreshList();
		this.loadRecommendations();
		this.loadMatches();
	},
	onReachBottom() {
		if (this.hasMore && !this.loading) {
			this.page++;
			this.loadItems(true);
		}
	},
	methods: {
		getCategoryIcon(cat) {
			const map = { book: 'book', digital: 'digital', daily: 'daily', sports: 'sports', fashion: 'fashion' };
			return map[cat] || 'other';
		},
		async loadCategories() {
			try {
				this.categories = await get('/api/categories');
			} catch (e) {
				this.categories = [
					{ id: 'c1', name: '教材教辅', icon: 'book', color: '#4F6EF7' },
					{ id: 'c2', name: '数码电子', icon: 'digital', color: '#6366F1' },
					{ id: 'c3', name: '生活用品', icon: 'daily', color: '#FF6B3D' },
					{ id: 'c4', name: '运动户外', icon: 'sports', color: '#22C55E' },
					{ id: 'c5', name: '服饰箱包', icon: 'fashion', color: '#F59E0B' },
					{ id: 'c6', name: '免费赠送', icon: 'gift', color: '#EF4444' },
				];
			}
		},
		async loadItems(append = false) {
			if (this.loading) return;
			this.loading = true;
			try {
				const data = await get('/api/items', {
					page: this.page, pageSize: this.pageSize,
					categoryId: this.activeCategory || undefined,
					sort: this.currentSort,
					campus: this.currentCampus === '全部校区' ? undefined : this.currentCampus,
				});
				if (append) {
					this.itemList = [...this.itemList, ...data.list];
				} else {
					this.itemList = data.list;
				}
				this.hasMore = data.hasMore;
				this.loadError = false;
			} catch (e) {
				this.loadError = true;
			}
			finally {
				this.loading = false;
				uni.stopPullDownRefresh();
			}
		},
		async loadRecommendations() {
			try {
				const data = await get('/api/recommendations');
				this.recommendList = data || [];
			} catch (e) {
				this.recommendList = [];
			}
		},
		async loadMatches() {
			try {
				const data = await get('/api/matches');
				this.matchList = (data || []).slice(0, 2);
			} catch (e) {
				this.matchList = [];
			}
		},
		async loadBrowseCount() {
			try {
				const data = await get('/api/browse-history');
				this.browseCount = (data || []).length;
			} catch (e) {
				this.browseCount = 0;
			}
		},
		refreshList() {
			this.page = 1;
			this.hasMore = true;
			this.loadError = false;
			this.loadItems(false);
		},
		retryLoad() {
			this.loadError = false;
			this.refreshList();
		},
		applySort(sortValue) {
			this.currentSort = sortValue;
			this.refreshList();
		},
		selectCampus(c) {
			this.currentCampus = c.name;
			this.refreshList();
		},
		goSearch() {
			uni.navigateTo({ url: '/pages/search/index' });
		},
		goCategory(cat) {
			uni.navigateTo({ url: '/pages/search/index?category=' + (cat.id || cat.key) });
		},
		goDetail(item) {
			// 保存浏览记录
			post('/api/browse-history', {
				itemId: item.id, title: item.title, price: item.price,
				type: item.type, category: item.categoryId || item.category,
			}).catch(() => {});
			uni.navigateTo({ url: '/pages/goods-detail/index?id=' + item.id });
		},
		goMatchDetail(matchItem) {
			uni.navigateTo({ url: '/pages/goods-detail/index?id=' + matchItem.id });
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

/* ======== 分类区 ======== */
.category-section { padding: 20rpx 16rpx; }
.category-item-text {
	display: flex; flex-direction: column; align-items: center;
	flex-shrink: 0; width: 120rpx; padding: 8rpx 0;
}
.category-icon-sm {
	width: 80rpx; height: 80rpx; border-radius: 50%;
	display: flex; align-items: center; justify-content: center; margin-bottom: 10rpx;
}
.category-text { font-size: 24rpx; color: #666; }

/* ======== 筛选栏 ======== */
.filter-row { display: flex; align-items: center; padding: 0 0 20rpx; gap: 16rpx; }
.filter-left { flex-shrink: 0; }
.filter-chip {
	display: flex; align-items: center; padding: 10rpx 20rpx;
	background: #FFF; border-radius: 30rpx; gap: 6rpx; border: 1px solid #E5E5E5;
}
.filter-chip-text { font-size: 24rpx; color: #4F6EF7; }
.filter-sorts { flex: 1; }
.sort-item {
	flex-shrink: 0; padding: 10rpx 24rpx; border-radius: 30rpx;
	font-size: 24rpx; color: #666; background: #FFF; white-space: nowrap;
}
.sort-item.active { color: #FFF; background: #4F6EF7; font-weight: 500; }

/* ======== 区域标题 ======== */
.section-header { display: flex; align-items: baseline; gap: 12rpx; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #333; }
.section-sub { font-size: 22rpx; color: #BBB; }

/* ======== 猜你喜欢 ======== */
.recommend-section { margin-bottom: 30rpx; }
.recommend-scroll { display: flex; flex-wrap: nowrap; white-space: nowrap; }
.recommend-item {
	display: inline-flex; flex-direction: column; width: 280rpx;
	background: #FFF; border-radius: 16rpx; margin-right: 16rpx; overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.rec-image { position: relative; width: 100%; height: 200rpx; }
.rec-image__img { width: 100%; height: 100%; }
.rec-image-placeholder {
	width: 100%; height: 100%; background: linear-gradient(135deg, #F5F5F5, #ECECEC);
	display: flex; align-items: center; justify-content: center;
}
.rec-type-tag {
	position: absolute; top: 12rpx; right: 12rpx; padding: 4rpx 14rpx;
	background: rgba(0, 0, 0, 0.5); color: #FFF; font-size: 20rpx; border-radius: 8rpx;
}
.rec-body { padding: 16rpx 18rpx; display: flex; flex-direction: column; gap: 8rpx; }
.rec-title { font-size: 26rpx; font-weight: 600; color: #333; line-height: 1.4; white-space: normal; }
.rec-price { font-size: 32rpx; font-weight: bold; color: #FF6B3D; }
.rec-free { font-size: 28rpx; font-weight: bold; color: #22C55E; }
.rec-reason {
	display: flex; align-items: center; gap: 6rpx; padding: 6rpx 10rpx;
	background: #EDF0FE; border-radius: 6rpx;
}
.rec-reason-text { font-size: 20rpx; color: #4F6EF7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ======== 智能匹配 ======== */
.match-section { margin-bottom: 30rpx; }
.match-card {
	background: #FFF; border-radius: 16rpx; padding: 20rpx; margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.match-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 16rpx; }
.match-badge { padding: 4rpx 14rpx; border-radius: 6rpx; font-size: 20rpx; font-weight: 500; flex-shrink: 0; }
.badge-find-people { background: #EDF0FE; color: #4F6EF7; }
.badge-find-item { background: #FFF0EB; color: #FF6B3D; }
.match-title { font-size: 26rpx; color: #666; font-weight: 500; }
.match-scroll { white-space: nowrap; }
.match-item {
	display: inline-flex; flex-direction: column; width: 240rpx; padding: 18rpx;
	background: #F8FAFF; border-radius: 12rpx; margin-right: 14rpx; gap: 8rpx; white-space: normal;
}
.match-user-row { display: flex; align-items: center; gap: 8rpx; }
.match-avatar {
	width: 40rpx; height: 40rpx; border-radius: 50%;
	background: linear-gradient(135deg, #E0E0E0, #D0D0D0);
	display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.match-avatar-text { font-size: 18rpx; font-weight: bold; color: #FFF; }
.match-nickname { font-size: 22rpx; color: #333; }
.match-item-title { font-size: 24rpx; color: #333; font-weight: 500; }
.match-item-desc { font-size: 20rpx; color: #999; }
.match-price { font-size: 28rpx; font-weight: bold; color: #FF6B3D; }
.match-meta { display: flex; align-items: center; gap: 4rpx; }
.match-meta-text { font-size: 20rpx; color: #CCC; }

/* ======== 物品Feed列表（双列网格） ======== */
.item-grid { display: flex; gap: 16rpx; align-items: flex-start; }
.item-col { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16rpx; }
.item-card {
	background: #FFF; border-radius: 16rpx; overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.item-card:active { transform: scale(0.98); }
.item-image { width: 100%; height: 300rpx; position: relative; overflow: hidden; }
.item-image__img { width: 100%; height: 100%; }
.item-image__placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.item-price-tag {
	position: absolute; right: 12rpx; bottom: 12rpx; padding: 4rpx 16rpx;
	border-radius: 20rpx; background: rgba(0, 0, 0, 0.6); z-index: 2;
}
.price-num { font-size: 26rpx; font-weight: 700; color: #FF6B3D; }
.price-free { font-size: 24rpx; font-weight: 600; color: #22C55E; }
.item-type-tag {
	position: absolute; left: 12rpx; top: 12rpx; padding: 4rpx 14rpx;
	border-radius: 10rpx; background: rgba(34, 197, 94, 0.85); z-index: 2;
}
.item-type-tag text { font-size: 20rpx; color: #FFF; font-weight: 500; }
.tag-hot-corner {
	position: absolute; top: 0; left: 0; padding: 4rpx 16rpx;
	background: #FF6B3D; color: #FFF; font-size: 20rpx; font-weight: bold; border-radius: 0 0 10rpx 0;
}
.tag-new-corner {
	position: absolute; top: 0; left: 0; padding: 4rpx 16rpx;
	background: #22C55E; color: #FFF; font-size: 20rpx; font-weight: bold; border-radius: 0 0 10rpx 0;
}
.item-info { padding: 16rpx 16rpx 20rpx; display: flex; flex-direction: column; gap: 12rpx; }
.item-title { font-size: 26rpx; font-weight: 600; color: #1A1D28; line-height: 1.4; }
.item-meta-row { display: flex; align-items: center; gap: 10rpx; }
.item-meta-item { display: flex; align-items: center; gap: 4rpx; }
.item-meta-item text { font-size: 20rpx; color: #B0B4C0; }
.item-location {
	flex: 1; font-size: 20rpx; color: #B0B4C0;
	overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ======== 骨架屏 ======== */
.skeleton-card {
	background: #FFF; border-radius: 16rpx; overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.skeleton-block {
	background: linear-gradient(90deg, #F2F3F8 25%, #E8EAF0 37%, #F2F3F8 63%);
	background-size: 400% 100%;
	animation: skeleton-shimmer 1.4s ease infinite;
}
@keyframes skeleton-shimmer {
	0% { background-position: 100% 50%; }
	100% { background-position: 0 50%; }
}
.skeleton-img { height: 300rpx; }
.skeleton-body { padding: 16rpx; }
.skeleton-line { height: 28rpx; border-radius: 6rpx; margin-bottom: 12rpx; }
.skeleton-line.short { width: 60%; }
.skeleton-price { width: 40%; height: 28rpx; border-radius: 6rpx; }

/* ======== 加载 ======== */
.loading-row { display: flex; justify-content: center; padding: 30rpx 0; }
.loading-text { font-size: 24rpx; color: #B0B4C0; }

/* ======== 搜索栏额外按钮 ======== */
.search-filter {
	width: 56rpx; height: 56rpx; border-radius: 50%;
	background: #F5F5F5; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

/* ======== 校区选择弹窗 ======== */
.picker-mask {
	position: fixed; top: 0; left: 0; right: 0; bottom: 0;
	background: rgba(0, 0, 0, 0.4); z-index: 1000; display: flex; align-items: flex-end;
}
.picker-panel {
	width: 100%; background: #FFF; border-radius: 32rpx 32rpx 0 0;
	padding: 40rpx 30rpx calc(30rpx + env(safe-area-inset-bottom));
}
.picker-title { font-size: 34rpx; font-weight: bold; color: #333; display: block; text-align: center; margin-bottom: 30rpx; }
.picker-item {
	display: flex; justify-content: space-between; align-items: center;
	padding: 28rpx 16rpx; font-size: 30rpx; color: #333; border-bottom: 1px solid #F5F5F5;
}
.picker-item.active { color: #4F6EF7; font-weight: 500; }
.picker-cancel { margin-top: 30rpx; text-align: center; }
</style>
