export interface Options {
  rate?: number; //语速0-1
  volume?: number; //音量0-1
  pitch?: number; //音调0-2
  lang?: string; //语言
}
let instance: SpeechSynthesisUtterance | null = null;
// 单例模型，全局使用唯一一个实例
const getInstance = (options: Options) => {
  if (!instance) {
    // 内置的语音合成实例api
    instance = new SpeechSynthesisUtterance();
    const { rate = 0.7, volume = 1, pitch = 1, lang = "en-US" } = options;
    instance.rate = rate;
    instance.volume = volume;
    instance.pitch = pitch;
    instance.lang = lang;
  }
  return instance;
};
export const useAudio = (options: Options) => {
  const pronounce = getInstance(options);
  const playAudio = (word: string) => {
    pronounce.text = word; //设置发音的单词
    // speechSynthesis是浏览器提供的全局Web Speech API，无需手动初始化，直接挂载在window对象上即可使用
    speechSynthesis.speak(pronounce); // 播放发音
  };

  return {
    playAudio,
  };
};
