import type { UvDto, TrackerConfig } from "@en-learning/common/tracker";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { UAParser } from "ua-parser-js";
import { reportFetch } from "@/report";

export const getBrowserInfo = () => {
  // https://docs.uaparser.dev/intro/quick-start/using-html.html
  const ua = new UAParser();
  return {
    browser: ua.getBrowser().name,
    os: ua.getOS().name,
    device: ua.getDevice().type || "desktop",
  };
};

export const getFingerprint = async (config: TrackerConfig) => {
  const browserInfo = getBrowserInfo();
  // https://www.npmjs.com/package/@fingerprintjs/fingerprintjs
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  const anonymousId = result.visitorId;
  const body: UvDto = {
    anonymousId,
    browser: browserInfo.browser,
    os: browserInfo.os,
    device: browserInfo.device,
  };
  //上报给后端
  let url = config.baseUrl + config.uv.api;
  const res = await reportFetch(url, body);
  return { visitorId: res.data as string, anonymousId }; //同时返回DB id和匿名id
};
