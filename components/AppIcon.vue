<template>
	<view
		class="app-icon"
		:style="iconStyle"
		v-html="svgContent"
	/>
</template>

<script>
/**
 * AppIcon - 公共图标组件
 *
 * 使用 SVG 内联渲染，跨平台一致，支持动态改色和尺寸。
 * 后续如需切换到 iconfont 字体方案，只需修改此组件。
 *
 * Props:
 *   name  - 图标名称
 *   size  - 图标尺寸（rpx），默认 40
 *   color - 图标颜色，默认继承父级
 */

const SVG_MAP = {
	home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L4 9v12h5v-7h6v7h5V9z"/></svg>',
	exchange: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 10.5h-9.29l1.65-1.65L8.5 7.5 5 11l3.5 3.5 1.36-1.35L8.21 11.5h9.29v-1zm-10 3h9.29l-1.65 1.65L16.5 16.5 20 13l-3.5-3.5-1.36 1.35L16.79 12.5H7.5v1z"/></svg>',
	lease: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 14H5v-2h14v2zm0-4H5V8h14v4z"/></svg>',
	mine: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
	plus: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
	search: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
	'arrow-right': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>',
	location: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
	back: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
	close: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>',
	check: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>',
	message: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>',
	share: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>',
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
			default: '',
		},
	},
	computed: {
		iconStyle() {
			const size = `${this.size}rpx`;
			const style = {
				width: size,
				height: size,
				display: 'inline-flex',
				'align-items': 'center',
				'justify-content': 'center',
				'flex-shrink': '0',
				'line-height': '1',
			};
			if (this.color) {
				style.color = this.color;
			}
			return style;
		},
		svgContent() {
			return SVG_MAP[this.name] || '';
		},
	},
};
</script>
