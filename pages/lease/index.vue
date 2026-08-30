<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 搜索栏 -->
			<view class="search-barbox">
				<view class="search-bar" @click="goSearch">
					<image class="search-icon-img" src="/static/imgs/1.png" mode="aspectFit" />
					<text class="search-placeholder">搜索可租借物品（相机、自行车…）</text>
					<view class="search-filter">
						<image class="camera-icon-img" src="/static/imgs/camera.png" mode="aspectFit" />
					</view>
				</view>
			</view>
			<!-- 筛选栏 -->
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

			

			<!-- 租借物品列表：加载骨架屏 -->
			<view v-if="loading && leaseItems.length === 0" class="lease-list">
				<view class="card lease-card" v-for="i in 4" :key="'sk' + i">
					<view class="lease-row">
						<view class="skeleton-block" style="width:180rpx;height:180rpx;border-radius:16rpx;flex-shrink:0;"></view>
						<view class="lease-info lease-info-tight">
							<view class="skeleton-block" style="width:70%;height:32rpx;border-radius:8rpx;"></view>
							<view class="skeleton-block" style="width:100%;height:24rpx;border-radius:8rpx;"></view>
							<view class="skeleton-block" style="width:50%;height:24rpx;border-radius:8rpx;"></view>
						</view>
					</view>
				</view>
			</view>

			<!-- 租借物品列表 -->
			<view class="lease-list" v-else>
				<view
					class="card lease-card anim-in"
					v-for="item in leaseItems"
					:key="item.id"
					@click="goDetail(item)"
				>
					<view class="lease-row">
						<view class="lease-img">
							<image
								v-if="item.images && item.images.length > 0"
								:src="item.images[0]"
								class="lease-img__img"
								mode="aspectFill"
								lazy-load
							/>
							<view v-else class="lease-img-placeholder">
								<image
									v-if="getCategoryImage(item.category)"
									class="lease-category-icon"
									:src="getCategoryImage(item.category)"
									mode="aspectFit"
								/>
								<AppIcon v-else name="daily" :size="56" color="#9AA3B5" />
							</view>
							<view class="tag tag-lease">可租</view>
						</view>

						<view class="lease-info">
							<text class="lease-title text-ellipsis">{{ item.title }}</text>
							<text class="lease-desc text-ellipsis-2">{{ item.desc }}</text>

							<view class="lease-price-row">
								<view class="lease-price">
									<text class="price-num">¥{{ item.price }}</text>
									<text class="price-unit">/天</text>
								</view>
								<view class="lease-deposit">
									<text class="deposit-label">押金</text>
									<text class="deposit-num">¥{{ item.deposit }}</text>
								</view>
							</view>

							<view class="lease-footer">
								<view class="lease-user">
									<view class="avatar-placeholder user-avatar-lease">
										<text>{{ item.user.nickname.charAt(0) }}</text>
									</view>
									<text class="lease-nickname">{{ item.user.nickname }}</text>
								</view>
								<view class="lease-meta">
									<view class="lease-campus">
										<image class="lease-campus-icon" src="/static/imgs/8.png" mode="aspectFit" />
										<text class="meta-text">{{ item.campus }}</text>
									</view>
									<text class="meta-text">{{ timeAgo(item.publishTime) }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view v-if="loadError && leaseItems.length === 0" class="error-state">
					<AppIcon name="close" :size="56" color="#EF4444" />
					<text class="error-text">加载失败，请检查网络后重试</text>
					<view class="retry-btn" @click="loadLeaseItems"><text>重新加载</text></view>
				</view>
				<view class="empty-state" v-else-if="leaseItems.length === 0">
					<view class="empty-icon"><AppIcon name="lease" :size="72" color="#9AA3B5" /></view>
					<text>暂无可租物品</text>
					<text class="mt-8 empty-sub-text">快发布你的闲置物品来出租吧~</text>
				</view>
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

		<CustomTabBar :current="2" />
		<BackTop :visible="showBackTop" />
	</view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';
import BackTop from '@/components/BackTop.vue';
import { get } from '@/utils/request.js';

export default {
	components: { CustomTabBar, AppIcon, BackTop },
	data() {
		return {
			sortOptions: [
				{ label: '最新发布', value: 'newest' },
				{ label: '价格最低', value: 'price_asc' },
				{ label: '价格最高', value: 'price_desc' },
			],
			campuses: [{ id: 0, name: '全部校区' }],
			currentSort: 'newest',
			currentCampus: '全部校区',
			showCampusPicker: false,
			leaseItems: [],
			loadError: false,
			loading: false,
			showBackTop: false,
		};
	},
	onLoad() {
		this.loadCampuses();
		this.loadLeaseItems();
	},
	onPullDownRefresh() {
		this.loadLeaseItems().then(() => {
			uni.stopPullDownRefresh();
		});
	},
	onPageScroll(e) {
		this.showBackTop = e.scrollTop > 400;
	},
	methods: {
		getCategoryImage(category) {
			const map = {
				book: '/static/imgs/3.png',
				digital: '/static/imgs/4.png',
				daily: '/static/imgs/5.png',
				sports: '/static/imgs/6.png',
				fashion: '/static/imgs/7.png',
				free: '/static/imgs/9.png',
				gift: '/static/imgs/9.png',
			};
			return map[category] || '';
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
		timeAgo(timestamp) {
			const now = Date.now();
			const diff = now - timestamp;
			const seconds = Math.floor(diff / 1000);
			const minutes = Math.floor(seconds / 60);
			const hours = Math.floor(minutes / 60);
			const days = Math.floor(hours / 24);
			if (seconds < 60) return '刚刚';
			if (minutes < 60) return minutes + '分钟前';
			if (hours < 24) return hours + '小时前';
			if (days < 30) return days + '天前';
			return new Date(timestamp).toLocaleDateString('zh-CN');
		},
		async loadLeaseItems() {
			this.loading = true;
			try {
				const data = await get('/api/lease-items', {
					sort: this.currentSort,
					campus: this.currentCampus !== '全部校区' ? this.currentCampus : undefined,
				});
				this.leaseItems = data.list || [];
				this.loadError = false;
			} catch (e) {
				this.leaseItems = [];
				this.loadError = true;
			} finally {
				this.loading = false;
			}
		},
		goSearch() {
			uni.navigateTo({
				url: '/pages/search/index',
				
			});
		},
		goDetail(item) {
			uni.navigateTo({ url: '/pages/lease-detail/index?id=' + item.id });
		},
		selectCampus(c) {
			// 再次点击已选中的校区则取消筛选，回到「全部校区」
			this.currentCampus = (this.currentCampus === c.name) ? '全部校区' : c.name;
			this.loadLeaseItems();
		},
		applySort(value) {
			// 再次点击已选中的排序则取消筛选，回到默认「最新发布」
			this.currentSort = (this.currentSort === value) ? 'newest' : value;
			this.loadLeaseItems();
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';
.search-barbox{
	position: sticky; top: 0; z-index: 20;
	margin: 0 -20rpx 20rpx;
	background: linear-gradient(180deg, #4F91C5 0%, #77C9F1 100%);
	padding: 24rpx 24rpx 28rpx;
	border-radius: 0 0 32rpx 32rpx;
}
.search-barbox .search-bar{
	background: #FFFFFF;
	border: none;
	box-shadow: 0 6rpx 18rpx rgba(56, 108, 148, 0.12);
	border-radius: 48rpx;
	padding: 20rpx 28rpx;
}
.search-filter {
	width: 56rpx; height: 56rpx; border-radius: 50%;
	background: #EAF1FE; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.search-icon-img { width: 44rpx; height: 44rpx; flex-shrink: 0; }
.camera-icon-img { width: 38rpx; height: 38rpx; }

.box-3{
	background-color: transparent;
}
.filter-row { display: flex; align-items: center; padding: 0 0 20rpx; gap: 16rpx; }
.filter-chip {
	display: flex; align-items: center; padding: 10rpx 20rpx;
	background: #FFF; border-radius: 30rpx; gap: 6rpx; border: 1px solid #EAF0F8; flex-shrink: 0;
}
.filter-chip-text { font-size: 28rpx; color: #4F91C5; }
.campus-filter-icon { width: 44rpx; height: 44rpx; flex-shrink: 0; }
.filter-sorts { flex: 1; }
.sort-item {
	flex-shrink: 0; padding: 10rpx 24rpx; border-radius: 30rpx; font-size: 28rpx;
	color: #5B6675; background: #FFF; white-space: nowrap;
}
.sort-item.active { color: #FFF; background: #4F91C5; font-weight: 500; }

.lease-card { padding: 20rpx; }
.lease-list .lease-card:nth-child(2) { animation-delay: 60ms; }
.lease-list .lease-card:nth-child(3) { animation-delay: 120ms; }
.lease-row { display: flex; gap: 20rpx; }
.lease-img { width: 180rpx; height: 180rpx; position: relative; flex-shrink: 0; }
.lease-img__img { width: 100%; height: 100%; border-radius: 16rpx; }
.lease-img-placeholder {
	width: 100%; height: 100%; background: #F0F3F9; border-radius: 16rpx;
	display: flex; align-items: center; justify-content: center;
}
.lease-category-icon { width: 84rpx; height: 84rpx; }
.lease-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.lease-title { font-size: 30rpx; font-weight: 600; color: #1A1D28; }
.lease-desc { font-size: 28rpx; color: #5B6675; margin-top: 6rpx; }
.lease-price-row { display: flex; align-items: center; gap: 20rpx; margin-top: 10rpx; }
.lease-price { display: flex; align-items: baseline; gap: 4rpx; }
.price-num { font-size: 36rpx; font-weight: bold; color: #FF5A36; }
.price-unit { font-size: 26rpx; color: #FF5A36; }
.lease-deposit {
	display: flex; align-items: center; gap: 4rpx;
	padding: 2rpx 12rpx; background: #FFF3E0; border-radius: 8rpx;
}
.deposit-label, .deposit-num { font-size: 26rpx; color: #F59E0B; }
.deposit-num { font-weight: 500; }
.lease-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 12rpx; }
.lease-user { display: flex; align-items: center; gap: 10rpx; }
.user-avatar-lease { width: 40rpx; height: 40rpx; font-size: 26rpx; }
.lease-nickname { font-size: 26rpx; color: #5B6675; }
.lease-meta { display: flex; align-items: center; gap: 12rpx; }
.lease-campus { display: flex; align-items: center; gap: 4rpx; }
.lease-campus-icon { width: 28rpx; height: 28rpx; flex-shrink: 0; }
.meta-text { font-size: 26rpx; color: #5B6675; }

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
.empty-sub-text { font-size: 28rpx; color: #667384; }
.lease-info-tight { gap: 12rpx; }
</style>
