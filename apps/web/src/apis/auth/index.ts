import axios from "axios";
import type { Token } from "@en-learning/common/user";
import type { Response } from "../index";

// 作用：
// 1. 与 serverApi（带token） 隔离开
// 2. 防止死循环携带token，当只使用 serverApi时，如果 refreshToken 也过期了，或者刷新接口本身报错了，服务端再次返回 401。此时，serverApi 的响应拦截器又捕获到了 401，于是它又一次去调用“刷新 Token”的接口……
const refreshServer = axios.create({
  baseURL: "/api/v1",
  timeout: 50000,
});

//响应拦截器
refreshServer.interceptors.response.use(
  (res) => {
    return res.data;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 导出刷新token的接口
export const refreshTokenApi = (data: Omit<Token, "accessToken">) =>
  refreshServer.post("/user/refresh-token", data) as Promise<Response<Token>>;
