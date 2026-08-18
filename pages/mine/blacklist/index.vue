<template>
	<view class="page-container--clean">
		<view class="page-body">
			<view class="list-header">
				<text class="header-title-sm">黑名单</text>
				<text class="header-desc">被你屏蔽的用户将无法与你互动</text>
			</view>

			<view v-if="list.length > 0">
				<view class="card" v-for="item in list" :key="item.id">
					<view class="block-row">
						<view class="block-avatar">
							<text>{{ item.nickname.charAt(0) }}</text>
						</view>
						<view class="block-info">
							<text class="block-name">{{ item.nickname }}</text>
							<text class="block-reason">{{ item.reason }}</text>
							<text class="block-time">{{ formatTime(item.blockTime) }}</text>
						</view>
						<view class="block-remove" @click="removeBlock(item)">
							<text>移除</text>
						</view>
					</view>
				</view>
			</view>

			<view v-else class="empty-state">
				<AppIcon name="shield" :size="80" color="#8B8FA3" />
				<text>黑名单为空</text>
				<text class="mt-8" style="font-size:24rpx;color:#8B8FA3;">还没有屏蔽任何用户</text>
			</view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get, del } from '@/utils/request.js';

export default {
	components: { AppIcon },
	data() { return { list: [] }; },
	onShow() { this.loadList(); },
	methods: {
		async loadList() {
			try { this.list = await get('/api/blacklist'); } catch (e) { this.list = []; }
		},
		formatTime(ts) { return new Date(ts).toLocaleDateString('zh-CN'); },
		removeBlock(item) {
			var that = this;
			uni.showModal({
				title: '确认移除',
				content: '确定将「' + item.nickname + '」从黑名单中移除吗？',
				success: function(res) {
					if (res.confirm) {
						del('/api/blacklist/' + item.id).then(function() {
							that.list = that.list.filter(function(b) { return b.id !== item.id; });
							uni.showToast({ title: '已移除', icon: 'success' });
						}).catch(function() {
							that.list = that.list.filter(function(b) { return b.id !== item.id; });
							uni.showToast({ title: '已移除', icon: 'success' });
						});
					}
				},
			});
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.list-header { margin-bottom: 24rpx; }
.header-title-sm { font-size: 36rpx; font-weight: bold; color: #1A1D28; display: block; }
.header-desc { font-size: 24rpx; color: #6B6F80; margin-top: 8rpx; display: block; }

.block-row { display: flex; align-items: center; gap: 16rpx; }
.block-avatar {
	width: 72rpx; height: 72rpx; border-radius: 50%; flex-shrink: 0;
	background: linear-gradient(135deg, #8FA1F8, #6B82F5);
	display: flex; align-items: center; justify-content: center;
	font-size: 32rpx; font-weight: bold; color: #FFF;
}
.block-info { flex: 1; }
.block-name { font-size: 28rpx; font-weight: 600; color: #1A1D28; display: block; }
.block-reason { font-size: 24rpx; color: #6B6F80; display: block; margin-top: 4rpx; }
.block-time { font-size: 22rpx; color: #8B8FA3; margin-top: 4rpx; }
.block-remove { padding: 12rpx 28rpx; border-radius: 30rpx; border: 1px solid #FF4D4F; }
.block-remove text { font-size: 24rpx; color: #FF4D4F; }
</style>
