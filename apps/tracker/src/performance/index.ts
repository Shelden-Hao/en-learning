import type {
  PerformanceDto,
  TrackerConfig,
} from "@en-learning/common/tracker";
import { report } from "@/report";
import { onINP, onCLS } from "web-vitals";

export const reportPerformance = async (
  visitorId: string,
  config: TrackerConfig,
) => {
  let url = config.baseUrl + config.performance.api;
  let fp = 0; //FP 首次绘制时间
  let fcp = 0; //FCP 首次内容绘制时间
  let lcp = 0; //LCP 最大内容绘制时间
  let inp = 0; //INP 交互性能指标
  let cls = 0; //CLS 累积布局偏移
  //FP 和 FCP
  // https://developer.mozilla.org/zh-CN/docs/Glossary/First_paint
  let performanceEntries = performance.getEntriesByType("paint");
  const fpEntry = performanceEntries.find(
    (entry) => entry.name === "first-paint",
  );
  // https://web.dev/articles/fcp?hl=zh_cn
  const fcpEntry = performanceEntries.find(
    (entry) => entry.name === "first-contentful-paint",
  );
  if (fpEntry) {
    fp = fpEntry.startTime;
  }
  if (fcpEntry) {
    fcp = fcpEntry.startTime;
  }
  let lcpPromise = new Promise<{
    lcpTime: number;
    lcpObserver: PerformanceObserver;
  }>((resolve) => {
    // https://web.dev/articles/lcp?hl=zh-cn
    // 异步的，否则读取不到
    let lcpObserver = new PerformanceObserver((entryList) => {
      resolve({
        lcpTime: entryList.getEntries().at(-1)?.startTime || 0,
        lcpObserver,
      });
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true }); //buffered 历史记录和新的LCP性能都监听
  });
  const { lcpTime, lcpObserver } = await lcpPromise;
  lcpObserver.disconnect(); //断开
  lcp = lcpTime;
  //INP：https://web.dev/articles/inp?hl=zh_cn
  onINP((metric) => {
    inp = metric.value;
  });
  //CLS 布局偏移：https://web.dev/articles/cls?hl=zh_cn
  onCLS((metric) => {
    cls = metric.value;
  });
  // INP 页面上写到，推荐使用 visibilitychange 事件发送所有的报告
  window.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "hidden") {
        const body: PerformanceDto = {
          visitorId,
          fp,
          fcp,
          lcp,
          inp,
          cls,
        };
        report(url, body);
      }
    },
    { once: true },
  );
};
