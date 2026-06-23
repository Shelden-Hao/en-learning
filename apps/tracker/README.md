## @fingerprintjs/fingerprintjs 实现原理

通过混合浏览器内核、操作系统版本、屏幕分辨率、CPU 核心数、时区偏移、WebGL 指纹、Canvas 指纹、浏览器语言、插件列表、字体列表、User-Agent、Do Not Track 设置等进行哈希生成唯一的指纹。

```ts
console.log(navigator.platform) //操作系统版本
console.log(navigator.hardwareConcurrency) //CPU 核心数
console.log(screen.colorDepth) //屏幕分辨率
console.log(navigator.userAgent) //UA
//时区偏移
const offsetMinutes = -new Date().getTimezoneOffset();
console.log(offsetMinutes); // 例如 北京通常是 480
console.log(offsetMinutes / 60); // 小时数
//canvas
// 生成 canvas 指纹会查用户的 mac 地址（唯一的）
const canvas = document.createElement('canvas')
const canvasContext = canvas.getContext('2d')
canvasContext.fillStyle = 'red'
canvasContext.fillRect(0, 0, 100, 100)
const canvasData = canvas.toDataURL()
console.log(canvasData)
//webgl
const canvas2 = document.createElement('canvas');
const webgl = canvas2.getContext('webgl');
if (webgl) {
  const ext = webgl.getExtension('WEBGL_debug_renderer_info');
  if (ext) {
    const renderer = webgl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
    const vendor = webgl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
    console.log({ vendor, renderer });
  }
}
```
## tracker 使用说明

需要先打包 `pnpm run build` 后，才可以在 web 或者其他前端项目中安装包并导入使用。
