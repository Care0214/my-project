<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 顶部导航 -->
			<view class="publish-header">
				<view class="back-btn" @click="goBack">
					<AppIcon name="close" :size="44" color="#333" />
				</view>
				<text class="header-title">发布</text>
				<view class="submit-btn" @click="submitPublish"><text>{{ priceBlocked ? '价格异常，请修改' : '发布' }}</text></view>
			</view>

			<!-- 发布类型选择 -->
			<view class="type-section">
				<text class="section-label">选择发布类型</text>
				<view class="type-row">
					<view
						v-for="t in publishTypes"
						:key="t.value"
						:class="['type-card', { active: formData.type === t.value }]"
						@click="switchType(t.value)"
					>
						<text class="type-label">{{ t.label }}</text>
						<text class="type-desc">{{ t.desc }}</text>
						<view class="type-check" v-if="formData.type === t.value">
							<AppIcon name="check" :size="28" color="#FFF" />
						</view>
					</view>
				</view>
			</view>

			<!-- 非心愿模式：图片上传 -->
			<template v-if="formData.type !== 'wish'">
				<view class="form-card">
					<text class="section-label">上传物品图片 <text class="hint-text">（最多6张）</text></text>
					<view class="upload-area">
						<view v-for="(img, i) in formData.images" :key="i" class="upload-item">
							<image :src="img" class="upload-image" mode="aspectFill" @click="previewImage(i)" />
							<view class="upload-delete" @click="removeImage(i)">
								<AppIcon name="close" :size="28" color="#FFF" />
							</view>
						</view>
						<view class="upload-add" @click="chooseImage" v-if="formData.images.length < 6">
							<AppIcon name="plus" :size="48" color="#CCC" />
							<text class="upload-add-text">添加图片</text>
						</view>
					</view>

					<!-- AI识别结果 -->
					<view class="ai-card" v-if="formData.images.length > 0 && aiResult">
						<view class="ai-card-header">
							<AppIcon name="ai" :size="32" color="#4F6EF7" />
							<text class="ai-card-title">AI智能识别结果</text>
						</view>
						<view class="ai-card-body">
							<text class="ai-result-label">识别分类：</text>
							<text class="ai-result-value">{{ aiResult.name }}</text>
						</view>
						<view class="ai-tags">
							<text class="ai-tag" v-for="tag in aiResult.tags" :key="tag">#{{ tag }}</text>
						</view>
					</view>

					<!-- 手动修正分类 -->
					<view class="category-fix" v-if="formData.images.length > 0">
						<text class="fix-label">分类不对？手动修正：</text>
						<view class="fix-chips">
							<view
								v-for="cat in categories"
								:key="cat.id"
								:class="['fix-chip', { active: formData.category === cat.id }]"
								@click="selectCategory(cat.id)"
							>
								<AppIcon :name="cat.icon" :size="24" :color="formData.category === cat.id ? '#FFF' : '#666'" />
								<text class="fix-chip-text">{{ cat.name }}</text>
							</view>
						</view>
					</view>
				</view>
			</template>

			<!-- 表单区 -->
			<view class="form-card">
				<view class="form-item">
					<text class="form-label">{{ formData.type === 'wish' ? '心愿标题' : '标题' }} <text class="required">*</text></text>
					<input class="form-input" v-model="formData.title" :placeholder="formData.type === 'wish' ? '例如：求购考研数学资料' : '请输入物品标题（最多30字）'" maxlength="30" />
				</view>

				<view class="form-item">
					<text class="form-label">{{ formData.type === 'wish' ? '心愿描述' : '描述' }} <text class="required">*</text></text>
					<textarea class="form-textarea" v-model="formData.desc" :placeholder="formData.type === 'wish' ? '详细描述你想要什么…' : '详细描述物品状态、新旧程度等…'" maxlength="500" />
				</view>

				<!-- 心愿类型 -->
				<view class="form-item" v-if="formData.type === 'wish'">
					<text class="form-label">心愿类型</text>
					<view class="wish-type-row">
						<view :class="['wish-type', { active: formData.wishType === 'buy' }]" @click="formData.wishType = 'buy'">
							<text>求购</text>
						</view>
						<view :class="['wish-type', { active: formData.wishType === 'borrow' }]" @click="formData.wishType = 'borrow'">
							<text>求借</text>
						</view>
					</view>
				</view>

				<!-- 出售：价格 -->
				<view class="form-item" v-if="formData.type === 'sell'">
					<text class="form-label">出售价格 <text class="required">*</text></text>
					<view class="form-input-row">
						<text class="input-prefix">¥</text>
						<input class="form-input flex-1" v-model="formData.price" placeholder="输入期望售价" type="digit" />
					</view>

					<!-- 新旧程度 -->
					<view class="cond-row" v-if="estimate">
						<text class="cond-label">新旧程度</text>
						<view class="cond-chips">
							<view
								v-for="c in conditions"
								:key="c.value"
								:class="['cond-chip', { active: condition === c.value }]"
								@click="selectCondition(c.value)"
							>
								<text>{{ c.label }}</text>
							</view>
						</view>
					</view>

					<!-- AI 估价参考 -->
					<view class="estimate-wrap" v-if="estimate">
						<view class="estimate-head">
							<AppIcon name="ai" :size="28" color="#4F6EF7" />
							<text class="estimate-label">AI 估价参考</text>
							<text class="estimate-range">¥{{ estimate.min }} ~ ¥{{ estimate.max }}</text>
						</view>
						<view class="estimate-foot">
							<text class="estimate-avg">市场均价约 ¥{{ estimate.avg }} · {{ estimate.count }} 件同校区成交</text>
							<text v-if="priceCheckStatus === 'ok'" class="estimate-status ok">价格合理 ✓</text>
							<text v-else-if="priceCheckStatus === 'warn'" class="estimate-status warn">价格超出建议范围</text>
							<text v-else-if="priceCheckStatus === 'block'" class="estimate-status block">价格异常，无法发布</text>
						</view>
					</view>
				</view>

				<!-- 换物：置换要求 -->
				<view class="form-item" v-if="formData.type === 'exchange'">
					<text class="form-label">置换要求</text>
					<textarea class="form-textarea" v-model="formData.barterWant" placeholder="描述你希望换到的物品（如：想换一个计算器）" maxlength="300" />
				</view>

				<!-- 租借：租金+押金 -->
				<template v-if="formData.type === 'lease'">
					<view class="form-item">
						<text class="form-label">日租金 <text class="required">*</text></text>
						<view class="form-input-row">
							<text class="input-prefix">¥</text>
							<input class="form-input flex-1" v-model="formData.leasePrice" placeholder="输入每日租金" type="digit" />
							<text class="input-suffix">/天</text>
						</view>
					</view>
					<view class="form-item">
						<text class="form-label">押金金额</text>
						<view class="form-input-row">
							<text class="input-prefix">¥</text>
							<input class="form-input flex-1" v-model="formData.deposit" placeholder="输入押金金额（选填）" type="digit" />
						</view>
					</view>
					<view class="form-item">
						<text class="form-label">最短租期</text>
						<view class="form-input-row">
							<input class="form-input flex-1" v-model="formData.minDays" placeholder="最少租借天数" type="number" />
							<text class="input-suffix">天</text>
						</view>
					</view>
				</template>

				<!-- 校区选择 -->
				<view class="form-item">
					<text class="form-label">校区</text>
					<picker :range="campusNames" @change="onCampusChange">
						<view class="form-picker">
							<text :class="{ placeholder: !formData.campus }">{{ formData.campus || '请选择校区' }}</text>
							<AppIcon name="arrow-right" :size="28" color="#B0B4C0" />
						</view>
					</picker>
				</view>

				<!-- 标签 -->
				<view class="form-item">
					<text class="form-label">标签 <text class="hint-text">（选填，最多5个）</text></text>
					<view class="tag-input-row">
						<input class="form-input flex-1" v-model="tagInput" placeholder="输入标签，如：考研、九成新" maxlength="8" confirm-type="done" @confirm="addTag" />
						<view class="tag-add-btn" @click="addTag"><text>添加</text></view>
					</view>
					<view class="tag-list" v-if="formData.tags.length > 0">
						<view v-for="(tag, i) in formData.tags" :key="i" class="tag-chip" @click="removeTag(i)">
							<text>#{{ tag }}</text>
							<text class="tag-close">✕</text>
						</view>
					</view>
				</view>

				<!-- 联系方式 -->
				<view class="form-item">
					<text class="form-label">联系方式（选填）</text>
					<input class="form-input" v-model="formData.contact" placeholder="微信号 / 手机号，方便他人联系" />
				</view>

				<!-- 匿名发布 -->
				<view class="form-item form-item-last">
					<view class="anon-row">
						<view class="anon-info">
							<text class="anon-title">匿名发布</text>
							<text class="anon-desc">使用随机称号「{{ anonymousTitle }}」代替昵称，保护隐私</text>
						</view>
						<switch :checked="anonymous" color="#4F6EF7" @change="onAnonymousChange" />
					</view>
				</view>
			</view>

			<!-- 发布须知 -->
			<view class="publish-notice">
				<AppIcon name="shield" :size="32" color="#FF9800" />
				<text class="notice-text">发布即代表同意平台规则。请保证信息真实准确，共同维护校园交易环境。</text>
			</view>

			<view style="height: 40rpx;"></view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get, post } from '@/utils/request.js';
import store from '@/utils/store.js';
import { recognizeImage } from '@/utils/ai-vision.js';

export default {
	components: { AppIcon },
	data() {
		return {
			publishTypes: [
				{ label: '闲置出售', value: 'sell', desc: '发布闲置物品，设置价格出售' },
				{ label: '以物换物', value: 'exchange', desc: '用闲置物品交换你想要的东西' },
				{ label: '短期租借', value: 'lease', desc: '设置租金和押金，按天出租' },
				{ label: '求助心愿', value: 'wish', desc: '发布求购/求借心愿' },
			],
			categories: [],
			formData: {
				type: 'sell', title: '', desc: '', images: [], category: 'c6',
				price: '', barterWant: '', leasePrice: '', deposit: '', minDays: 1,
				wishType: 'buy', campus: '', tags: [], contact: '',
			},
			campuses: [],
			campusNames: [],
			tagInput: '',
			estimate: null,
			estimating: false,
			condition: '9成新',
			conditions: [
				{ label: '全新未拆', value: '全新' },
				{ label: '9成新', value: '9成新' },
				{ label: '7成新', value: '7成新' },
				{ label: '有磨损', value: '有磨损' },
			],
			anonymous: false,
			aiResult: null,
		};
	},
	computed: {
		anonymousTitle() {
			return (this.$store && this.$store.title) || '拾闲用户';
		},
		priceCheckStatus() {
			if (!this.estimate || !this.formData.price || Number(this.formData.price) <= 0) return '';
			const p = Number(this.formData.price);
			if (p >= this.estimate.min && p <= this.estimate.max) return 'ok';
			if (p < this.estimate.min * 0.5 || p > this.estimate.max * 2) return 'block';
			return 'warn';
		},
		priceBlocked() {
			return this.priceCheckStatus === 'block';
		},
	},
	onLoad(options) {
		if (!store.isLoggedIn) {
			uni.reLaunch({ url: '/pages/login/index' });
			return;
		}
		// 支持从租借页跳转默认选租借类型
		if (options && options.mode === 'lease') {
			this.formData.type = 'lease';
		}
		this.loadCategories();
		this.loadEstimate();
		this.loadCampuses();
		const userInfo = (this.$store && this.$store.userInfo) || {};
		if (userInfo.campus) {
			this.formData.campus = userInfo.campus;
		}
	},
	methods: {
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
					{ id: 'c6', name: '其他', icon: 'other', color: '#8B5CF6' },
				];
			}
		},
		async loadCampuses() {
			const school = (this.$store && this.$store.userInfo && this.$store.userInfo.school) || '';
			try {
				this.campuses = await get('/api/campuses', { school });
				this.campusNames = (this.campuses || []).map((c) => c.name);
			} catch (e) {
				this.campuses = [];
				this.campusNames = ['长清湖校区', '千佛山校区'];
			}
		},
		onCampusChange(e) {
			this.formData.campus = this.campusNames[e.detail.value];
		},
		addTag() {
			const val = (this.tagInput || '').trim();
			if (!val) return;
			if (this.formData.tags.includes(val)) {
				uni.showToast({ title: '标签已存在', icon: 'none' });
				return;
			}
			if (this.formData.tags.length >= 5) {
				uni.showToast({ title: '最多添加5个标签', icon: 'none' });
				return;
			}
			this.formData.tags.push(val);
			this.tagInput = '';
		},
		removeTag(index) {
			this.formData.tags.splice(index, 1);
		},
		switchType(type) {
			this.formData.type = type;
			if (type === 'wish') this.aiResult = null;
			if (type !== 'sell') {
				this.estimate = null;
			} else {
				this.loadEstimate();
			}
		},
		onAnonymousChange(e) {
			this.anonymous = !!e.detail.value;
		},
		goBack() {
			uni.navigateBack();
		},
		chooseImage() {
			uni.chooseImage({
				count: 6 - this.formData.images.length,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.formData.images.push(...res.tempFilePaths);
					this.doAiRecognition();
				},
			});
		},
		removeImage(index) {
			this.formData.images.splice(index, 1);
			if (this.formData.images.length === 0) this.aiResult = null;
		},
		previewImage(current) {
			if (this.formData.images && this.formData.images.length > 0) {
				uni.previewImage({
					urls: this.formData.images,
					current: this.formData.images[current] || this.formData.images[0],
				});
			}
		},
		async doAiRecognition() {
			const lastImage = this.formData.images[this.formData.images.length - 1];
			if (!lastImage) return;
			uni.showLoading({ title: 'AI 识别中...', mask: true });
			try {
				const real = await recognizeImage(lastImage);
				if (real) {
					const idMap = { book: 'c1', digital: 'c2', daily: 'c3', sports: 'c4', fashion: 'c5', other: 'c6' };
					this.aiResult = {
						category: idMap[real.category] || 'c6',
						name: real.name,
						confidence: real.confidence,
						tags: real.tags,
					};
					this.formData.category = this.aiResult.category;
					this.loadEstimate();
					uni.hideLoading();
					return;
				}
			} catch (e) { /* 回退 mock */ }
			uni.hideLoading();
			this.simulateAiRecognition();
		},
		simulateAiRecognition() {
			// 模拟AI识别
			const results = [
				{ category: 'c1', name: '教材书籍', confidence: 0.94, tags: ['教材', '考研', '二手书'] },
				{ category: 'c2', name: '数码产品', confidence: 0.91, tags: ['电子', '手机', '配件'] },
				{ category: 'c3', name: '生活用品', confidence: 0.87, tags: ['日常', '家居', '宿舍'] },
				{ category: 'c4', name: '文体工具', confidence: 0.89, tags: ['运动', '器材', '户外'] },
				{ category: 'c5', name: '服饰箱包', confidence: 0.85, tags: ['衣物', '穿搭', '箱包'] },
			];
			this.aiResult = results[Math.floor(Math.random() * results.length)];
			this.formData.category = this.aiResult.category;
			this.loadEstimate();
		},
		selectCategory(catId) {
			this.formData.category = catId;
			this.loadEstimate();
		},
		async loadEstimate() {
			const keyMap = { c1: 'book', c2: 'digital', c3: 'daily', c4: 'sports', c5: 'fashion', c6: 'other' };
			const categoryKey = keyMap[this.formData.category];
			if (!categoryKey || this.estimating) return;
			this.estimating = true;
			try {
				this.estimate = await post('/api/price/estimate', {
					category: categoryKey,
					condition: this.condition,
					keyword: this.formData.title || '',
				});
			} catch (e) {
				this.estimate = null;
			} finally {
				this.estimating = false;
			}
		},
		selectCondition(value) {
			this.condition = value;
			this.loadEstimate();
		},
		submitPublish() {
			if (!this.formData.title.trim()) {
				uni.showToast({ title: '请输入标题', icon: 'none' }); return;
			}
			if (!this.formData.desc.trim()) {
				uni.showToast({ title: '请输入描述', icon: 'none' }); return;
			}
			if (this.formData.type !== 'wish' && this.formData.images.length === 0) {
				uni.showToast({ title: '请至少上传一张图片', icon: 'none' }); return;
			}
			if (this.formData.type === 'sell' && (!this.formData.price || Number(this.formData.price) <= 0)) {
				uni.showToast({ title: '请输入有效的价格', icon: 'none' }); return;
			}
			if (this.formData.type === 'sell' && this.priceBlocked) {
				uni.showToast({ title: '价格超出AI估价合理范围，请调整', icon: 'none' }); return;
			}
			if (this.formData.type === 'lease' && (!this.formData.leasePrice || Number(this.formData.leasePrice) <= 0)) {
				uni.showToast({ title: '请输入有效的日租金', icon: 'none' }); return;
			}
			if (!this.formData.campus) {
				uni.showToast({ title: '请选择校区', icon: 'none' }); return;
			}

			this.doSubmit();
		},
		async doSubmit() {
			uni.showLoading({ title: '发布中…', mask: true });
			try {
				const apiUrl = (this.formData.type === 'exchange' || this.formData.type === 'wish')
					? '/api/exchange-posts' : '/api/items';
				await post(apiUrl, {
					title: this.formData.title.trim(),
					description: this.formData.desc.trim(),
					category: this.formData.category,
					price: parseFloat(this.formData.price) || parseFloat(this.formData.leasePrice) || 0,
					type: this.formData.type,
					images: this.formData.images,
					anonymous: this.anonymous,
					anonymousTitle: this.anonymous ? this.anonymousTitle : '',
					campus: this.formData.campus,
					minDays: Number(this.formData.minDays) || 1,
					tags: this.formData.tags,
					wishType: this.formData.wishType,
				});
				uni.hideLoading();
				uni.showToast({ title: '发布成功！', icon: 'success' });
				setTimeout(() => { uni.switchTab({ url: '/pages/home/index' }); }, 800);
			} catch (e) {
				uni.hideLoading();
				uni.showToast({ title: '发布失败，请重试', icon: 'none' });
			}
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.publish-header { display: flex; align-items: center; justify-content: space-between; padding: 16rpx 0 30rpx; }
.back-btn { padding: 8rpx; }
.header-title { font-size: 36rpx; font-weight: bold; color: #333; }
.submit-btn {
	padding: 12rpx 36rpx; background: linear-gradient(135deg, #4F6EF7, #6366F1);
	color: #FFF; border-radius: 30rpx; font-size: 28rpx; font-weight: 500;
	box-shadow: 0 4rpx 16rpx rgba(79, 110, 247, 0.3);
}

.type-section { margin-bottom: 24rpx; }
.section-label { font-size: 28rpx; font-weight: 600; color: #333; display: block; margin-bottom: 16rpx; }
.hint-text { font-size: 24rpx; color: #CCC; font-weight: 400; }
.type-row { display: flex; gap: 14rpx; flex-wrap: wrap; }
.type-card {
	flex: 1; min-width: calc(50% - 14rpx); padding: 20rpx 16rpx;
	background: #FFF; border-radius: 16rpx; border: 2rpx solid transparent;
	position: relative; transition: all 0.2s;
}
.type-card.active { border-color: #4F6EF7; background: #EDF0FE; }
.type-label { font-size: 28rpx; font-weight: 600; color: #333; display: block; margin-bottom: 6rpx; }
.type-desc { font-size: 20rpx; color: #999; line-height: 1.4; display: block; }
.type-check {
	position: absolute; top: 8rpx; right: 8rpx; width: 36rpx; height: 36rpx;
	background: #4F6EF7; border-radius: 50%; display: flex; align-items: center; justify-content: center;
}

.upload-area { display: flex; flex-wrap: wrap; gap: 16rpx; margin-bottom: 16rpx; }
.upload-item { position: relative; width: 160rpx; height: 160rpx; }
.upload-image { width: 100%; height: 100%; border-radius: 12rpx; }
.upload-placeholder {
	width: 100%; height: 100%; background: #F5F5F5; border-radius: 12rpx;
	border: 2rpx dashed #DDD; display: flex; flex-direction: column;
	align-items: center; justify-content: center; gap: 6rpx;
}
.upload-hint { font-size: 20rpx; color: #999; }
.upload-delete {
	position: absolute; top: -8rpx; right: -8rpx; width: 40rpx; height: 40rpx;
	background: #FF4D4F; border-radius: 50%; display: flex; align-items: center; justify-content: center;
}
.upload-add {
	width: 160rpx; height: 160rpx; background: #F5F5F5; border-radius: 12rpx;
	border: 2rpx dashed #DDD; display: flex; flex-direction: column;
	align-items: center; justify-content: center; gap: 6rpx;
}
.upload-add-text { font-size: 22rpx; color: #999; }

.ai-card {
	padding: 20rpx; background: linear-gradient(135deg, #EDF0FE, #F5F8FF);
	border-radius: 14rpx; border: 1px solid #D6E4FF; margin-bottom: 16rpx;
}
.ai-card-header { display: flex; align-items: center; gap: 10rpx; margin-bottom: 14rpx; }
.ai-card-title { font-size: 26rpx; color: #4F6EF7; font-weight: 600; }
.ai-card-body { display: flex; align-items: center; gap: 10rpx; margin-bottom: 12rpx; }
.ai-result-label { font-size: 24rpx; color: #666; }
.ai-result-value { font-size: 28rpx; color: #4F6EF7; font-weight: 600; }
.ai-tags { display: flex; flex-wrap: wrap; gap: 10rpx; }
.ai-tag {
	font-size: 22rpx; color: #4F6EF7; background: rgba(79, 110, 247, 0.1);
	padding: 4rpx 14rpx; border-radius: 6rpx;
}

.category-fix { margin-top: 8rpx; }
.fix-label { font-size: 24rpx; color: #999; display: block; margin-bottom: 12rpx; }
.fix-chips { display: flex; flex-wrap: wrap; gap: 12rpx; }
.fix-chip {
	display: flex; align-items: center; gap: 6rpx; padding: 10rpx 20rpx;
	background: #F5F5F5; border-radius: 30rpx; transition: all 0.2s;
}
.fix-chip.active { background: #4F6EF7; }
.fix-chip-text { font-size: 24rpx; color: #666; }
.fix-chip.active .fix-chip-text { color: #FFF; }

.form-card {
	background: #FFF; border-radius: 20rpx; padding: 24rpx; margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.form-item { padding: 24rpx 0; border-bottom: 1px solid #F5F5F5; }
.form-item-last { border-bottom: none; }
.form-label { font-size: 28rpx; color: #333; font-weight: 500; display: block; margin-bottom: 14rpx; }
.required { color: #FF4D4F; }
.form-input { font-size: 28rpx; color: #333; width: 100%; }
.form-input-row { display: flex; align-items: center; gap: 8rpx; }
.input-prefix { font-size: 32rpx; color: #333; font-weight: bold; }
.input-suffix { font-size: 24rpx; color: #999; }
.form-textarea { font-size: 28rpx; color: #333; width: 100%; min-height: 140rpx; }
.form-picker {
	display: flex; align-items: center; justify-content: space-between;
	height: 80rpx; padding: 0 24rpx; background: #F5F5F5;
	border-radius: 12rpx; font-size: 28rpx; color: #333;
}
.form-picker .placeholder { color: #B0B4C0; }

.wish-type-row { display: flex; gap: 16rpx; }
.wish-type {
	flex: 1; text-align: center; padding: 16rpx 0;
	background: #F5F5F5; border-radius: 12rpx; font-size: 26rpx; color: #666;
}
.wish-type.active { background: #EDF0FE; color: #4F6EF7; font-weight: 600; }

.tag-input-row { display: flex; align-items: center; gap: 12rpx; }
.tag-add-btn {
	padding: 12rpx 28rpx; border-radius: 30rpx;
	background: #EDF0FE; color: #4F6EF7; font-size: 24rpx; font-weight: 500;
	flex-shrink: 0;
}
.tag-list { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 14rpx; }
.tag-chip {
	display: flex; align-items: center; gap: 8rpx;
	padding: 8rpx 18rpx; background: #F5F5F5; border-radius: 30rpx;
	font-size: 22rpx; color: #666;
}
.tag-close { color: #BBB; font-size: 20rpx; }

.anon-row { display: flex; align-items: center; justify-content: space-between; }
.anon-info { display: flex; flex-direction: column; gap: 6rpx; }
.anon-title { font-size: 28rpx; color: #333; font-weight: 500; }
.anon-desc { font-size: 22rpx; color: #999; }

.cond-row { margin-top: 16rpx; }
.cond-label { font-size: 24rpx; color: #999; display: block; margin-bottom: 12rpx; }
.cond-chips { display: flex; flex-wrap: wrap; gap: 12rpx; }
.cond-chip {
	padding: 8rpx 24rpx; border-radius: 30rpx; background: #F5F5F5;
	font-size: 24rpx; color: #666;
}
.cond-chip.active { background: #4F6EF7; color: #FFF; font-weight: 500; }

.estimate-wrap {
	margin-top: 16rpx; padding: 18rpx;
	background: linear-gradient(135deg, #EDF0FE, #F5F8FF);
	border-radius: 14rpx; border: 1px solid #D6E4FF;
}
.estimate-head { display: flex; align-items: center; gap: 10rpx; }
.estimate-label { font-size: 24rpx; color: #4F6EF7; font-weight: 600; }
.estimate-range { margin-left: auto; font-size: 30rpx; font-weight: bold; color: #FF6B3D; }
.estimate-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 12rpx; }
.estimate-avg { font-size: 20rpx; color: #999; }
.estimate-status { font-size: 22rpx; font-weight: 500; }
.estimate-status.ok { color: #22C55E; }
.estimate-status.warn { color: #F59E0B; }
.estimate-status.block { color: #FF4D4F; }

.publish-notice {
	display: flex; align-items: flex-start; gap: 12rpx; padding: 20rpx;
	background: #FFF8E1; border-radius: 12rpx;
}
.notice-text { flex: 1; font-size: 24rpx; color: #999; line-height: 1.6; }
</style>
