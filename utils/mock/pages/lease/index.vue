<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 搜索栏 -->
			<view class="search-bar" @click="goSearch">
				<AppIcon name="search" :size="36" color="#999" />
				<text class="search-placeholder">搜索可租借物品（相机、自行车…）</text>
			</view>

			<!-- 筛选栏 -->
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
						@click="currentSort = s.value"
					>{{ s.label }}</text>
				</view>
			</view>

			<!-- 租借物品列表 -->
			<view class="lease-list">
				<view
					class="card lease-card"
					v-for="item in leaseItems"
					:key="item.id"
					@click="goDetail(item)"
				>
					<view class="lease-row">
						<view class="lease-img">
							<view class="lease-img-placeholder">
								<AppIcon :name="item.category === 'digital' ? 'digital' : item.category === 'sports' ? 'sports' : 'daily'" :size="56" color="#CCC" />
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
										<AppIcon name="location" :size="22" color="#999" />
										<text class="meta-text">{{ item.campus }}</text>
									</view>
									<text class="meta-text">{{ timeAgo(item.publishTime) }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view class="empty-state" v-if="leaseItems.length === 0">
					<view class="empty-icon"><AppIcon name="lease" :size="80" color="#CCC" /></view>
					<text>暂无可租物品</text>
					<text class="mt-8" style="font-size:24rpx;color:#CCC;">快发布你的闲置物品来出租吧~</text>
				</view>
			</view>

			<!-- 发布出租悬浮按钮 -->
			<view class="lease-publish-btn" @click="goPublishLease">
				<AppIcon name="plus" :size="40" color="#FFF" />
				<text class="lease-publish-text">发布出租</text>
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

		<CustomTabBar :current="2" />
	</view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';
import { get } from '@/utils/request.js';
import store from '@/utils/store.js';

export default {
	components: { CustomTabBar, AppIcon },
	data() {
		return {
			sortOptions: [
				{ label: '最新发布', value: 'newest' },
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
			currentSort: 'newest',
			currentCampus: '全部校区',
			showCampusPicker: false,
			leaseItems: [],
		};
	},
	onLoad() {
		this.loadLeaseItems();
	},
	methods: {
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
			try {
				const data = await get('/api/lease-items', {
					sort: this.currentSort,
					campus: this.currentCampus !== '全部校区' ? this.currentCampus : undefined,
				});
				this.leaseItems = data.list || [];
			} catch (e) {
				this.leaseItems = [];
			}
		},
		goSearch() {
			uni.navigateTo({ url: '/pages/search/index' });
		},
		goDetail(item) {
			uni.navigateTo({ url: '/pages/lease-detail/index?id=' + item.id });
		},
		selectCampus(c) {
			this.currentCampus = c.name;
			this.loadLeaseItems();
		},
		goPublishLease() {
			if (!store.isLoggedIn) {
				uni.reLaunch({ url: '/pages/login/index' });
				return;
			}
			uni.navigateTo({ url: '/pages/publish/index?mode=lease' });
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.filter-row { display: flex; align-items: center; padding: 0 0 20rpx; gap: 16rpx; }
.filter-chip {
	display: flex; align-items: center; padding: 10rpx 20rpx;
	background: #FFF; border-radius: 30rpx; gap: 6rpx; border: 1px solid #E5E5E5; flex-shrink: 0;
}
.filter-chip-text { font-size: 24rpx; color: #4F6EF7; }
.filter-sorts { flex: 1; }
.sort-item {
	flex-shrink: 0; padding: 10rpx 24rpx; border-radius: 30rpx; font-size: 24rpx;
	color: #666; background: #FFF; white-space: nowrap;
}
.sort-item.active { color: #FFF; background: #4F6EF7; font-weight: 500; }

.lease-card { padding: 20rpx; }
.lease-row { display: flex; gap: 20rpx; }
.lease-img { width: 180rpx; height: 180rpx; position: relative; flex-shrink: 0; }
.lease-img-placeholder {
	width: 100%; height: 100%; background: #F5F5F5; border-radius: 12rpx;
	display: flex; align-items: center; justify-content: center;
}
.lease-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.lease-title { font-size: 30rpx; font-weight: 600; color: #333; }
.lease-desc { font-size: 24rpx; color: #999; margin-top: 6rpx; }
.lease-price-row { display: flex; align-items: center; gap: 20rpx; margin-top: 10rpx; }
.lease-price { display: flex; align-items: baseline; gap: 4rpx; }
.price-num { font-size: 36rpx; font-weight: bold; color: #FF6B3D; }
.price-unit { font-size: 22rpx; color: #FF6B3D; }
.lease-deposit {
	display: flex; align-items: center; gap: 4rpx;
	padding: 2rpx 12rpx; background: #FFF3E0; border-radius: 6rpx;
}
.deposit-label, .deposit-num { font-size: 20rpx; color: #FF9800; }
.deposit-num { font-weight: 500; }
.lease-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 12rpx; }
.lease-user { display: flex; align-items: center; gap: 10rpx; }
.user-avatar-lease { width: 40rpx; height: 40rpx; font-size: 20rpx; }
.lease-nickname { font-size: 22rpx; color: #666; }
.lease-meta { display: flex; align-items: center; gap: 12rpx; }
.lease-campus { display: flex; align-items: center; gap: 4rpx; }
.meta-text { font-size: 20rpx; color: #999; }

.lease-publish-btn {
	position: fixed; right: 30rpx; bottom: calc(180rpx + env(safe-area-inset-bottom));
	display: flex; align-items: center; gap: 8rpx; padding: 16rpx 28rpx;
	background: linear-gradient(135deg, #4F6EF7, #6366F1); color: #FFF;
	border-radius: 40rpx; box-shadow: 0 8rpx 24rpx rgba(79, 110, 247, 0.35); z-index: 100;
}
.lease-publish-text { font-size: 26rpx; font-weight: 500; }

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
