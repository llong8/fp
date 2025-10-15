/**
 * throttle - 限制函数执行频率
 *
 * 创建一个节流函数，在每 delayMs 毫秒内
 * 最多调用 fn 一次。
 *
 * 非常适合滚动事件、鼠标移动等场景。
 *
 * @template T - 函数类型
 * @param fn - 要节流的函数
 * @param delayMs - 执行之间的最小时间间隔（毫秒）
 * @returns 节流后的函数
 *
 * @example
 * const logScroll = throttle(() => {
 *   console.log('Scrolled!')
 * }, 1000)
 *
 * window.addEventListener('scroll', logScroll)
 * // 无论滚动频率如何，每秒最多执行一次
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delayMs) {
      lastCall = now
      fn(...args)
    }
  }
}
