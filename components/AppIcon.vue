<template>
	<text class="app-icon" :style="iconStyle">{{ iconChar }}</text>
</template>

<script>
/**
 * AppIcon - 公共图标组件
 *
 * 使用 text/emoji 字符渲染图标，兼容微信小程序（不支持 SVG data URI）。
 *
 * Props:
 *   name  - 图标名称
 *   size  - 图标尺寸（rpx），默认 40
 *   color - 图标颜色，默认 #333333
 *         注意：emoji 字符不受 CSS color 控制，仅纯文本符号响应 color。
 *         对于需要颜色切换的场景（如 tabBar），使用纯文本符号。
 */

const ICON_MAP = {
	// ========== 导航 / TabBar（纯文本符号，响应 color） ==========
	home:        '⌂',
	exchange:    '⇄',
	lease:       '☰',
	mine:        '⚇',
	plus:        '+',
	publish:     '+',

	// ========== 搜索与操作 ==========
	search:      '⌕',
	'arrow-right': '›',
	back:        '‹',
	close:       '✕',
	check:       '✓',
	more:        '⋯',

	// ========== 位置 ==========
	location:    '⌖',

	// ========== 消息与社交 ==========
	message:     '✉',
	chat:        '✉',
	notification:'🔔',
	share:       '↗',

	// ========== 用户与设置 ==========
	user:        '👤',
	edit:        '✎',
	settings:    '⚙',

	// ========== 交易 ==========
	cart:        '🛒',
	heart:       '♡',
	'heart-filled': '❤',
	order:       '≡',
	wallet:      '💰',

	// ========== 分类 ==========
	category:    '⊞',
	book:        '📖',
	device:      '💻',
	shirt:       '👕',
	sport:       '⚽',
	gift:        '🎁',

	// ========== 状态 ==========
	clock:       '🕐',
	shield:      '🛡',
	image:       '🖼',
	tag:         '🏷',

	// ========== 学校 ==========
	school:      '🏫',
	verify:      '✔',

	// ========== 微信 ==========
	wechat:      '💚',

	// ========== 发送 ==========
	send:        '➤',

	// ========== 浏览 ==========
	eye:         '👁',

	// ========== 删除 ==========
	delete:      '🗑',

	// ========== 表情 ==========
	emoji:       '😊',

	// ========== 电话 ==========
	phone:       '📞',
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
			const size = `${this.size}rpx`;
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
