<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 头像 -->
			<view class="edit-card">
				<view class="edit-row" @click="changeAvatar">
					<text class="edit-label">头像</text>
					<view class="edit-avatar">
						<view
							class="avatar-preview"
							:style="{ background: avatarBg }"
						>
							<image
								v-if="avatarPath"
								:src="avatarPath"
								class="avatar-img"
								mode="aspectFill"
							/>
							<text v-else class="avatar-initial">{{ initial }}</text>
						</view>
						<AppIcon name="arrow-right" :size="28" color="#D0D3E0" />
					</view>
				</view>
			</view>

			<!-- 基本信息 -->
			<view class="edit-card">
				<view class="edit-row">
					<text class="edit-label">昵称</text>
					<input
						class="edit-input"
						v-model="form.nickname"
						placeholder="输入昵称"
						maxlength="12"
					/>
				</view>
				<view class="edit-row">
					<text class="edit-label">个性签名</text>
					<input
						class="edit-input"
						v-model="form.bio"
						placeholder="说点什么吧..."
						maxlength="30"
					/>
				</view>
				<view class="edit-row edit-row-last">
					<text class="edit-label">学校</text>
					<text class="edit-value">{{ form.school || 'XX大学' }}</text>
				</view>
			</view>

			<!-- 保存按钮 -->
			<view class="btn-save" @click="handleSave">
				<text>保存修改</text>
			</view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import store from '@/utils/store.js';

export default {
	components: { AppIcon },
	data() {
		const user = (store.userInfo) || {};
		return {
			form: {
				nickname: user.nickname || '',
				bio: user.bio || '',
				school: user.school || 'XX大学',
			},
			avatarPath: user.avatar || '',
		};
	},
	computed: {
		initial() {
			return this.form.nickname ? this.form.nickname.charAt(0) : '?';
		},
		avatarBg() {
			if (this.avatarPath) return 'transparent';
			return 'linear-gradient(135deg, #4F6EF7, #6366F1)';
		},
	},
	methods: {
		changeAvatar() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.avatarPath = res.tempFilePaths[0];
				},
			});
		},
		handleSave() {
			if (!this.form.nickname.trim()) {
				uni.showToast({ title: '昵称不能为空', icon: 'none' });
				return;
			}

			uni.showLoading({ title: '保存中...', mask: true });

			// 更新 store
			store.updateUserInfo({
				nickname: this.form.nickname.trim(),
				bio: this.form.bio.trim(),
				school: this.form.school,
				avatar: this.avatarPath,
			});

			setTimeout(() => {
				uni.hideLoading();
				uni.showToast({ title: '保存成功', icon: 'success' });
				// 延迟返回上一页
				setTimeout(() => { uni.navigateBack(); }, 600);
			}, 400);
		},
	},
};
</script>

<style scoped>
.edit-card {
	background: #FFFFFF;
	border-radius: 20rpx;
	margin-bottom: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.edit-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 28rpx;
	min-height: 88rpx;
}

.edit-row + .edit-row {
	border-top: 1px solid #F3F4F8;
}

.edit-row-last {
	border-top: 1px solid #F3F4F8;
}

.edit-label {
	font-size: 28rpx;
	color: #1A1D28;
	font-weight: 500;
	flex-shrink: 0;
	margin-right: 24rpx;
}

.edit-input {
	flex: 1;
	text-align: right;
	font-size: 28rpx;
	color: #1A1D28;
}

.edit-value {
	font-size: 26rpx;
	color: #B0B4C0;
}

.edit-avatar {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.avatar-preview {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.avatar-img {
	width: 100%;
	height: 100%;
}

.avatar-initial {
	font-size: 40rpx;
	font-weight: 700;
	color: #FFFFFF;
}

.btn-save {
	width: 100%;
	height: 92rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, #4F6EF7, #6366F1);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-top: 40rpx;
	box-shadow: 0 6rpx 24rpx rgba(79, 110, 247, 0.3);
}

.btn-save:active {
	transform: scale(0.98);
}
</style>
