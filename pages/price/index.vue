<template>
	<view class="page-container--clean">
		<view class="page-body">
			<!-- 顶部引导 -->
			<view class="price-hero">
				<view class="hero-icon">
					<AppIcon name="price" :size="52" color="#FFF" />
				</view>
				<view class="hero-info">
					<text class="hero-title">AI 智能估价</text>
					<text class="hero-desc">基于同校区近期成交数据，帮你定一个合理价格</text>
				</view>
			</view>

			<!-- 拍照识别 -->
			<view class="card recognize-card">
				<view class="recognize-left">
					<AppIcon name="camera" :size="40" color="#4F6EF7" />
					<view class="recognize-info">
						<text class="recognize-title">拍照识别估价</text>
						<text class="recognize-sub">拍一张物品照片，自动识别分类</text>
					</view>
				</view>
				<view class="recognize-btn" @click="chooseAndRecognize">
					<text>拍照识别</text>
				</view>
			</view>

			<!-- AI 识别结果 -->
			<view v-if="aiResult" class="card ai-result">
				<view class="ai-result-row">
					<AppIcon name="ai" :size="30" color="#4F6EF7" />
					<text class="ai-result-text">识别为「{{ aiResult.name }}」，置信度 {{ Math.round(aiResult.confidence * 100) }}%</text>
				</view>
			</view>

			<!-- 分类选择 -->
			<view class="card">
				<text class="section-label">选择物品分类</text>
				<view class="chips">
					<view
						v-for="cat in categories"
						:key="cat.id"
						:class="['chip', { active: selectedCategory === cat.key }]"
						@click="selectCategory(cat)"
					>
						<AppIcon :name="cat.icon" :size="28" :color="selectedCategory === cat.key ? '#FFF' : '#6B6F80'" />
						<text class="chip-text">{{ cat.name }}</text>
					</view>
				</view>
			</view>

			<!-- 新旧程度 -->
			<view class="card">
				<text class="section-label">新旧程度</text>
				<view class="chips">
					<view
						v-for="c in conditions"
						:key="c.value"
						:class="['chip', { active: condition === c.value }]"
						@click="selectCondition(c.value)"
					>
						<text class="chip-text">{{ c.label }}</text>
					</view>
				</view>
			</view>

			<!-- 估价结果 -->
			<view v-if="estimate" class="estimate-card">
				<view class="estimate-top">
					<text class="estimate-label">参考估价</text>
					<text class="estimate-range">¥{{ estimate.min }} ~ ¥{{ estimate.max }}</text>
				</view>
				<view class="estimate-mid">
					<text class="estimate-avg">市场均价约 ¥{{ estimate.avg }}</text>
					<text class="estimate-count">基于 {{ estimate.count }} 件同校区近期成交</text>
				</view>
				<view class="estimate-reason">
					<AppIcon name="ai" :size="28" color="#4F6EF7" />
					<text class="estimate-reason-text">{{ estimate.reason }}</text>
				</view>
			</view>

			<view class="disclaimer">估价仅供参考，最终价格请结合物品实际情况与买家协商</view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get, post } from '@/utils/request.js';
import { recognizeImage } from '@/utils/ai-vision.js';

export default {
	components: { AppIcon },
	data() {
		return {
			categories: [],
			selectedCategory: '',
			condition: '9成新',
			conditions: [
				{ label: '全新未拆', value: '全新' },
				{ label: '9成新', value: '9成新' },
				{ label: '7成新', value: '7成新' },
				{ label: '有磨损', value: '有磨损' },
			],
			aiResult: null,
			estimate: null,
			estimating: false,
		};
	},
	onLoad() {
		this.loadCategories();
	},
	methods: {
		async loadCategories() {
			try {
				this.categories = await get('/api/categories');
			} catch (e) {
				this.categories = [
					{ id: 'c1', name: '教材教辅', icon: 'book', color: '#4F6EF7', key: 'book' },
					{ id: 'c2', name: '数码电子', icon: 'digital', color: '#6366F1', key: 'digital' },
					{ id: 'c3', name: '生活用品', icon: 'daily', color: '#FF6B3D', key: 'daily' },
					{ id: 'c4', name: '运动户外', icon: 'sports', color: '#22C55E', key: 'sports' },
					{ id: 'c5', name: '服饰箱包', icon: 'fashion', color: '#F59E0B', key: 'fashion' },
					{ id: 'c6', name: '其他', icon: 'other', color: '#6366F1', key: 'other' },
				];
			}
		},
		selectCategory(cat) {
			this.selectedCategory = cat.key;
			this.loadEstimate();
		},
		selectCondition(value) {
			this.condition = value;
			this.loadEstimate();
		},
		async loadEstimate() {
			if (!this.selectedCategory || this.estimating) return;
			this.estimating = true;
			try {
				this.estimate = await post('/api/price/estimate', {
					category: this.selectedCategory,
					condition: this.condition,
				});
			} catch (e) {
				this.estimate = null;
			} finally {
				this.estimating = false;
			}
		},
		chooseAndRecognize() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: async (res) => {
					const imagePath = res.tempFilePaths[0];
					uni.showLoading({ title: '识别中...', mask: true });
					let result = null;
					// 优先真实 AI 识别，失败自动回退 mock
					try {
						result = await recognizeImage(imagePath);
					} catch (e) {
						result = null;
					}
					if (!result) {
						try {
							result = await post('/api/ai/recognize');
						} catch (e) {
							result = null;
						}
					}
					uni.hideLoading();
					if (result) {
						this.aiResult = result;
						const cat = this.categories.find((c) => c.key === result.category);
						if (cat) {
							this.selectedCategory = cat.key;
							this.loadEstimate();
						}
						uni.showToast({ title: '识别成功：' + result.name, icon: 'none' });
					} else {
						uni.showToast({ title: '识别失败，请手动选择分类', icon: 'none' });
					}
				},
			});
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.price-hero {
	display: flex; align-items: center; gap: 20rpx;
	background: linear-gradient(135deg, #4F6EF7 0%, #6366F1 100%);
	border-radius: 20rpx; padding: 30rpx 26rpx; margin-bottom: 20rpx;
	box-shadow: 0 8rpx 30rpx rgba(79, 110, 247, 0.25);
}
.hero-icon {
	width: 88rpx; height: 88rpx; border-radius: 22rpx;
	background: rgba(255, 255, 255, 0.15);
	display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.hero-info { flex: 1; }
.hero-title { font-size: 34rpx; font-weight: 700; color: #FFF; display: block; }
.hero-desc { font-size: 22rpx; color: rgba(255, 255, 255, 0.75); display: block; margin-top: 8rpx; line-height: 1.5; }

.recognize-card { display: flex; align-items: center; justify-content: space-between; padding: 24rpx; }
.recognize-left { display: flex; align-items: center; gap: 16rpx; }
.recognize-info { display: flex; flex-direction: column; gap: 4rpx; }
.recognize-title { font-size: 28rpx; font-weight: 600; color: #1A1D28; }
.recognize-sub { font-size: 22rpx; color: #6B6F80; }
.recognize-btn {
	padding: 14rpx 28rpx; border-radius: 30rpx;
	background: linear-gradient(135deg, #4F6EF7, #3D56D4);
	color: #FFF; font-size: 26rpx; font-weight: 500;
	box-shadow: 0 4rpx 16rpx rgba(79, 110, 247, 0.3);
}

.ai-result { padding: 20rpx 24rpx; }
.ai-result-row { display: flex; align-items: center; gap: 12rpx; }
.ai-result-text { font-size: 26rpx; color: #4F6EF7; font-weight: 500; }

.section-label { font-size: 28rpx; font-weight: 600; color: #1A1D28; display: block; margin-bottom: 18rpx; }
.chips { display: flex; flex-wrap: wrap; gap: 14rpx; }
.chip {
	display: flex; align-items: center; gap: 8rpx;
	padding: 12rpx 22rpx; border-radius: 30rpx;
	background: #F2F3F8; transition: all 0.2s;
}
.chip.active { background: #3D56D4; }
.chip-text { font-size: 24rpx; color: #6B6F80; }
.chip.active .chip-text { color: #FFF; font-weight: 500; }

.estimate-card {
	background: linear-gradient(135deg, #EDF0FE, #F5F8FF);
	border: 1px solid #D6E4FF; border-radius: 20rpx;
	padding: 30rpx 26rpx; margin-top: 20rpx;
}
.estimate-top { display: flex; align-items: baseline; justify-content: space-between; }
.estimate-label { font-size: 26rpx; color: #6B6F80; }
.estimate-range { font-size: 48rpx; font-weight: bold; color: #FF6B3D; }
.estimate-mid { display: flex; align-items: center; justify-content: space-between; margin-top: 12rpx; }
.estimate-avg { font-size: 24rpx; color: #4F6EF7; font-weight: 500; }
.estimate-count { font-size: 22rpx; color: #6B6F80; }
.estimate-reason {
	display: flex; align-items: flex-start; gap: 10rpx;
	margin-top: 20rpx; padding-top: 18rpx; border-top: 1px dashed #C9D7F5;
}
.estimate-reason-text { flex: 1; font-size: 22rpx; color: #6B6F80; line-height: 1.5; }

.disclaimer { text-align: center; font-size: 22rpx; color: #8B8FA3; margin-top: 24rpx; }
</style>
