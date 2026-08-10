/**
 * 自定义 tabBar 占位组件（原生小程序语法）
 *
 * 实际 tabBar UI 由各页面内的 AppTabBar 组件渲染。
 * 此组件仅满足微信自定义 tabBar 的编译要求。
 * 微信框架会自动在每个 tab 页注入此组件。
 */
Component({
  data: {
    selected: 0,
  },
  methods: {
    switchTab(url) {
      wx.switchTab({ url });
    },
  },
  // 当 tab 切换时，微信框架会调用此生命周期
  pageLifetimes: {
    show() {
      // 由各页面的 onShow 负责同步 AppTabBar 的 current 属性
    },
  },
});
