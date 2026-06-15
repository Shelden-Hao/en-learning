<template>
  <div class="flex-1 h-[750px] p-5 bg-purple-50 flex flex-col">
    <div class="flex-1 overflow-y-auto">
      <div v-for="(item, index) in list" :key="index">
        <div
          class="flex justify-end items-center gap-4 mt-5 mb-5 mr-5"
          v-if="item.role === 'human'"
        >
          <div
            class="text-sm text-white max-w-[80%] rounded-lg p-2 bg-blue-500 shadow-md"
          >
            {{ item.content }}
          </div>
          <div>
            <el-avatar :size="35">user</el-avatar>
          </div>
        </div>
        <div class="flex justify-start items-center gap-4 mt-5 mb-5" v-else>
          <div>
            <el-avatar :size="35">AI</el-avatar>
          </div>
          <div
            v-if="item.role === 'ai' && item.content !== ''"
            class="text-sm text-gray-700 max-w-[80%] bg-white rounded-lg p-2 shadow-md deepseek-markdown"
            v-html="parseMarkdown(item.content)"
          />
        </div>
      </div>
      <!-- 作为一个占位元素，确保每次对话列表有变化将滚动条滚动到底部 -->
      <div ref="chatRef"></div>
    </div>
    <div class="flex p-5 border-t border-gray-200 box-border">
      <el-input
        @keyup.enter="sendMessage"
        type="textarea"
        :rows="2"
        v-model="message"
        placeholder="请输入内容"
      />
      <el-button
        class="ml-2"
        :icon="Position"
        type="primary"
        @click="sendMessage"
      ></el-button>
      <el-button
        v-if="!isRecording"
        class="ml-2"
        :icon="Mic"
        type="primary"
        @click="startRecording"
      ></el-button>
      <el-button
        v-else
        class="ml-2"
        :icon="VideoPause"
        type="primary"
        @click="stopRecording"
      ></el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, watch, nextTick } from "vue";
import { Mic, Position, VideoPause } from "@element-plus/icons-vue";
import type { ChatMessageList } from "@en-learning/common/chat";
import { marked } from "marked";
import "@/assets/css/deep-seek.css";
import { useVoiceToText } from "@/hooks/useVoiceToText.ts";

const emits = defineEmits(["onSendMessage"]);
const chatRef = useTemplateRef<HTMLDivElement>("chatRef"); //读取DOM元素
const props = defineProps<{
  list?: ChatMessageList; //消息列表 后续通过props传入
}>();
const message = ref<string>(""); //发送的内容
//发送消息
const sendMessage = () => {
  if (!message.value) return;
  emits("onSendMessage", message.value);
  message.value = "";
};
//markdown解析HTML
const parseMarkdown = (content: string) => {
  if (!content) return "";
  return marked.parse(content);
};
//监听消息列表，滚动到最底部
watch(
  () => props.list,
  () => {
    nextTick(() => {
      // 强制最后一个(对话占位元素)出现在可视区
      chatRef.value?.scrollIntoView({ behavior: "smooth" });
    });
  },
  {
    immediate: true,
    deep: true,
  },
);
const { isRecording, start, stop } = useVoiceToText({
  lang: "zh-CN",
  continuous: true,
});
// 开始录音
const startRecording = () => {
  start((result) => {
    message.value = result;
  });
};
// 停止录音
const stopRecording = () => {
  stop();
  sendMessage();
};
</script>
