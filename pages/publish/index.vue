<template>
	<view class="page-container">
		<view class="page-body">
			<!-- 顶部导航 -->
			<view class="publish-header">
				<text class="header-title">发布</text>
			</view>

			<!-- 类型选择 -->
			<view class="type-row">
				<view
					v-for="t in types"
					:key="t.value"
					:class="['type-item', { active: formData.type === t.value }]"
					@click="formData.type = t.value"
				>
					{{ t.label }}
				</view>
			</view>

			<!-- 表单 -->
			<view class="form-card">
				<view class="form-item">
					<text class="form-label">标题</text>
					<input
						class="form-input"
						placeholder="请输入标题（最多30字）"
						maxlength="30"
					/>
				</view>

				<view class="form-item">
					<text class="form-label">描述</text>
					<textarea
						class="form-textarea"
						placeholder="详细描述你的物品或需求..."
						maxlength="500"
					/>
				</view>

				<view class="form-item">
					<text class="form-label">价格/报酬</text>
					<input class="form-input" placeholder="¥ 输入价格（选填）" />
				</view>

				<view class="form-item form-item-last">
					<text class="form-label">联系方式</text>
					<input class="form-input" placeholder="微信号 / 手机号（选填）" />
				</view>
			</view>
		</view>

		<AppTabBar :current="2" />
	</view>
</template>

<script>
import AppTabBar from '@/components/CustomTabBar.vue';
import AppIcon from '@/components/AppIcon.vue';

export default {
	components: {
		AppTabBar,
		AppIcon,
	},
	data() {
		return {
			formData: {
				type: 'sell',
			},
			types: [
				{ label: '闲置出售', value: 'sell' },
				{ label: '求助', value: 'help' },
				{ label: '租借', value: 'lease' },
			],
		};
	},
	methods: {},
};
</script>

<style scoped>
.publish-header {
	display: flex;
	align-items: center;
	padding: 16rpx 0 30rpx;
}

.header-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.type-row {
	display: flex;
	gap: 16rpx;
	margin-bottom: 30rpx;
}

.type-item {
	padding: 14rpx 32rpx;
	border-radius: 30rpx;
	font-size: 26rpx;
	color: #666;
	background: #FFFFFF;
	transition: all 0.2s;
}

.type-item.active {
	color: #FFFFFF;
	background: #3C7DFF;
}

.form-card {
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 0 30rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.form-item {
	padding: 30rpx 0;
	border-bottom: 1px solid #F5F5F5;
}

.form-item-last {
	border-bottom: none;
}

.form-label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	display: block;
	margin-bottom: 16rpx;
}

.form-input {
	font-size: 28rpx;
	color: #333;
}

.form-textarea {
	font-size: 28rpx;
	color: #333;
	width: 100%;
	min-height: 160rpx;
}
</style>
