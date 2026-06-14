import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type {
  Token,
  WebResultUser,
  UserUpdate,
} from "@en-learning/common/user";
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
    //更新用户信息
    const updateUser = (params: UserUpdate) => {
      user.value!.name = params.name;
      user.value!.email = params.email;
      user.value!.address = params.address;
      user.value!.avatar = params.avatar;
      user.value!.bio = params.bio;
      user.value!.isTimingTask = params.isTimingTask;
      user.value!.timingTaskTime = params.timingTaskTime;
    };
    //返回需要更新的用户信息
    const getUpdateUserInfo = computed<UserUpdate>(() => {
      return {
        name: user.value!.name,
        email: user.value!.email,
        address: user.value!.address,
        bio: user.value!.bio,
        isTimingTask: user.value!.isTimingTask,
        timingTaskTime: user.value!.timingTaskTime,
        avatar: user.value!.avatar,
      };
    });
    return {
      user,
      setUser,
      getUser,
      logout,
      getAccessToken,
      getRefreshToken,
      updateToken,
      updateUser,
      getUpdateUserInfo,
    };
  },
  { persist: true },
); //持久化存储localStorage
