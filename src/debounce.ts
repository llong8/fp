/**
 * debounce - 在一段不活动时间后延迟执行函数
 *
 * 创建一个防抖函数，在最后一次调用后延迟 delayMs 毫秒
 * 才执行 fn。
 *
 * 非常适合搜索输入框、窗口调整大小等场景。
 *
 * @template T - 函数类型
 * @param fn - 要防抖的函数
 * @param delayMs - 延迟时间（毫秒）
 * @returns 防抖后的函数
 *
 * @example
 * const searchAPI = debounce((query: string) => {
 *   fetch(`/api/search?q=${query}`)
 * }, 300)
 *
 * // 用户快速输入 "hello" - 只有最后一次调用在 300ms 后执行
 * searchAPI('h')     // 取消
 * searchAPI('he')    // 取消
 * searchAPI('hel')   // 取消
 * searchAPI('hello') // 300ms 后执行
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => fn(...args), delayMs)
  }
}
