<template>
	<text class="app-icon" :style="iconStyle">{{ iconChar }}</text>
</template>

<script>
/**
 * AppIcon - 图标组件（精修版，纯系统字符渲染）
 *
 * 说明：
 *  - 全部使用系统自带字符/Emoji，不依赖任何自定义字体，杜绝方框问题；
 *  - 导航与操作类使用"可变色符号"（响应 color，如 ⌂ ⇄ ☰）；
 *  - 内容与分类类使用彩色 Emoji（各设备原生支持）。
 *
 * Props:
 *   name  - 图标名称
 *   size  - 图标尺寸（rpx），默认 40
 *   color - 图标颜色（仅可变色符号响应，Emoji 保持原色），默认 #333
 */

const ICON_MAP = {
	// ========== 导航 / TabBar（可变色符号，响应 color） ==========
	home:        '⌂',   // 首页
	exchange:    '⇄',   // 互助/交换
	lease:       '☰',   // 租借
	mine:        '☻',   // 我的
	plus:        '+',
	publish:     '+',

	// ========== 搜索与操作 ==========
	search:      '⌕',
	'arrow-right': '›',
	back:        '‹',
	close:       '✕',
	check:       '✓',
	filter:      '⚙',

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
	heart:       '♡',
	'heart-fill': '❤',
	order:       '📋',
	wallet:      '💰',

	// ========== 分类（彩色 Emoji） ==========
	book:        '📖',
	device:      '💻',
	digital:     '💻',
	daily:       '📦',
	sport:       '⚽',
	sports:      '⚽',
	fashion:     '👕',
	shirt:       '👕',
	gift:        '🎁',
	category:    '⚙',
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
	star:        '★',
	delete:      '🗑',
	block:       '🚫',
	eye:         '👁',
	phone:       '📞',
	school:      '🏫',
	verify:      '✔',
	wechat:      '💚',
	emoji:       '😊',
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
			default: '#333333',
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
