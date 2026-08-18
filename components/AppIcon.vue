<template>
	<text class="app-icon" :style="iconStyle">{{ iconChar }}</text>
</template>

<script>
/**
 * AppIcon - 纯文本图标组件
 *
 * 使用 Unicode 字符 / Emoji 渲染图标，兼容微信小程序（不支持 SVG v-html）。
 * 纯文本符号响应 CSS color，Emoji 保持原色。
 *
 * Props:
 *   name  - 图标名称
 *   size  - 图标尺寸（rpx），默认 40
 *   color - 图标颜色（仅纯文本符号响应），默认 #1A1D28
 */

const ICON_MAP = {
	// ========== 导航 / TabBar（纯文本符号，响应 color） ==========
	home:        '⌂',   // ⌂
	exchange:    '⇄',   // ⇄
	lease:       '☰',   // ☰
	mine:        '⚇',   // ⚇
	plus:        '+',
	publish:     '+',

	// ========== 搜索与操作 ==========
	search:      '⌕',   // ⌕
	'arrow-right': '›', // ›
	back:        '‹',   // ‹
	close:       '✕',   // ✕
	check:       '✓',   // ✓
	filter:      '⫸',   // ⫸

	// ========== 位置 ==========
	location:    '⌖',   // ⌖

	// ========== 消息与社交 ==========
	message:     '✉',   // ✉
	chat:        '✉',   // ✉
	'chat-bubble': '💬', // 💬
	share:       '↗',   // ↗
	send:        '➤',   // ➤

	// ========== 用户 ==========
	user:        '👤', // 👤
	edit:        '✎',   // ✎

	// ========== 交易 ==========
	cart:        '🛒', // 🛒
	heart:       '♡',   // ♡
	'heart-fill': '❤',  // ❤
	order:       '📋', // 📋
	wallet:      '💰', // 💰

	// ========== 分类 ==========
	book:        '📖', // 📖
	device:      '💻', // 💻
	digital:     '💻', // 💻
	daily:       '📦', // 📦
	sport:       '⚽',   // ⚽
	sports:      '⚽',   // ⚽
	fashion:     '👕', // 👕
	shirt:       '👕', // 👕
	gift:        '🎁', // 🎁
	category:    '⊞',   // ⊞
	other:       '⋯',   // ⋯

	// ========== 状态 / 功能 ==========
	clock:       '🕐', // 🕐
	shield:      '🛡', // 🛡
	image:       '🖼', // 🖼
	tag:         '🏷', // 🏷

	// ========== 特殊功能 ==========
	ai:          '✦',   // ✦
	price:       '￥',   // ¥ (fullwidth)
	camera:      '📷', // 📷
	star:        '★',   // ★
	delete:      '🗑', // 🗑
	block:       '⊘',   // ⊘
	eye:         '👁', // 👁
	phone:       '📞', // 📞
	school:      '🏫', // 🏫
	verify:      '✔',   // ✔
	wechat:      '💚', // 💚
	emoji:       '😊', // 😊
};

export default {
	name: 'AppIcon',
	props: {
		name: {
			type: String,
			required: true,
		},
		size: {
			type: [Number, String],
			default: 40,
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
			const size = this.size + 'rpx';
			return {
				fontSize: size,
				lineHeight: size,
				color: this.color,
				display: 'inline-block',
				flexShrink: '0',
				textAlign: 'center',
			};
		},
	},
};
</script>
