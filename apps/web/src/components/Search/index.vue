<template>
  <div
    v-if="isShow"
    class="fixed inset-0 w-full h-full z-40 bg-black opacity-30 blur-sm"
  />
  <Transition name="fade">
    <div v-if="isShow" class="fixed inset-0 shadow-lg z-50 p-30 pt-20">
      <div
        :class="
          wordList.length > 0
            ? 'rounded-tr-[10px] rounded-tl-[10px]'
            : 'rounded-[10px]'
        "
        class="flex items-center gap-2 shadow-lg w-1/2 mx-auto p-3 bg-white"
      >
        <el-icon size="20">
          <Search />
        </el-icon>
        <input
          v-focus
          placeholder="搜索"
          type="text"
          v-model="search"
          class="w-full h-full text-sm border-none rounded-lg p-2 focus:outline-none"
        />
      </div>
      <div
        v-if="wordList.length > 0"
        class="w-1/2 mx-auto max-h-[500px] border-t border-gray-200 overflow-y-auto"
      >
        <div
          @click="copyWord(item.word)"
          v-for="item in wordList"
          :key="item.id"
          class="bg-white hover:bg-blue-50 text-gray-800 p-4 cursor-pointer shadow-sm hover:shadow-md"
        >
          <div class="text-sm font-semibold text-blue-600 mb-1">
            {{ item.word }}
          </div>
          <div
            v-html="item.translation"
            class="text-sm text-gray-700 mb-1 overflow-hidden line-clamp-2"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, customRef } from "vue";
import { Search } from "@element-plus/icons-vue";
import type { Word } from "@en-learning/common/word";
import { getWordBookList } from "@/apis/word-book";
import { ElMessage } from "element-plus";

const wordList = ref<Word[]>([]); // 搜索结果
const isShow = ref(false); // 用来展示弹框的显示和隐藏
let timer: ReturnType<typeof setTimeout> | null = null;

// 搜索功能这里可以有三种方式实现：
// 1. 使用 watch 监听 search.value + 防抖
// 2. 使用 input 事件，每当输入内容触发搜索 + 防抖
// 3. 使用 customRef，手动完成依赖的追踪和触发更新（更新时触发 getList） + 防抖
const search = customRef((track, trigger) => {
  // 需要传入一个工厂函数，返回一个对象（需实现 getter 和 setter）
  let value = ""; //默认值
  return {
    get() {
      track(); // 告诉 vue 追踪 value 的值
      return value;
    },
    set(newValue: string) {
      value = newValue;
      // 手动实现防抖
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        console.log(value);
        getList();
        trigger(); // 告诉 vue 触发 value 的值，从而触发依赖
      }, 500);
    },
  };
}); //搜索的一个值
const getList = async () => {
  const res = await getWordBookList({
    word: search.value,
    page: 1,
    pageSize: 20,
  });
  if (res.success) {
    wordList.value = res.data.list;
  }
};
const copyWord = (word: string) => {
  try {
    navigator.clipboard.writeText(word); // 只有在 localhost / https 才能生效
    ElMessage.success("复制成功");
  } catch (error) {
    ElMessage.error("复制失败");
  }
};
window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "f" && e.ctrlKey) {
    // ctrl+f 实现弹框打开
    e.preventDefault(); // 禁止打开浏览器的默认搜索框
    isShow.value = true;
    document.body.style.overflow = "hidden"; // 禁止整个页面的滚动条，只需要弹框中的滚动条
  }
  if (e.key === "Escape") {
    // esc 实现弹框打开
    isShow.value = false;
    search.value = "";
    document.body.style.overflow = "auto";
  }
});
</script>

<style scoped>
/* 自定义过渡动画：https://cn.vuejs.org/guide/built-ins/transition#css-based-transitions */
/* 过滤时间、动画函数 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

/* 从消失到出现 */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

/* 从出现到消失 */
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
