import { useUserStore } from "@/stores/user";
import axios from "axios";
import router from "@/router";
import { refreshTokenApi } from "./auth";

export const timeout = 50000;
export const serverApi = axios.create({
  baseURL: "/api/v1",
  timeout,
});
let isRefreshing = false; // 是否正在刷新token（防止重复刷新token，多次并发请求加锁）
let requestQueue: ((newAccessToken: string) => void)[] = []; // 存储失败的请求

serverApi.interceptors.request.use((config) => {
  // useUserStore 必须要写在拦截器内部，如果写在外面，pinia 还未初始化
  const userStore = useUserStore();
  if (userStore.getAccessToken) {
    config.headers.Authorization = `Bearer ${userStore.getAccessToken}`;
  }
  return config;
});
serverApi.interceptors.response.use(
  (res) => {
    return res.data;
  },
  async (error) => {
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }
    // 401 处理逻辑
    const userStore = useUserStore();
    const accessToken = userStore.getAccessToken;
    const refreshToken = userStore.getRefreshToken;
    const originalRequest = error.config; // 读取原始请求（未成功请求响应的接口）
    if (!accessToken || !refreshToken) {
      userStore.logout(); // 清空user
      router.replace("/"); // 跳转到首页
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve) => {
        requestQueue.push((newAccessToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(serverApi(originalRequest));
        });
      });
    }
    //刷新token调用接口
    isRefreshing = true;
    // 如果发生网络问题，那么 isRefreshing 会保持 true，导致后续请求无法执行，因此需要在 finally 中重置刷新状态
    try {
      const newToken = await refreshTokenApi({ refreshToken: refreshToken });
      if (newToken.success) {
        // 切换成功更新 token 到 pinia 中
        userStore.updateToken(newToken.data);
      } else {
        userStore.logout(); // 清空 user
        router.replace("/"); // 跳转到首页
        return Promise.reject(error);
      }
      const newAccessToken = newToken.data.accessToken;
      requestQueue.forEach((callback) => callback(newAccessToken)); //执行存储的请求
      return serverApi(originalRequest);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      requestQueue = []; //清空队列
      isRefreshing = false; //重置刷新状态
    }
  },
);

export const aiApi = axios.create({
  baseURL: "/api/ai/v1",
  timeout,
});

aiApi.interceptors.response.use((res) => {
  return res.data;
});

export interface Response<T = any> {
  timestamp: string;
  path: string;
  message: string;
  code: number;
  success: boolean;
  data: T;
}
