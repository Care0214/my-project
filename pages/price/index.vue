<template>
	<view class="page-container--clean">
		<view class="page-body">
			<!-- 顶部引导 -->
			<view class="price-hero">
				<view class="hero-icon">
					<image class="hero-price-icon" :src="priceIcon" mode="aspectFit" />
				</view>
				<view class="hero-info">
					<text class="hero-title">AI 智能估价</text>
					<text class="hero-desc">基于平台近期参考数据，帮你定一个合理价格</text>
				</view>
			</view>

			<!-- 拍照识别 -->
			<view class="card recognize-card">
				<view class="recognize-left">
					<image class="recognize-camera-icon" src="/static/imgs/2.png" mode="aspectFit" />
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
					<AppIcon name="ai" :size="44" color="#77C9F1" />
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
						<image
							v-if="getCategoryImage(cat)"
							:class="['category-icon-img', { active: selectedCategory === cat.key }]"
							:src="getCategoryImage(cat)"
							mode="aspectFit"
						/>
						<AppIcon
							v-else
							:name="cat.icon"
							:size="44"
							:color="selectedCategory === cat.key ? '#FFF' : '#6B6F80'"
						/>
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
					<text class="estimate-count">基于 {{ estimate.count }} 件平台近期参考记录</text>
				</view>
				<view class="estimate-reason">
					<AppIcon name="ai" :size="44" color="#77C9F1" />
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
			priceIcon: require('@/imgs/price.png'),
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
		getCategoryImage(cat) {
			const map = {
				c1: '/static/imgs/3.png',
				c2: '/static/imgs/4.png',
				c3: '/static/imgs/5.png',
				c4: '/static/imgs/6.png',
				c5: '/static/imgs/7.png',
				c6: '/static/imgs/9.png',
				book: '/static/imgs/3.png',
				digital: '/static/imgs/4.png',
				daily: '/static/imgs/5.png',
				sports: '/static/imgs/6.png',
				fashion: '/static/imgs/7.png',
				free: '/static/imgs/9.png',
				gift: '/static/imgs/9.png',
			};
			return map[cat.id] || map[cat.key] || '';
		},
		async loadCategories() {
			try {
				this.categories = await get('/api/categories');
			} catch (e) {
				this.categories = [
					{ id: 'c1', name: '教材教辅', icon: 'book', color: '#77C9F1', key: 'book' },
					{ id: 'c2', name: '数码电子', icon: 'digital', color: '#77C9F1', key: 'digital' },
					{ id: 'c3', name: '生活用品', icon: 'daily', color: '#FF6B3D', key: 'daily' },
					{ id: 'c4', name: '运动户外', icon: 'sports', color: '#22C55E', key: 'sports' },
					{ id: 'c5', name: '服饰箱包', icon: 'fashion', color: '#F59E0B', key: 'fashion' },
					{ id: 'c6', name: '免费赠送', icon: 'gift', color: '#EF4444', key: 'free' },
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
				try {
					result = await recognizeImage(imagePath);
					if (result) {
						this.aiResult = result;
						const cat = this.categories.find((c) => c.key === result.category);
						if (cat) {
							this.selectedCategory = cat.key;
							this.loadEstimate();
							uni.showToast({ title: '识别成功：' + result.name, icon: 'none' });
						} else {
							uni.showToast({ title: '识别成功，请手动选择分类', icon: 'none' });
						}
					} else {
						this.aiResult = null;
					}
				} catch (e) {
					console.error('[价格页] AI识图失败', e);
					uni.showToast({ title: getAiErrorTitle(e), icon: 'none', duration: 3000 });
					this.aiResult = null;
				} finally {
					uni.hideLoading();
				}
				},
			});
		},
	},
};

function getAiErrorTitle(error) {
	const message = error && error.message ? error.message : '';
	if (message.indexOf('url not in domain list') > -1) return '请关闭域名校验或配置云空间域名';
	if (message.indexOf('请求云函数超时') > -1 || message.indexOf('timeout') > -1) return '云函数执行超时，请检查 Base URL 和函数超时配置';
	if (message.indexOf('DASHSCOPE_API_KEY') > -1) return '云函数未配置百炼 Key';
	if (message.indexOf('401') > -1) return '百炼 Key 无效或已失效';
	if (message.indexOf('未找到') > -1 || message.indexOf('不存在') > -1) return '云函数未部署或名称不一致';
	if (message.indexOf('uniCloud') > -1 || message.indexOf('服务空间') > -1) return '当前运行包未关联云服务空间';
	return 'AI识别失败，请查看控制台日志';
}
</script>

<style scoped>
@import '@/styles/common.scss';

.price-hero {
	display: flex; align-items: center; gap: 20rpx;
	background: linear-gradient(180deg, #4F91C5 0%, #77C9F1 100%);
	border-radius: 20rpx; padding: 30rpx 26rpx; margin-bottom: 20rpx;
	box-shadow: 0 8rpx 30rpx rgba(56, 108, 148, 0.18);
}
.hero-icon {
	width: 88rpx; height: 88rpx; border-radius: 22rpx;
	background: rgba(255, 255, 255, 0.15);
	display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.hero-price-icon { width: 44rpx; height: 44rpx; }
.hero-info { flex: 1; }
.hero-title { font-size: 34rpx; font-weight: 700; color: #FFF; display: block; }
.hero-desc { font-size: 26rpx; color: rgba(255, 255, 255, 0.75); display: block; margin-top: 8rpx; line-height: 1.5; }

.recognize-card { display: flex; align-items: center; justify-content: space-between; padding: 24rpx; }
.recognize-left { display: flex; align-items: center; gap: 16rpx; }
.recognize-camera-icon { width: 44rpx; height: 44rpx; flex-shrink: 0; }
.recognize-info { display: flex; flex-direction: column; gap: 4rpx; }
.recognize-title { font-size: 28rpx; font-weight: 600; color: #1A1D28; }
.recognize-sub { font-size: 26rpx; color: #6B6F80; }
.recognize-btn {
	padding: 14rpx 28rpx; border-radius: 30rpx;
	background: linear-gradient(135deg, #4F91C5 0%, #77C9F1 100%);
	color: #FFF; font-size: 26rpx; font-weight: 500;
	box-shadow: 0 4rpx 16rpx rgba(119, 201, 241, 0.3);
}

.ai-result { padding: 20rpx 24rpx; }
.ai-result-row { display: flex; align-items: center; gap: 12rpx; }
.ai-result-text { font-size: 26rpx; color: #4F91C5; font-weight: 500; }

.section-label { font-size: 28rpx; font-weight: 600; color: #1A1D28; display: block; margin-bottom: 18rpx; }
.chips { display: flex; flex-wrap: wrap; gap: 14rpx; }
.chip {
	display: flex; align-items: center; gap: 8rpx;
	padding: 12rpx 22rpx; border-radius: 30rpx;
	background: #F2F3F8; transition: all 0.2s;
}
.chip.active { background: #4F91C5; }
.category-icon-img { width: 44rpx; height: 44rpx; flex-shrink: 0; }
.category-icon-img.active { filter: brightness(0) invert(1); }
.chip-text { font-size: 28rpx; color: #6B6F80; }
.chip.active .chip-text { color: #FFF; font-weight: 500; }

.estimate-card {
	background: linear-gradient(135deg, #EAF1FE, #F5F8FF);
	border: 1px solid #D6E4FF; border-radius: 20rpx;
	padding: 30rpx 26rpx; margin-top: 20rpx;
}
.estimate-top { display: flex; align-items: baseline; justify-content: space-between; }
.estimate-label { font-size: 26rpx; color: #6B6F80; }
.estimate-range { font-size: 48rpx; font-weight: bold; color: #FF6B3D; }
.estimate-mid { display: flex; align-items: center; justify-content: space-between; margin-top: 12rpx; }
.estimate-avg { font-size: 28rpx; color: #4F91C5; font-weight: 500; }
.estimate-count { font-size: 26rpx; color: #6B6F80; }
.estimate-reason {
	display: flex; align-items: flex-start; gap: 10rpx;
	margin-top: 20rpx; padding-top: 18rpx; border-top: 1px dashed #C9D7F5;
}
.estimate-reason-text { flex: 1; font-size: 26rpx; color: #6B6F80; line-height: 1.5; }

.disclaimer { text-align: center; font-size: 26rpx; color: #8B8FA3; margin-top: 24rpx; }
</style>
