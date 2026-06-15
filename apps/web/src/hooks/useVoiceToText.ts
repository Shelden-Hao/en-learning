import { ref } from "vue";

export interface Options {
  lang?: string; //需要转换成的语言
  continuous?: boolean; //是否连续识别 默认是false 就是说每说完一句话或者没有声音了就会自动停止 如果设置为true就需要手动调用stop函数停止
  interimResults?: boolean; //是否显示临时结果 默认是false 类似于SSE
  maxAlternatives?: number; //最大候选数 默认是1 举个例子设置为3 说了apple 可能会识别出apple、apples、apple 等
}

// SpeechRecognition 不是 window 内置的类型
// 需要安装 @types/dom-speech-recognition，并在 tsconfig.app.json 中指定 "types": ["dom-speech-recognition", ...],
let instance: SpeechRecognition | null = null;

const getInstance = (options: Options): SpeechRecognition => {
  const speechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition; //兼容苹果
  if (!speechRecognition) {
    throw new Error("SpeechRecognition is not supported in this browser"); //浏览器不支持语音识别
  }
  //第一次会创建
  if (!instance) {
    const {
      lang = "zh-CN",
      continuous = false,
      interimResults = false,
      maxAlternatives = 1,
    } = options;
    instance = new speechRecognition();
    instance.lang = lang;
    instance.continuous = continuous;
    instance.interimResults = interimResults;
    instance.maxAlternatives = maxAlternatives;
  }
  //其他次数就直接返回了
  return instance;
};

export const useVoiceToText = (options: Options) => {
  const recognition = getInstance(options);
  const isRecording = ref(false); //是否正在录音
  // 录音结束的事件
  recognition.onend = () => {
    isRecording.value = false;
  };
  //开启语音转文字
  const start = (callback?: (result: string) => void) => {
    isRecording.value = true;
    recognition.start();
    //输出的结果
    recognition.onresult = (event) => {
      let fullText = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result?.[0]) {
          fullText += result[0].transcript;
        }
      }
      callback?.(fullText);
    };
  };
  //停止语音转文字
  const stop = () => {
    isRecording.value = false;
    recognition.stop();
  };
  return {
    isRecording,
    start,
    stop,
  };
};
