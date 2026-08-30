<template>
	<view class="page-container--clean">
		<view class="page-body">
			<!-- 信用分总览卡片 -->
			<view class="credit-hero">
				<view class="hero-top">
					<view>
						<text class="hero-label">我的信用分</text>
						<text class="hero-desc">信用是校园交易的通行证</text>
					</view>
					<view class="hero-score-wrap">
						<text class="hero-score">{{ totalScore }}</text>
						<text class="hero-score-unit">分</text>
					</view>
				</view>
				<view class="hero-level-row">
					<view :class="['level-badge', levelClass]">{{ levelName }}</view>
					<text class="hero-tip">距{{ nextLevelName }}还差 {{ nextLevelGap }} 分</text>
				</view>
				<view class="progress-track">
					<view class="progress-bar" :style="{ width: progressPercent + '%' }"></view>
				</view>
			</view>

			<!-- 信用说明 -->
			<view class="card credit-tip">
				<view class="tip-row">
					<AppIcon name="shield" :size="44" color="#77C9F1" />
					<text class="tip-text">信用分根据交易评价、履约记录、认证信息等综合计算，良好的信用能获得更多展示机会。</text>
				</view>
			</view>

			<!-- 提升小贴士 -->
			<view class="card">
				<text class="section-title">如何提升信用分</text>
				<view class="tip-item">
					<text class="tip-dot">1</text>
					<text class="tip-item-text">完成一笔交易并互相好评 +5</text>
				</view>
				<view class="tip-item">
					<text class="tip-dot">2</text>
					<text class="tip-item-text">按时归还租借物品 +3</text>
				</view>
				<view class="tip-item">
					<text class="tip-dot">3</text>
					<text class="tip-item-text">完善学生认证和资料 +10</text>
				</view>
			</view>

			<!-- 信用记录 -->
			<view class="card history-card">
				<text class="section-title">信用记录</text>
				<view v-if="history.length > 0" class="history-list">
					<view v-for="h in history" :key="h.id" class="history-item">
						<view class="history-icon">
							<AppIcon :name="h.type === 'init' ? 'gift' : 'check'" :size="44" color="#22C55E" />
						</view>
						<view class="history-info">
							<text class="history-title">{{ h.title }}</text>
							<text class="history-desc">{{ h.desc }}</text>
							<text class="history-time">{{ formatTime(h.time) }}</text>
						</view>
						<text class="history-score">+{{ h.score }}</text>
					</view>
				</view>
				<view v-else class="empty-state">
					<AppIcon name="shield" :size="44" color="#8B8FA3" />
					<text>暂无信用记录</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get } from '@/utils/request.js';

const LEVELS = [
	{ min: 0,  name: '信用待提升', next: 60, className: 'level-warn' },
	{ min: 60, name: '信用良好',   next: 80, className: 'level-good' },
	{ min: 80, name: '信用优秀',   next: 90, className: 'level-great' },
	{ min: 90, name: '信用极佳',   next: null, className: 'level-max' },
];

export default {
	components: { AppIcon },
	data() {
		return {
			history: [],
		};
	},
	computed: {
		totalScore() {
			return this.history.reduce((sum, h) => sum + (h.score || 0), 0);
		},
		currentLevel() {
			const total = this.totalScore;
			return LEVELS.filter((l) => total >= l.min).pop() || LEVELS[0];
		},
		nextLevel() {
			const idx = LEVELS.indexOf(this.currentLevel);
			return LEVELS[idx + 1] || null;
		},
		levelName() {
			return this.currentLevel.name;
		},
		levelClass() {
			return this.currentLevel.className;
		},
		nextLevelName() {
			return this.nextLevel ? this.nextLevel.name : '满分';
		},
		nextLevelGap() {
			return this.nextLevel ? this.nextLevel.min - this.totalScore : 0;
		},
		progressPercent() {
			if (!this.nextLevel) return 100;
			const span = this.nextLevel.min - this.currentLevel.min;
			const done = this.totalScore - this.currentLevel.min;
			return Math.min(100, Math.max(0, Math.round((done / span) * 100)));
		},
	},
	onShow() {
		this.loadHistory();
	},
	methods: {
		async loadHistory() {
			try {
				this.history = await get('/api/credit/history');
			} catch (e) {
				this.history = [];
			}
		},
		formatTime(ts) {
			if (!ts) return '';
			const diff = Date.now() - ts;
			const min = Math.floor(diff / 60000);
			if (min < 1) return '刚刚';
			if (min < 60) return min + '分钟前';
			const hours = Math.floor(min / 60);
			if (hours < 24) return hours + '小时前';
			const days = Math.floor(hours / 24);
			if (days < 30) return days + '天前';
			const d = new Date(ts);
			return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
		},
	},
};
</script>

<style scoped>
@import '@/styles/common.scss';

.credit-hero {
	background: linear-gradient(135deg, #77C9F1 0%, #77C9F1 60%, #77C9F1 100%);
	border-radius: 24rpx;
	padding: 36rpx 32rpx 30rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 8rpx 30rpx rgba(119, 201, 241, 0.25);
}
.hero-top { display: flex; align-items: center; justify-content: space-between; }
.hero-label { font-size: 28rpx; color: rgba(255, 255, 255, 0.9); font-weight: 600; display: block; }
.hero-desc { font-size: 26rpx; color: rgba(255, 255, 255, 0.6); margin-top: 6rpx; display: block; }
.hero-score-wrap { display: flex; align-items: baseline; }
.hero-score { font-size: 72rpx; font-weight: bold; color: #FFF; line-height: 1; }
.hero-score-unit { font-size: 26rpx; color: rgba(255, 255, 255, 0.7); margin-left: 8rpx; }
.hero-level-row { display: flex; align-items: center; gap: 14rpx; margin-top: 24rpx; }
.level-badge { padding: 6rpx 20rpx; border-radius: 24rpx; font-size: 28rpx; font-weight: 600; }
.level-warn { background: #FFF3E0; color: #F59E0B; }
.level-good { background: #E8F8EE; color: #22C55E; }
.level-great { background: #EAF1FE; color: #77C9F1; }
.level-max { background: #FFF0EB; color: #FF6B3D; }
.hero-tip { font-size: 26rpx; color: rgba(255, 255, 255, 0.75); }
.progress-track {
	height: 12rpx; border-radius: 6rpx; background: rgba(255, 255, 255, 0.25);
	margin-top: 20rpx; overflow: hidden;
}
.progress-bar { height: 100%; border-radius: 6rpx; background: #FFF; transition: width 0.4s; }

.credit-tip { padding: 20rpx 24rpx; }
.tip-row { display: flex; align-items: flex-start; gap: 14rpx; }
.tip-text { flex: 1; font-size: 28rpx; color: #6B6F80; line-height: 1.6; }

.section-title { font-size: 28rpx; font-weight: 600; color: #1A1D28; display: block; margin-bottom: 20rpx; }
.tip-item { display: flex; align-items: center; gap: 16rpx; padding: 14rpx 0; }
.tip-dot {
	width: 36rpx; height: 36rpx; border-radius: 50%; background: #EAF1FE;
	color: #77C9F1; font-size: 26rpx; font-weight: 600;
	display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.tip-item-text { font-size: 26rpx; color: #1A1D28; }

.history-card { padding: 24rpx; }
.history-item { display: flex; align-items: flex-start; gap: 16rpx; padding: 20rpx 0; border-bottom: 1px solid #F2F3F8; }
.history-item:last-child { border-bottom: none; padding-bottom: 4rpx; }
.history-icon {
	width: 56rpx; height: 56rpx; border-radius: 50%; background: #E8F8EE;
	display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.history-info { flex: 1; min-width: 0; }
.history-title { font-size: 27rpx; font-weight: 500; color: #1A1D28; display: block; }
.history-desc { font-size: 26rpx; color: #8B8FA3; display: block; margin-top: 6rpx; line-height: 1.4; }
.history-time { font-size: 26rpx; color: #8B8FA3; display: block; margin-top: 6rpx; }
.history-score { font-size: 30rpx; font-weight: 700; color: #22C55E; flex-shrink: 0; }
</style>
