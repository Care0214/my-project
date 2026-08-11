<template>
	<view class="page-container--clean edit-profile-page">
		<view class="page-body">
			<!-- 顶部导航栏 -->
			<view class="profile-header">
				<view class="back-btn" @click="goBack">
					<AppIcon name="back" :size="40" color="#333" />
				</view>
				<text class="header-title">编辑资料</text>
				<view class="save-btn" @click="saveProfile"><text>保存</text></view>
			</view>

			<!-- 头像颜色选择 -->
			<view class="card avatar-card">
				<text class="section-label">头像颜色</text>
				<view class="avatar-row">
					<view class="avatar-preview" :style="{ background: form.avatarColor }">
						<text class="avatar-text">{{ initial }}</text>
					</view>
					<view class="color-picker">
						<view
							v-for="(c, i) in avatarColors"
							:key="i"
							:class="['color-swatch', { active: form.avatarColor === c }]"
							:style="{ background: c }"
							@click="form.avatarColor = c"
						>
							<AppIcon v-if="form.avatarColor === c" name="check" :size="28" color="#FFF" />
						</view>
					</view>
				</view>
			</view>

			<!-- 基本资料 -->
			<view class="card form-card">
				<view class="form-item">
					<text class="form-label">昵称</text>
					<input class="form-input" v-model="form.nickname" placeholder="请输入昵称" maxlength="16" />
				</view>
				<view class="form-item">
					<text class="form-label">个人简介</text>
					<textarea class="form-textarea" v-model="form.bio" placeholder="介绍一下自己吧~" maxlength="100" />
				</view>
				<view class="form-item">
					<text class="form-label">学校</text>
					<input class="form-input" v-model="form.school" placeholder="请输入学校名称" maxlength="30" />
				</view>
				<view class="form-item form-item-last">
					<text class="form-label">校区</text>
					<view class="campus-chips">
						<view
							v-for="c in campuses"
							:key="c"
							:class="['campus-chip', { active: form.campus === c }]"
							@click="form.campus = c"
						>
							<text>{{ c }}</text>
						</view>
					</view>
				</view>
			</view>

			<view style="height: 40rpx;"></view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get } from '@/utils/request.js';

const DEFAULT_AVATAR_COLORS = [
	'linear-gradient(135deg, #4F6EF7, #6366F1)',
	'linear-gradient(135deg, #FF6B3D, #FF9F43)',
	'linear-gradient(135deg, #22C55E, #4ADE80)',
	'linear-gradient(135deg, #F59E0B, #FBBF24)',
	'linear-gradient(135deg, #EF4444, #F87171)',
	'linear-gradient(135deg, #8B5CF6, #A78BFA)',
	'linear-gradient(135deg, #EC4899, #F472B6)',
	'linear-gradient(135deg, #06B6D4, #22D3EE)',
];

const DEFAULT_CAMPUSES = ['长清湖校区', '千佛山校区'];

export default {
	components: { AppIcon },
	data() {
		return {
			avatarColors: DEFAULT_AVATAR_COLORS,
			campuses: [...DEFAULT_CAMPUSES],
			form: {
				nickname: '',
				bio: '',
				school: '',
				campus: '',
				avatarColor: DEFAULT_AVATAR_COLORS[0],
			},
		};
	},
	computed: {
		initial() {
			const nickname = this.form.nickname.trim();
			return nickname ? nickname.charAt(0) : '闲';
		},
	},
	onLoad() {
		const info = (this.$store && this.$store.userInfo) || {};
		this.form.nickname = info.nickname || '';
		this.form.bio = info.bio || '';
		this.form.school = info.school || '';
		this.form.campus = info.campus || '';
		this.form.avatarColor = info.avatarColor || DEFAULT_AVATAR_COLORS[0];
		this.loadCampuses();
	},
	methods: {
		async loadCampuses() {
			try {
				const list = await get('/api/campuses', { school: this.form.school });
				if (list && list.length) {
					this.campuses = list.map((c) => c.name);
				} else {
					this.campuses = [...DEFAULT_CAMPUSES];
				}
			} catch (e) {
				this.campuses = [...DEFAULT_CAMPUSES];
			}
		},
		goBack() {
			uni.navigateBack();
		},
		saveProfile() {
			if (!this.form.nickname.trim()) {
				uni.showToast({ title: '请输入昵称', icon: 'none' });
				return;
			}
			if (this.$store && this.$store.updateUserInfo) {
				this.$store.updateUserInfo({
					nickname: this.form.nickname.trim(),
					bio: this.form.bio.trim(),
					school: this.form.school.trim(),
					campus: this.form.campus,
					avatarColor: this.form.avatarColor,
				});
			}
			uni.showToast({ title: '保存成功', icon: 'success' });
			setTimeout(() => {
				uni.navigateBack();
			}, 600);
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.edit-profile-page { background: #F5F5F5; }

.profile-header { display: flex; align-items: center; justify-content: space-between; padding: 16rpx 0 30rpx; }
.back-btn { padding: 8rpx; }
.header-title { font-size: 36rpx; font-weight: bold; color: #333; }
.save-btn {
	padding: 12rpx 36rpx;
	background: linear-gradient(135deg, #4F6EF7, #6366F1);
	color: #FFF; border-radius: 30rpx; font-size: 28rpx; font-weight: 500;
	box-shadow: 0 4rpx 16rpx rgba(79, 110, 247, 0.3);
}
.save-btn:active { transform: scale(0.96); }

.avatar-card { margin-bottom: 24rpx; }
.section-label { font-size: 28rpx; font-weight: 600; color: #333; display: block; margin-bottom: 24rpx; }
.avatar-row { display: flex; align-items: center; gap: 30rpx; }
.avatar-preview {
	width: 120rpx; height: 120rpx; border-radius: 50%; flex-shrink: 0;
	display: flex; align-items: center; justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}
.avatar-text { font-size: 44rpx; font-weight: bold; color: #FFF; }

.color-picker { flex: 1; display: flex; flex-wrap: wrap; gap: 18rpx; }
.color-swatch {
	width: 56rpx; height: 56rpx; border-radius: 50%;
	display: flex; align-items: center; justify-content: center;
	border: 4rpx solid transparent; transition: all 0.2s;
}
.color-swatch.active { border-color: #FFF; box-shadow: 0 0 0 4rpx #4F6EF7; }

.form-card { margin-bottom: 24rpx; }
.form-item { padding: 26rpx 0; border-bottom: 1px solid #F5F5F5; }
.form-item-last { border-bottom: none; padding-bottom: 8rpx; }
.form-label { font-size: 28rpx; color: #333; font-weight: 500; display: block; margin-bottom: 14rpx; }
.form-input { font-size: 28rpx; color: #333; width: 100%; height: 60rpx; }
.form-textarea { font-size: 28rpx; color: #333; width: 100%; min-height: 140rpx; line-height: 1.5; }

.campus-chips { display: flex; flex-wrap: wrap; gap: 16rpx; }
.campus-chip {
	padding: 12rpx 30rpx; border-radius: 32rpx;
	background: #F5F5F5; color: #666; font-size: 26rpx;
	transition: all 0.2s;
}
.campus-chip.active {
	background: #4F6EF7; color: #FFF;
	box-shadow: 0 4rpx 12rpx rgba(79, 110, 247, 0.3);
}
</style>
