<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 顶部渐变头部：搜索 -->
			<view class="home-header">
				<view class="search-bar" @click="goSearch">
					<image class="home-search-icon" src="/static/imgs/1.png" mode="aspectFit" />
					<text class="search-placeholder">搜索闲置物品、教材、数码…</text>
					<view class="search-filter">
						<image class="home-camera-icon" src="/static/imgs/camera.png" mode="aspectFit" />
					</view>
				</view>
			</view>
			<view class="search-bar-spacer"></view>
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
							<image v-if="getCategoryImage(cat)" class="category-icon-img" :src="getCategoryImage(cat)" mode="aspectFit" />
							<AppIcon v-else :name="cat.icon" :size="44" :color="cat.color" />
						</view>
						<text class="category-text">{{ cat.name }}</text>
					</view>
				</view>
			</view>

			<!-- 筛选栏：校区 / 排序 -->
			<view class="box-3">
				<view class="filter-row">
					<view class="flex-row">
						<view class="filter-chip" @click="showCampusPicker = true">
							<image class="campus-filter-icon" src="/static/imgs/8.png" mode="aspectFit" />
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
			</view>

			<!-- ========== 为你推荐（猜你喜欢 + 智能匹配） ========== -->
			<view class="recommend-section" v-if="recommendList.length > 0 || matchList.length > 0">
				<view class="section-header">
					<text class="section-title">为你推荐</text>
					<view class="rec-tabs">
						<text
							v-if="recommendList.length > 0"
							:class="['rec-tab', { active: recommendTab === 'rec' }]"
							@click="recommendTab = 'rec'"
						>猜你喜欢</text>
						<text
							v-if="matchList.length > 0"
							:class="['rec-tab', { active: recommendTab === 'match' }]"
							@click="recommendTab = 'match'"
						>智能匹配</text>
					</view>
				</view>
				<view v-show="recommendTab === 'rec'" class="fade-switch">
				<scroll-view scroll-x class="recommend-scroll">
					<view class="recommend-item anim-in" v-for="item in recommendList" :key="item.id" @click="goDetail(item)">
						<view class="rec-image">
							<image
								v-if="item.images && item.images.length > 0"
								:src="item.images[0]"
								class="rec-image__img"
								mode="aspectFill"
								lazy-load
							/>
							<view v-else class="rec-image-placeholder">
								<AppIcon :name="getCategoryIcon(item.category)" :size="44" color="#9AA3B5" />
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
								<AppIcon name="ai" :size="44" color="#77C9F1" />
								<text class="rec-reason-text">{{ item.matchReason }}</text>
							</view>
						</view>
					</view>
				</scroll-view>
				</view>

				<view v-show="recommendTab === 'match'" class="fade-switch">
				<view class="match-card anim-in" v-for="match in matchList" :key="match.id">
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
							<image class="match-meta-icon" src="/static/imgs/8.png" mode="aspectFit" />
								<text class="match-meta-text">{{ m.campus }}</text>
							</view>
						</view>
					</scroll-view>
				</view>
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
					<view v-for="item in leftColumn" :key="item.id" class="item-card anim-in" @click="goDetail(item)">
						<view class="item-image" :style="{ background: item.imageBg || '#F0F3F9' }">
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
									<AppIcon name="eye" :size="44" color="#7A8294" />
									<text>{{ item.viewCount }}</text>
								</view>
								<text class="item-location">{{ item.location || item.campus }}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="item-col">
					<view v-for="item in rightColumn" :key="item.id" class="item-card anim-in" @click="goDetail(item)">
						<view class="item-image" :style="{ background: item.imageBg || '#F0F3F9' }">
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
									<AppIcon name="eye" :size="44" color="#7A8294" />
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
				<AppIcon name="close" :size="56" color="#EF4444" />
				<text class="error-text">加载失败，请检查网络后重试</text>
				<view class="retry-btn" @click="retryLoad"><text>重新加载</text></view>
			</view>

			<!-- 空状态 -->
			<view v-else-if="!loading" class="empty-state">
				<AppIcon name="daily" :size="72" color="#9AA3B5" />
				<text class="empty-text">暂无物品</text>
				<text class="empty-sub">下拉刷新试试，或者去发布闲置吧~</text>
			</view>

			<!-- 加载状态 -->
			<view v-if="loading" class="loading-row">
				<text class="loading-text">加载中...</text>
			</view>
			<view v-if="!hasMore && itemList.length > 0" class="loading-row">
				<text class="loading-text">已经到底了，去逛逛别的吧</text>
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
					<AppIcon v-if="currentCampus === c.name" name="check" :size="44" color="#77C9F1" />
				</view>
				<view class="picker-cancel btn-primary" @click="showCampusPicker = false">确定</view>
			</view>
		</view>

		<CustomTabBar :current="0" />
		<BackTop :visible="showBackTop" />
	</view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';
import BackTop from '@/components/BackTop.vue';
import { get, post } from '@/utils/request.js';

export default {
	components: { CustomTabBar, AppIcon, BackTop },
	data() {
		return {
			categories: [],
			activeCategory: '',
			currentSort: 'latest',
			currentCampus: '全部校区',
			showCampusPicker: false,
			recommendTab: 'rec',
			sortOptions: [
				{ label: '最新', value: 'latest' },
				{ label: '热门', value: 'hot' },
				{ label: '价格最低', value: 'price_asc' },
				{ label: '价格最高', value: 'price_desc' },
			],
			campuses: [{ id: 0, name: '全部校区' }],
			itemList: [],
			recommendList: [],
			matchList: [],
			browseCount: 0,
			page: 1,
			pageSize: 10,
			hasMore: true,
			loading: false,
			loadError: false,
			showBackTop: false,
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
		this.loadCampuses();
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
	onPageScroll(e) {
		this.showBackTop = e.scrollTop > 400;
	},
	methods: {
		getCategoryIcon(cat) {
			const map = { book: 'book', digital: 'digital', daily: 'daily', sports: 'sports', fashion: 'fashion' };
			return map[cat] || 'other';
		},
		getCategoryImage(cat) {
			const map = {
				c1: '/static/imgs/3.png',
				c2: '/static/imgs/4.png',
				c3: '/static/imgs/5.png',
				c4: '/static/imgs/6.png',
				c5: '/static/imgs/7.png',
				c6: '/static/imgs/9.png',
			};
			return map[cat.id] || '';
		},
		async loadCategories() {
			try {
				this.categories = await get('/api/categories');
			} catch (e) {
				this.categories = [
					{ id: 'c1', name: '教材教辅', icon: 'book', color: '#77C9F1' },
					{ id: 'c2', name: '数码电子', icon: 'digital', color: '#77C9F1' },
					{ id: 'c3', name: '生活用品', icon: 'daily', color: '#FF5A36' },
					{ id: 'c4', name: '运动户外', icon: 'sports', color: '#22C55E' },
					{ id: 'c5', name: '服饰箱包', icon: 'fashion', color: '#F59E0B' },
					{ id: 'c6', name: '免费赠送', icon: 'gift', color: '#EF4444' },
				];
			}
		},
		async loadCampuses() {
			const school = (this.$store && this.$store.userInfo && this.$store.userInfo.school) || '';
			try {
				const list = await get('/api/campuses', { school });
				this.campuses = [{ id: 0, name: '全部校区' }, ...(list || [])];
			} catch (e) {
				this.campuses = [
					{ id: 0, name: '全部校区' },
					{ id: 1, name: '长清湖校区' },
					{ id: 2, name: '千佛山校区' },
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
			this.syncRecommendTab();
		},
		async loadMatches() {
			try {
				const data = await get('/api/matches');
				this.matchList = (data || []).slice(0, 2);
			} catch (e) {
				this.matchList = [];
			}
			this.syncRecommendTab();
		},
		syncRecommendTab() {
			// 猜你喜欢为空、智能匹配有数据时，自动切到智能匹配
			if (this.recommendTab === 'rec' && this.recommendList.length === 0 && this.matchList.length > 0) {
				this.recommendTab = 'match';
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
			uni.navigateTo({
				url: '/pages/search/index',
				events: {
					// 监听搜索页面返回时的事件
				}
			});
		},
		goCategory(cat) {
			uni.navigateTo({
				url: '/pages/search/index?category=' + (cat.id || cat.key),
			});
		},
		goDetail(item) {
			const itemId = item.itemId || item.id;
			// 保存浏览记录
			post('/api/browse-history', {
				itemId, title: item.title, price: item.price,
				type: item.type, category: item.categoryId || item.category,
			}).catch(() => {});
			uni.navigateTo({
				url: '/pages/goods-detail/index?id=' + itemId,
			});
		},
		goMatchDetail(matchItem) {
			if (!matchItem.itemId) {
				uni.showToast({ title: '这是求购需求，暂无商品详情', icon: 'none' });
				return;
			}
			uni.navigateTo({
				url: '/pages/goods-detail/index?id=' + matchItem.itemId,
			});
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
.category-icon-img { width: 56rpx; height: 56rpx; }
.category-text { font-size: 28rpx; color: #5B6675; }

/* ======== 筛选栏 ======== */
.box-3{
	background-color: transparent;
}
.filter-row { display: flex; align-items: center; padding: 0 0 20rpx; gap: 16rpx; }
.filter-left { flex-shrink: 0; }
.filter-chip {
	display: flex; align-items: center; padding: 10rpx 20rpx;
	background: #FFF; border-radius: 30rpx; gap: 6rpx; border: 1px solid #EAF0F8;
}
.filter-chip-text { font-size: 28rpx; color: #4F91C5; }
.campus-filter-icon { width: 44rpx; height: 44rpx; flex-shrink: 0; }
.filter-sorts { flex: 1; }
.sort-item {
	flex-shrink: 0; padding: 10rpx 24rpx; border-radius: 30rpx;
	font-size: 28rpx; color: #5B6675; background: #FFF; white-space: nowrap;
}
.sort-item.active { color: #FFF; background: #4F91C5; font-weight: 500; }

/* ======== 区域标题 ======== */
.section-header { display: flex; align-items: baseline; gap: 12rpx; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #1A1D28; }
.section-sub { font-size: 28rpx; color: #5B6675; }

/* ======== 为你推荐 Tab ======== */
.rec-tabs { display: flex; align-items: center; gap: 8rpx; margin-left: auto; }
.rec-tab {
	padding: 6rpx 20rpx; border-radius: 9999rpx; font-size: 26rpx;
	color: #5B6675; background: #C9EBF7;
}
.rec-tab.active { color: #FFF; background: #4F91C5; font-weight: 500; }

/* ======== 猜你喜欢 ======== */
.recommend-section { margin-bottom: 30rpx; }
.recommend-scroll { display: flex; flex-wrap: nowrap; white-space: nowrap; }
.recommend-item {
	display: inline-flex; flex-direction: column; width: 280rpx;
	background: #FFF; border-radius: 16rpx; margin-right: 16rpx; overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(56, 108, 148, 0.06);
}
.rec-image { position: relative; width: 100%; height: 200rpx; }
.rec-image__img { width: 100%; height: 100%; }
.rec-image-placeholder {
	width: 100%; height: 100%; background: linear-gradient(135deg, #F0F3F9, #EAF0F8);
	display: flex; align-items: center; justify-content: center;
}
.rec-type-tag {
	position: absolute; top: 12rpx; right: 12rpx; padding: 4rpx 14rpx;
	background: rgba(0, 0, 0, 0.5); color: #FFF; font-size: 26rpx; border-radius: 8rpx;
}
.rec-body { padding: 16rpx 18rpx; display: flex; flex-direction: column; gap: 8rpx; }
.rec-title { font-size: 26rpx; font-weight: 600; color: #1A1D28; line-height: 1.4; white-space: normal; }
.rec-price { font-size: 32rpx; font-weight: bold; color: #FF5A36; }
.rec-free { font-size: 28rpx; font-weight: bold; color: #22C55E; }
.rec-reason {
	display: flex; align-items: center; gap: 6rpx; padding: 6rpx 10rpx;
	background: #EAF1FE; border-radius: 8rpx;
}
.rec-reason-text { font-size: 26rpx; color: #4F91C5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ======== 智能匹配 ======== */
.match-section { margin-bottom: 30rpx; }
.match-card {
	background: #FFF; border-radius: 16rpx; padding: 20rpx; margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(56, 108, 148, 0.06);
}
.match-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 16rpx; }
.match-badge { padding: 4rpx 14rpx; border-radius: 8rpx; font-size: 26rpx; font-weight: 500; flex-shrink: 0; }
.badge-find-people { background: #C9EBF7; color: #4F91C5; }
.badge-find-item { background: #FFF0EB; color: #FF5A36; }
.match-title { font-size: 26rpx; color: #5B6675; font-weight: 500; }
.match-scroll { white-space: nowrap; }
.match-item {
	display: inline-flex; flex-direction: column; width: 240rpx; padding: 18rpx;
	background: #F3F7FE; border-radius: 16rpx; margin-right: 14rpx; gap: 8rpx; white-space: normal;
}
.match-user-row { display: flex; align-items: center; gap: 8rpx; }
.match-avatar {
	width: 40rpx; height: 40rpx; border-radius: 50%;
	background: linear-gradient(135deg, #4F91C5, #77C9F1);
	display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.match-avatar-text { font-size: 22rpx; font-weight: bold; color: #FFF; }
.match-nickname { font-size: 26rpx; color: #1A1D28; }
.match-item-title { font-size: 28rpx; color: #1A1D28; font-weight: 500; }
.match-item-desc { font-size: 26rpx; color: #5B6675; }
.match-price { font-size: 28rpx; font-weight: bold; color: #FF5A36; }
.match-meta { display: flex; align-items: center; gap: 4rpx; }
.match-meta-icon { width: 28rpx; height: 28rpx; flex-shrink: 0; }
.match-meta-text { font-size: 26rpx; color: #5B6675; }

/* ======== 物品Feed列表（双列网格） ======== */
.item-grid { display: flex; gap: 16rpx; align-items: flex-start; }
.item-col { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16rpx; }
.item-card {
	background: #FFF; border-radius: 16rpx; overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(56, 108, 148, 0.06);
}
.item-col .item-card:nth-child(2) { animation-delay: 60ms; }
.item-col .item-card:nth-child(3) { animation-delay: 120ms; }
.item-col .item-card:nth-child(4) { animation-delay: 180ms; }
.item-card:active { transform: scale(0.98); }
.item-image { width: 100%; height: 300rpx; position: relative; overflow: hidden; }
.item-image__img { width: 100%; height: 100%; }
.item-image__placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.item-price-tag {
	position: absolute; right: 12rpx; bottom: 12rpx; padding: 4rpx 16rpx;
	border-radius: 9999rpx; background: rgba(0, 0, 0, 0.6); z-index: 2;
}
.price-num { font-size: 26rpx; font-weight: 700; color: #FF5A36; }
.price-free { font-size: 28rpx; font-weight: 600; color: #22C55E; }
.item-type-tag {
	position: absolute; left: 12rpx; top: 12rpx; padding: 4rpx 14rpx;
	border-radius: 8rpx; background: rgba(34, 197, 94, 0.85); z-index: 2;
}
.item-type-tag text { font-size: 26rpx; color: #FFF; font-weight: 500; }
.tag-hot-corner {
	position: absolute; top: 0; left: 0; padding: 4rpx 16rpx;
	background: #FF5A36; color: #FFF; font-size: 26rpx; font-weight: bold; border-radius: 0 0 8rpx 0;
}
.tag-new-corner {
	position: absolute; top: 0; left: 0; padding: 4rpx 16rpx;
	background: #22C55E; color: #FFF; font-size: 26rpx; font-weight: bold; border-radius: 0 0 8rpx 0;
}
.item-info { padding: 16rpx 16rpx 20rpx; display: flex; flex-direction: column; gap: 12rpx; }
.item-title { font-size: 26rpx; font-weight: 600; color: #1A1D28; line-height: 1.4; }
.item-meta-row { display: flex; align-items: center; gap: 10rpx; }
.item-meta-item { display: flex; align-items: center; gap: 4rpx; }
.item-meta-item text { font-size: 26rpx; color: #667384; }
.item-location {
	flex: 1; font-size: 26rpx; color: #667384;
	overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ======== 骨架屏 ======== */
.skeleton-card {
	background: #FFF; border-radius: 16rpx; overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(56, 108, 148, 0.06);
}
.skeleton-block {
	background: linear-gradient(90deg, #F0F3F9 25%, #EAF0F8 37%, #F0F3F9 63%);
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
.loading-text { font-size: 28rpx; color: #5B6675; }

/* ======== 搜索栏额外按钮 ======== */
.search-filter {
	width: 56rpx; height: 56rpx; border-radius: 50%;
	background: #EAF1FE; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

/* ======== 顶部渐变头部 ======== */
.home-header {
	position: sticky; top: 0; z-index: 20;
	margin: 0 -20rpx 20rpx;
	background: linear-gradient(180deg, #4F91C5 0%, #77C9F1 100%); border-bottom: 0;
	padding: 24rpx 24rpx 28rpx;
	border-radius: 0 0 32rpx 32rpx;
}
.home-header .search-bar {
	background: #FFFFFF;
	border: none;
	box-shadow: 0 6rpx 18rpx rgba(56, 108, 148, 0.12);
	margin-bottom: 0;
	border-radius: 48rpx;
	padding: 20rpx 28rpx;
}
.home-search-icon { width: 44rpx; height: 44rpx; flex-shrink: 0; }
.home-camera-icon { width: 38rpx; height: 38rpx; }

/* ======== 校区选择弹窗 ======== */
.picker-mask {
	position: fixed; top: 0; left: 0; right: 0; bottom: 0;
	background: rgba(0, 0, 0, 0.4); z-index: 1000; display: flex; align-items: flex-end;
}
.picker-panel {
	width: 100%; background: #FFF; border-radius: 32rpx 32rpx 0 0;
	padding: 40rpx 30rpx calc(30rpx + env(safe-area-inset-bottom));
}
.picker-title { font-size: 34rpx; font-weight: bold; color: #1A1D28; display: block; text-align: center; margin-bottom: 30rpx; }
.picker-item {
	display: flex; justify-content: space-between; align-items: center;
	padding: 28rpx 16rpx; font-size: 32rpx; color: #1A1D28; border-bottom: 1px solid #F0F3F9;
}
.picker-item.active { color: #4F91C5; font-weight: 500; }
.picker-cancel { margin-top: 30rpx; text-align: center; }
</style>
