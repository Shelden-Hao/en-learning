import { createRouter, createWebHistory } from "vue-router";
import home from "./home/index";
import wordBook from "./word-book/index";
import setting from "./setting/index";
import chat from "@/router/chat";
import course from "@/router/course";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...home, //主页
    ...wordBook, //词库
    ...setting,
    ...chat,
    ...course,
  ],
});

export default router;
