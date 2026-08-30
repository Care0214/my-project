<template>
	<view class="login-page">
		<!-- 顶部渐变背景区 -->
		<view class="login-hero">
			<view class="hero-content">
				<!-- 校徽/Logo 区域 -->
				<view class="logo-wrap">
					<view class="logo-icon">
						<image class="logo-icon-img" src="/static/logo/login-logo.png" mode="aspectFit" />
					</view>
					<text class="logo-text">拾闲小栈</text>
					<text class="logo-sub">校园闲置物品智能交换</text>
				</view>

				<!-- 步骤指示器 -->
				<view class="steps-dots">
					<view
						v-for="i in 3"
						:key="i"
						:class="['dot', { active: currentStep >= i, done: currentStep > i }]"
					>
						<text v-if="currentStep > i" class="dot-check">✓</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部白色卡片区 -->
		<view class="login-card-wrap">
			<view class="login-card">

				<!-- Step 1: 微信授权 -->
				<view v-if="currentStep === 1" class="step-content">
					<text class="step-title">欢迎来到拾闲小栈</text>
					<text class="step-desc">
						仅限本校学生使用，保障交易安全可靠
					</text>

					<!-- 模拟微信授权按钮 -->
					<view class="wechat-btn" @click="handleWechatAuth">
						<view class="wechat-btn__icon">
							<image class="wechat-logo-img" src="/static/logo/login-wechat.png" mode="aspectFit" />
						</view>
						<text class="wechat-btn__text">微信授权登录</text>
					</view>

					<text class="agreement-text">
						登录即表示同意
						<text class="agreement-link">《用户协议》</text>
						和
						<text class="agreement-link">《隐私政策》</text>
					</text>
				</view>

				<!-- Step 2: 学校选择 + 学号验证 -->
				<view v-if="currentStep === 2" class="step-content">
					<text class="step-title">验证你的学生身份</text>
					<text class="step-desc">请选择学校并输入学号完成验证</text>

					<!-- 学校选择 -->
					<view class="verify-form">
						<view class="form-group">
							<text class="form-label">学校</text>
							<picker
								:range="schoolNames"
								@change="onSchoolChange"
							>
								<view class="form-picker">
									<text :class="{ placeholder: !selectedSchool }">
										{{ selectedSchool || '请选择你的学校' }}
									</text>
									<AppIcon name="arrow-right" :size="44" color="#6B6F80" />
								</view>
							</picker>
						</view>

						<!-- 校区选择 -->
						<view class="form-group">
							<text class="form-label">校区</text>
							<picker
								:range="campusNames"
								@change="onCampusChange"
								:disabled="!selectedSchool"
							>
								<view class="form-picker">
									<text :class="{ placeholder: !selectedCampus }">
										{{ selectedCampus || '请选择你的校区' }}
									</text>
									<AppIcon name="arrow-right" :size="44" color="#6B6F80" />
								</view>
							</picker>
						</view>

						<!-- 学号输入 -->
						<view class="form-group">
							<text class="form-label">学号</text>
							<view :class="['form-input-wrap', { focused: studentIdFocus }]">
								<input
									class="form-input form-input-inline"
									v-model="studentId"
									placeholder="请输入你的学号"
									maxlength="20"
									@focus="studentIdFocus = true"
									@blur="studentIdFocus = false"
									@confirm="handleVerify"
								/>
								<view v-if="studentId" class="form-input-clear" @click="clearStudentId">
									<AppIcon name="close" :size="40" color="#9AA3B5" />
								</view>
							</view>
						</view>

						<!-- 验证状态 -->
						<view v-if="verifyStatus === 'loading'" class="verify-status">
							<view class="verify-loading"></view>
							<text class="verify-text">正在验证...</text>
						</view>
						<view v-if="verifyStatus === 'success'" class="verify-status verify-success">
							<AppIcon name="verify" :size="44" color="#22C55E" />
							<text class="verify-text success">验证通过 ✓</text>
						</view>
						<view v-if="verifyStatus === 'fail'" class="verify-status verify-fail">
							<AppIcon name="close" :size="56" color="#EF4444" />
							<text class="verify-text fail">验证失败，请检查学号后重试</text>
						</view>

						<!-- 验证按钮 -->
						<view
							:class="['btn-verify', { disabled: !canVerify || verifyStatus === 'loading' }]"
							@click="handleVerify"
						>
							<text>{{ verifyStatus === 'loading' ? '验证中...' : '开始验证' }}</text>
						</view>
					</view>
				</view>

				<!-- Step 3: 信息补全 -->
				<view v-if="currentStep === 3" class="step-content">
					<text class="step-title">完善你的信息</text>
					<text class="step-desc">设置头像和昵称，让同学们认识你</text>

					<view class="profile-form">
						<!-- 头像选择 -->
						<view class="avatar-picker" @click="handleChooseAvatar">
							<view
								class="avatar-preview"
								:style="avatarBgStyle"
							>
								<image
									v-if="avatarPath"
									:src="avatarPath"
									class="avatar-image"
									mode="aspectFill"
								/>
								<AppIcon v-else name="user" :size="44" color="#6B6F80" />
							</view>
							<view class="avatar-edit-badge">
								<AppIcon name="edit" :size="44" color="#FFFFFF" />
							</view>
							<text class="avatar-hint">点击设置头像</text>
						</view>

						<!-- 昵称输入 -->
						<view class="form-group">
							<text class="form-label">昵称</text>
							<input
								class="form-input"
								v-model="nickname"
								placeholder="给自己取个名字吧"
								maxlength="12"
							/>
						</view>

						<!-- 完成按钮 -->
						<view
							:class="['btn-verify', { disabled: !canComplete }]"
							@click="handleComplete"
						>
							<text>完成，开始使用</text>
						</view>
					</view>
				</view>

			</view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import store from '@/utils/store.js';
import { get, post, USE_MOCK } from '@/utils/request.js';

export default {
	components: { AppIcon },
	data() {
		return {
			currentStep: 1,

			// Step 2
			schools: [],
			schoolNames: [],
			selectedSchool: '',
			campusNames: [],
			selectedCampus: '',
			studentId: '',
			studentIdFocus: false,
			verifyStatus: '', // '' | 'loading' | 'success' | 'fail'

			// Step 3
			nickname: '',
			avatarPath: '',
			avatarColor: '#4F91C5',
			wechatToken: '',
		};
	},
	computed: {
		canVerify() {
			return this.selectedSchool && this.selectedCampus && this.studentId.trim().length >= 6;
		},
		canComplete() {
			return this.nickname.trim().length > 0;
		},
		avatarBgStyle() {
			if (this.avatarPath) return '';
			return { background: `linear-gradient(135deg, ${this.avatarColor}, ${this.avatarColor}CC)` };
		},
	},
	onLoad() {
		// 如果已登录，直接跳转首页
		if (store.isLoggedIn) {
			uni.switchTab({ url: '/pages/home/index' });
		}

		// 加载学校列表
		this.loadSchools();
	},
	methods: {
		async loadSchools() {
			try {
				const schools = await get('/api/schools');
				this.schools = schools;
				this.schoolNames = schools.map((s) => s.name);
			} catch (e) {
				this.schoolNames = ['山东师范大学', '山东大学', '山东理工大学', '山东财经大学'];
			}
		},

		// Step 1: 微信授权
		async handleWechatAuth() {
			uni.showLoading({ title: '授权中...', mask: true });
			try {
				if (USE_MOCK) {
					await new Promise((resolve) => setTimeout(resolve, 800));
				} else {
					const loginResult = await new Promise((resolve, reject) => {
						uni.login({
							provider: 'weixin',
							success: resolve,
							fail: reject,
						});
					});
					const data = await post('/api/user/wechat-login', { code: loginResult.code });
					this.wechatToken = data && data.token ? data.token : '';
					if (!this.wechatToken) throw new Error('登录接口未返回 token');
				}
				this.currentStep = 2;
			} catch (e) {
				uni.showToast({ title: '微信授权失败，请重试', icon: 'none' });
			} finally {
				uni.hideLoading();
			}
		},

		// Step 2: 学校选择
		onSchoolChange(e) {
			const idx = e.detail.value;
			this.selectedSchool = this.schoolNames[idx];
			const school = this.schools.find((s) => s.name === this.selectedSchool);
			this.campusNames = (school && school.campuses) || [];
			this.selectedCampus = '';
		},

		// Step 2: 校区选择
		onCampusChange(e) {
			this.selectedCampus = this.campusNames[e.detail.value];
		},

		// 清空学号
		clearStudentId() {
			this.studentId = '';
		},

		// Step 2: 学号验证
		async handleVerify() {
			if (!this.canVerify || this.verifyStatus === 'loading') return;

			this.verifyStatus = 'loading';

			try {
				await post('/api/user/verify-student', {
					school: this.selectedSchool,
					campus: this.selectedCampus,
					studentId: this.studentId.trim(),
				});

				// 模拟验证成功延迟，让用户看到 loading 动画
				setTimeout(() => {
					this.verifyStatus = 'success';

					// 验证成功后自动进入下一步
					setTimeout(() => {
						this.currentStep = 3;
						this.verifyStatus = '';
					}, 1000);
				}, 1200);
			} catch (e) {
				this.verifyStatus = 'fail';
			}
		},

		// Step 3: 选择头像
		handleChooseAvatar() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.avatarPath = res.tempFilePaths[0];
				},
			});
		},

		// Step 3: 完成注册
		async handleComplete() {
			if (!this.canComplete) return;

			uni.showLoading({ title: '正在进入...', mask: true });

			try {
				// 模拟登录接口
				const data = await post('/api/user/complete-profile', {
					nickname: this.nickname.trim(),
					avatar: this.avatarPath,
					school: this.selectedSchool,
					campus: this.selectedCampus,
					studentId: this.studentId.trim(),
				});

				const token = data && data.token ? data.token : this.wechatToken;
				if (!token) throw new Error('登录接口未返回 token');

				// 写入全局 store
				store.login(token, data.userInfo);

				uni.hideLoading();

				// 跳转首页
				uni.switchTab({ url: '/pages/home/index' });
			} catch (e) {
				uni.hideLoading();
				if (USE_MOCK) {
					store.login('mock_token_' + Date.now(), {
						id: 'u_self',
						nickname: this.nickname.trim(),
						avatar: this.avatarPath || '',
						school: this.selectedSchool,
						campus: this.selectedCampus,
						studentId: this.studentId.trim(),
						stats: { posts: 0, exchanges: 0, rentals: 0 },
					});
					uni.switchTab({ url: '/pages/home/index' });
				} else {
					uni.showToast({ title: '注册失败，请重试', icon: 'none' });
				}
			}
		},
	},
};
</script>

<style scoped>
.login-page {
	min-height: 100vh;
	background: #F2F3F8;
	display: flex;
	flex-direction: column;
}

/* ========== 顶部 Hero ========== */
.login-hero {
	background: linear-gradient(160deg, #4F91C5 0%, #77C9F1 45%, #77C9F1 100%);
	padding: 60rpx 40rpx 80rpx;
	position: relative;
	overflow: hidden;
}

/* 背景装饰圆 */
.login-hero::before {
	content: '';
	position: absolute;
	top: -120rpx;
	right: -80rpx;
	width: 400rpx;
	height: 400rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.06);
}

.login-hero::after {
	content: '';
	position: absolute;
	bottom: -60rpx;
	left: -60rpx;
	width: 240rpx;
	height: 240rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.04);
}

.hero-content {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
}

/* Logo */
.logo-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 60rpx;
}

.logo-icon {
	width: 168rpx;
	height: 168rpx;
	border-radius: 36rpx;
	background: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 24rpx;
	padding: 24rpx;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.15);
}
.logo-icon-img { width: 100%; height: 100%; }

.logo-text {
	font-size: 48rpx;
	font-weight: 700;
	color: #FFFFFF;
	letter-spacing: 4rpx;
}

.logo-sub {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.7);
	margin-top: 12rpx;
	letter-spacing: 2rpx;
}

/* 步骤指示器（统一圆点：进行中高亮，已完成绿色打勾） */
.steps-dots {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.dot {
	width: 24rpx;
	height: 24rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.35);
	transition: all 0.3s;
	display: flex;
	align-items: center;
	justify-content: center;
}

.dot.active {
	background: rgba(255, 255, 255, 0.95);
}

.dot.done {
	background: #22C55E;
}

.dot-check {
	font-size: 20rpx;
	color: #FFFFFF;
	font-weight: 700;
}

/* ========== 底部卡片 ========== */
.login-card-wrap {
	flex: 1;
	margin-top: -40rpx;
	padding: 0 30rpx;
	position: relative;
	z-index: 2;
}

.login-card {
	background: #FFFFFF;
	border-radius: 28rpx;
	padding: 50rpx 36rpx;
	box-shadow: 0 8rpx 40rpx rgba(119, 201, 241, 0.12);
	min-height: 500rpx;
}

/* ========== Step 内容通用 ========== */
.step-content {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.step-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #1A1D28;
	margin-bottom: 12rpx;
	text-align: center;
}

.step-desc {
	font-size: 28rpx;
	color: #8B8FA3;
	margin-bottom: 44rpx;
	text-align: center;
	line-height: 1.5;
}

/* ========== Step 1: 微信登录 ========== */
.wechat-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100rpx;
	background: #07C160;
	border-radius: 9999rpx;
	margin-bottom: 32rpx;
	transition: all 0.15s;
	gap: 16rpx;
}

.wechat-btn:active {
	background: #06AD56;
	transform: scale(0.98);
}

.wechat-btn__icon {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
}
.wechat-logo-img { width: 48rpx; height: 48rpx; }

.wechat-btn__text {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.agreement-text {
	font-size: 26rpx;
	color: #6B6F80;
	text-align: center;
	line-height: 1.6;
}

.agreement-link {
	color: #4F91C5;
}

/* ========== Step 2: 验证 ========== */
.verify-form {
	width: 100%;
}

.form-group {
	margin-bottom: 28rpx;
}

.form-label {
	display: block;
	font-size: 26rpx;
	font-weight: 600;
	color: #1A1D28;
	margin-bottom: 12rpx;
}

.form-input {
	width: 100%;
	height: 88rpx;
	padding: 0 24rpx;
	border-radius: 16rpx;
	background: #F2F3F8;
	font-size: 28rpx;
	color: #1A1D28;
}

.form-input-wrap {
	display: flex;
	align-items: center;
	height: 88rpx;
	padding: 0 20rpx;
	border-radius: 16rpx;
	background: #F2F3F8;
	border: 2rpx solid transparent;
	transition: all 0.2s;
}

.form-input-wrap.focused {
	border-color: #4F91C5;
	background: #FFFFFF;
}

.form-input-inline {
	flex: 1;
	width: auto;
	height: 100%;
	padding: 0 8rpx;
	background: transparent;
}

.form-input-clear {
	width: 44rpx;
	height: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.form-picker {
	width: 100%;
	height: 88rpx;
	padding: 0 24rpx;
	border-radius: 16rpx;
	background: #F2F3F8;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 28rpx;
	color: #1A1D28;
}

.form-picker .placeholder {
	color: #6B6F80;
}

/* 验证状态 */
.verify-status {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	margin-bottom: 20rpx;
	padding: 16rpx;
	border-radius: 16rpx;
	background: #F2F3F8;
}

.verify-loading {
	width: 32rpx;
	height: 32rpx;
	border: 4rpx solid #E8EAF0;
	border-top-color: #4F91C5;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.verify-text {
	font-size: 28rpx;
	color: #6B6F80;
}

.verify-text.success {
	color: #22C55E;
	font-weight: 500;
}

.verify-text.fail {
	color: #EF4444;
	font-weight: 500;
}

.verify-success {
	background: #F0FAF0;
}

.verify-fail {
	background: #FFF5F5;
}

.btn-verify {
	width: 100%;
	height: 88rpx;
	border-radius: 9999rpx;
	background: linear-gradient(135deg, #4F91C5, #77C9F1);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	font-weight: 600;
	color: #FFFFFF;
	transition: all 0.15s;
}

.btn-verify:active {
	background: #3A7AA3;
	transform: scale(0.98);
}

.btn-verify.disabled {
	background: #D0D3E0;
	color: #FFFFFF;
	pointer-events: none;
}

/* ========== Step 3: 信息补全 ========== */
.profile-form {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.avatar-picker {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 36rpx;
	position: relative;
}

.avatar-preview {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	background: #F2F3F8;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 16rpx;
	overflow: hidden;
}

.avatar-image {
	width: 100%;
	height: 100%;
}

.avatar-edit-badge {
	position: absolute;
	bottom: 40rpx;
	right: -6rpx;
	width: 44rpx;
	height: 44rpx;
	border-radius: 50%;
	background: #4F91C5;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 3rpx solid #FFFFFF;
}

.avatar-hint {
	font-size: 28rpx;
	color: #6B6F80;
	margin-top: 8rpx;
}
</style>
