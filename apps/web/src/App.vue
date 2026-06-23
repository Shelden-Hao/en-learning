<template>
  <RouterView />
  <Search />
  <Login />
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import Search from "./components/Search/index.vue";
import Login from "./components/Login/index.vue";
import { provide, ref, watch } from "vue";
import { IS_SHOW_LOGIN } from "./components/Login/type.ts";
import { useUserStore } from "@/stores/user.ts";
import { useSocket } from "@/hooks/useSocket.ts";
import { Tracker } from "@en-learning/tracker";

// 是否展示注册登录弹框，是全局都可以触发的
provide(IS_SHOW_LOGIN, ref(false));

const userStore = useUserStore();
const { connect, disconnect } = useSocket();
const tracker = new Tracker({
  baseUrl: "/api/v1",
  uv: { api: "/tracker/uv", updateApi: "/tracker/update-uv" },
  pv: { api: "/tracker/pv" },
  event: { api: "/tracker/event" },
  error: { api: "/tracker/error" },
  performance: { api: "/tracker/performance" },
});
// 只要用户有登录信息，则在全局触发 ws 连接
watch(
  () => userStore.user?.id,
  (newVal) => {
    if (newVal) {
      tracker.setUserId(newVal);
      connect();
    } else {
      disconnect();
    }
  },
  { immediate: true },
);
</script>
