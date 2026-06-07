import type { App, Plugin } from "vue";

export default {
  install(app: App) {
    // 把全局输入框都做成默认聚焦的
    app.directive("focus", {
      mounted(el: HTMLElement) {
        el.focus();
      },
    });
  },
} as Plugin;
