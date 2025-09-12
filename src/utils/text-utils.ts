/**
 * 文字动画
 * @param scene Scene 对象
 * @param target Text 对象
 * @param text 文字
 * @param config
 * @param config.callback 回调函数
 * @param config.delay 延迟时间
 */
export function animateText(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Text,
  text: string,
  config?: {
    callback?: () => void
    delay?: number
  }
) {
  const length = text.length
  let i = 0
  scene.time.addEvent({
    callback: () => {
      if (i >= length) return
      target.text += text[i]
      i++
      if (i === length - 1 && config?.callback) {
        config.callback()
      }
    },
    repeat: length - 1,
    delay: config?.delay || 25
  })
}
