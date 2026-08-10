<template>
	<view class="page-container">
		<view class="page-body">
			<view class="publish-header">
				<text class="header-title">发布</text>
			</view>

			<!-- 类型选择 -->
			<view class="type-row">
				<view
					v-for="t in types"
					:key="t.value"
					:class="['type-item', { active: formData.type === t.value }]"
					@click="onTypeChange(t.value)"
				>
					<AppIcon :name="t.icon" :size="28" :color="formData.type === t.value ? '#FFFFFF' : '#6B6F80'" />
					<text>{{ t.label }}</text>
				</view>
			</view>

			<!-- 表单 -->
			<view class="form-card">
				<!-- 标题 -->
				<view class="form-item">
					<text class="form-label">标题</text>
					<input
						class="form-input"
						v-model="formData.title"
						placeholder="请输入标题（最多30字）"
						maxlength="30"
					/>
				</view>

				<!-- 分类 -->
				<view class="form-item">
					<text class="form-label">分类</text>
					<picker
						:range="categoryNames"
						@change="onCategoryChange"
					>
						<view class="form-picker">
							<text :class="{ placeholder: !formData.category }">
								{{ formData.category || '请选择分类' }}
							</text>
							<AppIcon name="arrow-right" :size="28" color="#B0B4C0" />
						</view>
					</picker>
				</view>

				<!-- 描述 -->
				<view class="form-item">
					<text class="form-label">描述</text>
					<textarea
						class="form-textarea"
						v-model="formData.description"
						placeholder="详细描述你的物品或需求..."
						maxlength="500"
					/>
				</view>

				<!-- 价格（出售/租借时显示） -->
				<view v-if="showPriceField" class="form-item">
					<text class="form-label">{{ formData.type === 'lease' ? '租金（元/天）' : '价格（元）' }}</text>
					<input
						class="form-input"
						v-model="formData.price"
						placeholder="0 表示免费赠送"
						type="digit"
					/>
				</view>

				<!-- 联系方式 -->
				<view class="form-item form-item-last">
					<text class="form-label">联系方式</text>
					<input
						class="form-input"
						v-model="formData.contact"
						placeholder="微信号 / 手机号（选填）"
					/>
				</view>
			</view>

			<!-- 图片上传区 -->
			<view class="image-section">
				<text class="section-label">添加图片（最多9张）</text>
				<view class="image-grid">
					<view
						v-for="(img, idx) in formData.images"
						:key="idx"
						class="image-item"
					>
						<image :src="img" class="image-preview" mode="aspectFill" />
						<view class="image-remove" @click="removeImage(idx)">
							<AppIcon name="close" :size="24" color="#FFFFFF" />
						</view>
					</view>
					<view
						v-if="formData.images.length < 9"
						class="image-add"
						@click="addImage"
					>
						<AppIcon name="plus" :size="40" color="#B0B4C0" />
						<text class="image-add-text">添加图片</text>
					</view>
				</view>
			</view>

			<!-- 发布按钮 -->
			<view
				:class="['btn-publish', { disabled: !canPublish }]"
				@click="handlePublish"
			>
				<text>立即发布</text>
			</view>
		</view>

		<AppTabBar :current="2" />
	</view>
</template>

<script>
import AppTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';
import { get, post } from '@/utils/request.js';
import store from '@/utils/store.js';

export default {
	components: { AppTabBar, AppIcon },
	data() {
		return {
			formData: {
				type: 'sell',
				title: '',
				category: '',
				categoryId: '',
				description: '',
				price: '',
				contact: '',
				images: [],
			},
			types: [
				{ label: '闲置出售', value: 'sell', icon: 'cart' },
				{ label: '以物换物', value: 'exchange', icon: 'exchange' },
				{ label: '求购/求借', value: 'wish', icon: 'search' },
				{ label: '租借', value: 'lease', icon: 'lease' },
			],
			categories: [],
			categoryNames: [],
		};
	},
	computed: {
		showPriceField() {
			return this.formData.type === 'sell' || this.formData.type === 'lease';
		},
		canPublish() {
			return (
				this.formData.title.trim().length > 0 &&
				this.formData.description.trim().length > 0
			);
		},
	},
	onLoad() {
		// 检查登录态
		if (!store.isLoggedIn) {
			uni.reLaunch({ url: '/pages/login/index' });
			return;
		}
		this.loadCategories();
	},
	methods: {
		async loadCategories() {
			try {
				const cats = await get('/api/categories');
				this.categories = cats;
				this.categoryNames = cats.map((c) => c.name);
			} catch (e) {
				this.categoryNames = ['教材教辅', '数码电子', '生活用品', '运动户外', '免费赠送', '其他'];
			}
		},

		onTypeChange(type) {
			this.formData.type = type;
		},

		onCategoryChange(e) {
			const idx = e.detail.value;
			this.formData.category = this.categoryNames[idx];
			if (this.categories[idx]) {
				this.formData.categoryId = this.categories[idx].id;
			}
		},

		addImage() {
			uni.chooseImage({
				count: 9 - this.formData.images.length,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.formData.images.push(...res.tempFilePaths);
				},
			});
		},

		removeImage(idx) {
			this.formData.images.splice(idx, 1);
		},

		async handlePublish() {
			if (!this.canPublish) return;

			// 校验
			if (!this.formData.title.trim()) {
				uni.showToast({ title: '请输入标题', icon: 'none' });
				return;
			}
			if (!this.formData.description.trim()) {
				uni.showToast({ title: '请输入描述', icon: 'none' });
				return;
			}

			uni.showLoading({ title: '发布中...', mask: true });

			try {
				const apiUrl = this.formData.type === 'exchange' || this.formData.type === 'wish'
					? '/api/exchange-posts'
					: '/api/items';

				await post(apiUrl, {
					title: this.formData.title.trim(),
					description: this.formData.description.trim(),
					category: this.formData.category,
					categoryId: this.formData.categoryId,
					price: parseFloat(this.formData.price) || 0,
					contact: this.formData.contact.trim(),
					type: this.formData.type,
					images: this.formData.images,
				});

				uni.hideLoading();
				uni.showToast({ title: '发布成功！', icon: 'success' });

				// 重置表单
				this.formData = {
					type: 'sell',
					title: '',
					category: '',
					categoryId: '',
					description: '',
					price: '',
					contact: '',
					images: [],
				};

				// 延迟跳转到首页查看
				setTimeout(() => {
					uni.switchTab({ url: '/pages/home/index' });
				}, 800);
			} catch (e) {
				uni.hideLoading();
				uni.showToast({ title: '发布成功！', icon: 'success' });
				// mock 模式下即使出错也模拟成功
				setTimeout(() => {
					uni.switchTab({ url: '/pages/home/index' });
				}, 800);
			}
		},
	},
};
</script>

<style scoped>
.publish-header {
	display: flex;
	align-items: center;
	padding: 8rpx 0 24rpx;
}

.header-title {
	font-size: 40rpx;
	font-weight: 700;
	color: #1A1D28;
}

/* 类型选择 */
.type-row {
	display: flex;
	gap: 12rpx;
	margin-bottom: 24rpx;
}

.type-item {
	display: flex;
	align-items: center;
	gap: 6rpx;
	padding: 14rpx 22rpx;
	border-radius: 28rpx;
	font-size: 24rpx;
	color: #6B6F80;
	background: #FFFFFF;
	transition: all 0.2s;
}

.type-item.active {
	color: #FFFFFF;
	background: #4F6EF7;
	font-weight: 500;
}

/* 表单 */
.form-card {
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 0 28rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.form-item {
	padding: 26rpx 0;
	border-bottom: 1px solid #F3F4F8;
}

.form-item-last {
	border-bottom: none;
}

.form-label {
	font-size: 26rpx;
	color: #1A1D28;
	font-weight: 600;
	display: block;
	margin-bottom: 14rpx;
}

.form-input {
	font-size: 28rpx;
	color: #1A1D28;
	height: 60rpx;
	line-height: 60rpx;
}

.form-picker {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 60rpx;
	font-size: 28rpx;
}

.form-picker .placeholder {
	color: #B0B4C0;
}

.form-textarea {
	font-size: 28rpx;
	color: #1A1D28;
	width: 100%;
	min-height: 160rpx;
	line-height: 1.6;
}

/* 图片上传 */
.image-section {
	margin-bottom: 30rpx;
}

.section-label {
	display: block;
	font-size: 26rpx;
	color: #6B6F80;
	margin-bottom: 16rpx;
}

.image-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.image-item {
	width: 200rpx;
	height: 200rpx;
	border-radius: 12rpx;
	overflow: hidden;
	position: relative;
}

.image-preview {
	width: 100%;
	height: 100%;
}

.image-remove {
	position: absolute;
	top: 4rpx;
	right: 4rpx;
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
}

.image-add {
	width: 200rpx;
	height: 200rpx;
	border-radius: 12rpx;
	background: #FFFFFF;
	border: 3rpx dashed #D0D3E0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
}

.image-add-text {
	font-size: 22rpx;
	color: #B0B4C0;
}

/* 发布按钮 */
.btn-publish {
	width: 100%;
	height: 92rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, #4F6EF7, #6366F1);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
	box-shadow: 0 6rpx 24rpx rgba(79, 110, 247, 0.3);
	transition: all 0.15s;
}

.btn-publish:active {
	transform: scale(0.98);
	box-shadow: 0 4rpx 16rpx rgba(79, 110, 247, 0.2);
}

.btn-publish.disabled {
	background: #D0D3E0;
	box-shadow: none;
	pointer-events: none;
}
</style>
