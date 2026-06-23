import type { PvDto, TrackerConfig } from "@en-learning/common/tracker";
import { report } from "@/report";

const reportView = (visitorId: string, anonymousId: string, config: TrackerConfig) => {
  let url = config.baseUrl + config.pv.api;
  const isHash = window.location.href.includes("#"); //如果携带了# 说明是hash模式
  const body: PvDto = {
    visitorId,
    anonymousId,
    url: window.location.protocol + "//" + window.location.host,
    referrer: document.referrer,
    path: isHash ? "/" + window.location.hash : window.location.pathname,
  };
  report(url, body);
};

export const reportPv = (visitorId: string, anonymousId: string, config: TrackerConfig) => {
  reportView(visitorId, anonymousId, config); //初始化上报
  //路由的模式 hash history
  window.addEventListener("hashchange", (e) => {
    reportView(visitorId, anonymousId, config);
  });
  //popstate 前进和后退
  //但是框架的 router.push router.replace 只是使用的 history 的两个方法，无法通过事件监听，因此我们需要重写这两个方法实现 reportView 监听
  window.addEventListener("popstate", (e) => {
    reportView(visitorId, anonymousId, config);
  });
  const originalPushState = history.pushState; //获取原始的pushState方法
  history.pushState = function () {
    originalPushState.apply(this, arguments);
    reportView(visitorId, anonymousId, config);
  };
  const originalReplaceState = history.replaceState; //获取原始的replaceState方法
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    reportView(visitorId, anonymousId, config);
  };
};
