import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Token, WebResultUser } from "@en-learning/common/user";
export const useUserStore = defineStore(
  "user",
  () => {
    const user = ref<WebResultUser | null>(null); //用户信息
    const setUser = (params: WebResultUser) => {
      user.value = params; //设置用户信息
    };
    const getUser = computed(() => user.value); //获取用户信息
    // 获取 accessToken
    const getAccessToken = computed(() => user.value?.token?.accessToken);
    // 获取 refreshToken
    const getRefreshToken = computed(() => user.value?.token?.refreshToken);
    const logout = () => {
      user.value = null; //退出登录
    };
    const updateToken = (newToken: Token) => {
      user.value!.token = newToken;
    };
    return {
      user,
      setUser,
      getUser,
      logout,
      getAccessToken,
      getRefreshToken,
      updateToken,
    };
  },
  { persist: true },
); //持久化存储localStorage
