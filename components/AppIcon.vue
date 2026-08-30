<template>
	<text class="app-icon" :style="iconStyle">{{ iconChar }}</text>
</template>

<script>
/**
 * AppIcon - 纯文本图标组件（加大加粗版）
 *
 * Unicode 符号渲染，线条类图标使用粗体 + 加大字号确保清晰可见。
 *
 * Props:
 *   name  - 图标名称
 *   size  - 图标尺寸（rpx），默认 44
 *   color - 图标颜色，默认 #1A1D28
 */

const ICON_MAP = {
	// ========== 导航 / TabBar ==========
	home:        '⌂',
	exchange:    '⇄',
	lease:       '☰',
	mine:        '⚇',
	plus:        '＋',  // 全角加号，更粗
	publish:     '＋',

	// ========== 搜索与操作（线条类，用粗体符号） ==========
	search:      '🔍',
	'arrow-right': '❯',  // 粗箭头
	back:        '❮',    // 粗箭头
	close:       '✕',
	check:       '✔',    // 粗勾
	filter:      '⫸',
	'back-top':  '↑',    // 回到顶部

	// ========== 位置 ==========
	location:    '📍',

	// ========== 消息与社交 ==========
	message:     '✉',
	chat:        '✉',
	'chat-bubble': '💬',
	share:       '↗',
	send:        '➤',

	// ========== 用户 ==========
	user:        '👤',
	edit:        '✎',

	// ========== 交易 ==========
	cart:        '🛒',
	heart:       '♡',    // 空心爱心，未收藏
	'heart-fill': '❤',
	star:        '☆',    // 空心五角星，未收藏
	'star-fill': '★',    // 实心五角星，已收藏
	order:       '📋',
	wallet:      '💰',

	// ========== 分类 ==========
	book:        '📖',
	device:      '💻',
	digital:     '💻',
	daily:       '📦',
	sport:       '⚽',
	sports:      '⚽',
	fashion:     '👕',
	shirt:       '👕',
	gift:        '🎁',
	category:    '⊞',
	other:       '⋯',

	// ========== 状态 / 功能 ==========
	clock:       '🕐',
	shield:      '🛡',
	image:       '🖼',
	tag:         '🏷',

	// ========== 特殊功能 ==========
	ai:          '✦',
	price:       '￥',
	camera:      '📷',
	delete:      '🗑',
	block:       '⊘',
	eye:         '👁',
	phone:       '📞',
	school:      '🏫',
	verify:      '✔',
	wechat:      '💚',
	emoji:       '😊',
};

// 线条类图标需要加粗（这些图标不用 emoji，用文字符号）
const BOLD_ICONS = new Set([
	'arrow-right', 'back', 'close', 'check', 'plus', 'publish',
	'share', 'send', 'edit', 'verify', 'block', 'star', 'star-fill', 'back-top',
]);

export default {
	name: 'AppIcon',
	props: {
		name: {
			type: String,
			required: true,
		},
		size: {
			type: [Number, String],
			default: 44,
		},
		color: {
			type: String,
			default: '#1A1D28',
		},
	},
	computed: {
		iconChar() {
			return ICON_MAP[this.name] || '?';
		},
		iconStyle() {
			const s = Number(this.size);
			const size = s + 'rpx';
			const isBold = BOLD_ICONS.has(this.name);
			return {
				fontSize: size,
				lineHeight: size,
				color: this.color,
				fontWeight: isBold ? 'bold' : 'normal',
				display: 'inline-block',
				flexShrink: '0',
				textAlign: 'center',
			};
		},
	},
};
</script>
