/**
 * tap - 执行副作用而不改变值（统一版本，支持同步和异步）
 *
 * 在 pipe 链或任何转换管道中用于调试、日志记录等副作用操作。
 * 执行一个函数产生副作用，然后返回原始值。
 *
 * 自动检测副作用函数是否返回 Promise，自动切换同步/异步模式。
 *
 * @template T - 值的类型
 * @param fn - 要执行副作用的函数（可以是同步或异步）
 * @returns 返回一个函数，接收值、执行 fn、返回不变的值
 *
 * @example
 * // 同步使用
 * const result = pipe(
 *   value,
 *   transform1,
 *   tap(x => console.log('After transform1:', x)),
 *   transform2
 * )
 *
 * @example
 * // 异步使用
 * const result = await pipe(
 *   value,
 *   transform1,
 *   tap(async x => await logToDatabase(x)),
 *   transform2
 * )
 */

// 同步重载
export function tap<T>(fn: (value: T) => void): (value: T) => T

// 异步重载
export function tap<T>(fn: (value: T) => Promise<void>): (value: T) => Promise<T>

// 实现
export function tap<T>(fn: (value: T) => void | Promise<void>) {
  return (value: T): T | Promise<T> => {
    const result = fn(value)

    // 如果副作用函数返回 Promise，返回异步版本
    if (result instanceof Promise) {
      return result.then(() => value)
    }

    // 否则返回同步版本
    return value
  }
}
