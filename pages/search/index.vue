<template>
	<view class="search-page">
		<!-- 顶部搜索栏 -->
		<view class="search-header">
			<view class="search-bar">
				<AppIcon name="search" :size="36" color="#B0B4C0" />
				<input
					class="search-input"
					v-model="keyword"
					placeholder="搜索物品、关键词..."
					focus
					confirm-type="search"
					@confirm="doSearch"
					@input="onInput"
				/>
				<view v-if="keyword" class="search-clear" @click="clearInput">
					<AppIcon name="close" :size="28" color="#FFFFFF" />
				</view>
			</view>
			<text class="search-cancel" @click="goBack">取消</text>
		</view>

		<!-- ============ 搜索前：热门搜索 + 历史 ============ -->
		<view v-if="!hasSearched" class="search-before">
			<!-- 搜索历史 -->
			<view v-if="history.length > 0" class="search-section">
				<view class="section-header">
					<text class="section-title">搜索历史</text>
					<view class="section-action" @click="clearHistory">
						<AppIcon name="delete" :size="28" color="#B0B4C0" />
					</view>
				</view>
				<view class="tag-group">
					<text
						v-for="(h, i) in history"
						:key="i"
						class="history-tag"
						@click="searchHistory(h)"
					>{{ h }}</text>
				</view>
			</view>

			<!-- 热门搜索 -->
			<view class="search-section">
				<view class="section-header">
					<text class="section-title">🔥 热门搜索</text>
				</view>
				<view class="tag-group">
					<text
						v-for="(hot, i) in hotSearches"
						:key="i"
						:class="['hot-tag', { 'hot-top': i < 3 }]"
						@click="searchHistory(hot)"
					>
						<text v-if="i < 3" class="hot-rank">{{ i + 1 }}</text>
						{{ hot }}
					</text>
				</view>
			</view>
		</view>

		<!-- ============ 搜索结果 ============ -->
		<view v-if="hasSearched" class="search-results">
			<!-- 结果数量 -->
			<view v-if="results.length > 0" class="result-count">
				<text>找到 {{ results.length }} 个相关物品</text>
			</view>

			<!-- 结果列表 -->
			<view v-if="results.length > 0">
				<view
					v-for="item in results"
					:key="item.id"
					class="result-card"
					@click="goDetail(item)"
				>
					<view class="result-image" :style="{ background: item.imageBg || '#F3F4F8' }">
						<image
							v-if="item.images && item.images.length > 0"
							:src="item.images[0]"
							class="result-image__img"
							mode="aspectFill"
							lazy-load
						/>
						<AppIcon v-else name="image" :size="36" color="#D0D3E0" />
						<view class="result-price-tag">
							<text v-if="item.price === 0" class="r-free">免费</text>
							<text v-else class="r-price">¥{{ item.price }}</text>
						</view>
					</view>
					<view class="result-info">
						<rich-text class="result-title" :nodes="highlightNodes(item.title)"></rich-text>
						<rich-text class="result-desc text-ellipsis-2" :nodes="highlightNodes(item.description)"></rich-text>
						<view class="result-footer">
							<text class="result-seller">{{ item.seller.nickname }}</text>
							<text class="result-time">{{ item.publishTimeText }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载失败 -->
			<view v-else-if="searchError && !loading" class="error-state">
				<text class="error-icon">⚠️</text>
				<text class="error-text">搜索失败，请稍后重试</text>
				<view class="retry-btn" @click="doSearch"><text>重新搜索</text></view>
			</view>

			<!-- 空结果 -->
			<view v-else-if="!loading" class="empty-state">
				<text class="empty-icon">🔍</text>
				<text class="empty-text">没有找到「{{ lastKeyword }}」相关物品</text>
				<text class="empty-sub">换个关键词试试吧~</text>
			</view>

			<!-- 加载中 -->
			<view v-if="loading" class="loading-row">
				<text class="loading-text">搜索中...</text>
			</view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get } from '@/utils/request.js';

const STORAGE_KEY = 'search_history';
const MAX_HISTORY = 10;

export default {
	components: { AppIcon },
	data() {
		return {
			keyword: '',
			lastKeyword: '',
			hasSearched: false,
			results: [],
			loading: false,
			searchError: false,
			categoryId: '',
			history: [],
			hotSearches: [
				'iPad',
				'考研资料',
				'自行车',
				'台灯',
				'免费送',
				'显示器',
				'教材',
				'数码',
			],
		};
	},
	onLoad(options) {
		this.loadHistory();
		if (options && options.category) {
			this.categoryId = options.category;
			this.doSearch();
		}
	},
	methods: {
		// ========== 历史记录 ==========
		loadHistory() {
			try {
				const raw = uni.getStorageSync(STORAGE_KEY);
				this.history = raw ? JSON.parse(raw) : [];
			} catch (e) {
				this.history = [];
			}
		},

		saveHistory(keyword) {
			if (!keyword.trim()) return;
			// 去重后放在最前面
			const filtered = this.history.filter((h) => h !== keyword);
			filtered.unshift(keyword);
			// 最多保留 N 条
			this.history = filtered.slice(0, MAX_HISTORY);
			uni.setStorageSync(STORAGE_KEY, JSON.stringify(this.history));
		},

		clearHistory() {
			uni.showModal({
				title: '清除搜索历史',
				content: '确定要清除所有搜索历史吗？',
				success: (res) => {
					if (res.confirm) {
						this.history = [];
						uni.removeStorageSync(STORAGE_KEY);
						uni.showToast({ title: '已清除', icon: 'success' });
					}
				},
			});
		},

		// ========== 搜索 ==========
		onInput(e) {
			this.keyword = e.detail.value;
			this.categoryId = '';
		},

		searchHistory(keyword) {
			this.keyword = keyword;
			this.doSearch();
		},

		async doSearch() {
			const kw = this.keyword.trim();
			if (!kw && !this.categoryId) return;

			this.lastKeyword = kw;
			this.hasSearched = true;
			this.loading = true;
			this.results = [];
			this.searchError = false;

			// 保存到历史
			this.saveHistory(kw);

			try {
				const data = await get('/api/items', {
					keyword: kw || undefined,
					categoryId: this.categoryId || undefined,
					pageSize: 20,
				});
				this.results = data.list || [];
			} catch (e) {
				this.results = [];
				this.searchError = true;
			} finally {
				this.loading = false;
			}
		},

		clearInput() {
			this.keyword = '';
			this.categoryId = '';
			this.hasSearched = false;
			this.results = [];
		},

		// ========== 关键词高亮 ==========
		// 返回 rich-text 组件的 nodes 数组（兼容微信小程序）
		highlightNodes(text) {
			if (!text || !this.lastKeyword) {
				return text ? [text] : [];
			}
			const escaped = this.lastKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const regex = new RegExp(`(${escaped})`, 'gi');
			const parts = text.split(regex);
			const nodes = [];
			parts.forEach(part => {
				if (!part) return;
				if (part.toLowerCase() === this.lastKeyword.toLowerCase()) {
					nodes.push({
						name: 'span',
						attrs: { class: 'highlight' },
						children: [{ type: 'text', text: part }],
					});
				} else {
					nodes.push({ type: 'text', text: part });
				}
			});
			return nodes;
		},

		// ========== 导航 ==========
		goDetail(item) {
			uni.navigateTo({ url: '/pages/goods-detail/index?id=' + item.id });
		},

		goBack() {
			uni.navigateBack();
		},
	},
};
</script>

<style scoped>
.search-page {
	min-height: 100vh;
	background: #F2F3F8;
	display: flex;
	flex-direction: column;
}

/* ========== 搜索栏 ========== */
.search-header {
	display: flex;
	align-items: center;
	padding: 16rpx 20rpx;
	padding-top: calc(16rpx + env(safe-area-inset-top));
	background: #FFFFFF;
	gap: 16rpx;
}

.search-bar {
	flex: 1;
	display: flex;
	align-items: center;
	height: 72rpx;
	padding: 0 20rpx;
	border-radius: 36rpx;
	background: #F3F4F8;
	gap: 12rpx;
}

.search-input {
	flex: 1;
	font-size: 28rpx;
	color: #1A1D28;
	height: 100%;
}

.search-clear {
	width: 36rpx;
	height: 36rpx;
	border-radius: 50%;
	background: #B0B4C0;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.search-cancel {
	font-size: 28rpx;
	color: #4F6EF7;
	flex-shrink: 0;
}

/* ========== 搜索前 ========== */
.search-before {
	flex: 1;
	padding: 24rpx;
}

.search-section {
	margin-bottom: 36rpx;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #1A1D28;
}

.section-action {
	padding: 4rpx;
}

.tag-group {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.history-tag {
	padding: 12rpx 28rpx;
	border-radius: 28rpx;
	font-size: 26rpx;
	color: #6B6F80;
	background: #FFFFFF;
	transition: all 0.15s;
}

.history-tag:active {
	background: #F8F9FC;
}

.hot-tag {
	padding: 12rpx 28rpx;
	border-radius: 28rpx;
	font-size: 26rpx;
	color: #6B6F80;
	background: #FFFFFF;
	display: flex;
	align-items: center;
	gap: 8rpx;
	transition: all 0.15s;
}

.hot-tag:active {
	background: #F8F9FC;
}

.hot-tag.hot-top {
	color: #FF6B3D;
	font-weight: 600;
	background: #FFF5F0;
}

.hot-rank {
	font-size: 22rpx;
	font-weight: 700;
	font-style: italic;
}

/* ========== 搜索结果 ========== */
.search-results {
	flex: 1;
	padding: 20rpx 24rpx;
}

.result-count {
	margin-bottom: 16rpx;
	font-size: 24rpx;
	color: #999;
}

.result-card {
	display: flex;
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 20rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	transition: all 0.15s;
}

.result-card:active {
	transform: scale(0.99);
}

.result-image {
	width: 140rpx;
	height: 140rpx;
	border-radius: 12rpx;
	overflow: hidden;
	flex-shrink: 0;
	margin-right: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}
.result-image__img { width: 100%; height: 100%; }

.result-price-tag {
	position: absolute;
	right: 8rpx;
	bottom: 8rpx;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	background: rgba(0, 0, 0, 0.55);
}

.r-price { font-size: 22rpx; color: #FF6B3D; font-weight: 700; }
.r-free { font-size: 20rpx; color: #22C55E; font-weight: 600; }

.result-info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.result-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #1A1D28;
	display: block;
}

.result-desc {
	font-size: 24rpx;
	color: #8B8FA3;
	line-height: 1.5;
	display: block;
	margin: 6rpx 0;
}

.result-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.result-seller {
	font-size: 24rpx;
	color: #8B8FA3;
}

.result-time {
	font-size: 24rpx;
	color: #8B8FA3;
}

/* ========== 空/加载 ========== */
.loading-row {
	display: flex;
	justify-content: center;
	padding: 60rpx 0;
}

.loading-text {
	font-size: 26rpx;
	color: #B0B4C0;
}

.empty-sub {
	font-size: 24rpx;
	color: #B0B4C0;
	margin-top: 8rpx;
}
</style>

<!-- 非 scoped 样式：rich-text 内部 span 节点需要非 scoped 选择器 -->
<style>
.result-title .highlight,
.result-desc .highlight {
	color: #FF6B3D;
	font-weight: 600;
	background: #FFF5F0;
	padding: 2rpx 4rpx;
	border-radius: 4rpx;
}
</style>
