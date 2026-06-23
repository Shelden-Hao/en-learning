export const report = async (url: string, body: any) => {
  const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
  // sendBeacon 最适合用来做埋点网络请求，因为 xhr 没法做到：
  // 1. 跳转到新的标签页发送请求
  // 2. 网页关闭时发送请求
  // sendBeacon 默认是 post 请求，且返回值只能是 true/false
  // https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/sendBeacon
  navigator.sendBeacon(url, blob); // 不接受 json，因此这里转为 blob
};

// 封装 fetch 主要为了获取后端返回值 访客id
export const reportFetch = async (url: string, body: any) => {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    keepalive: true, // 页面关闭也能发送请求
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};
