import type { TrackerConfig } from "@en-learning/common/tracker";
import { getFingerprint } from "@/uv";
import { reportEvent } from "@/event";
import { reportError } from "@/error";
import { reportPv } from "@/pv";
import { reportPerformance } from "@/performance";
import { reportFetch } from "@/report";

export class Tracker {
  private config: TrackerConfig;
  private visitorId: string | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(config: TrackerConfig) {
    this.config = config;
    this.init(); //初始化方法
  }

  //protected 允许子类和内部使用
  protected async init() {
    if (this.initPromise) return this.initPromise; //确保他是同一个promise
    //IIFE立即执行函数
    this.initPromise = (async () => {
      let config = this.config;
      const { visitorId, anonymousId } = await getFingerprint(config);
      this.visitorId = visitorId;
      reportEvent(this.visitorId, config); //事件上报
      reportError(this.visitorId, config); //错误上报
      reportPv(this.visitorId, anonymousId, config); //页面上报（同时传递anonymousId兜底）
      reportPerformance(this.visitorId, config); //性能上报
    })();
    return this.initPromise;
  }

  public async setUserId(userId: string) {
    await this.init();
    let url = this.config.baseUrl + this.config.uv.updateApi;
    await reportFetch(url, {
      visitorId: this.visitorId,
      userId: userId,
    });
  }
}
