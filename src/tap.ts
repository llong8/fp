/**
 * tap - 执行副作用而不改变值（支持同步和异步）
 *
 * 在 pipe 链或任何转换管道中用于调试、日志记录等副作用操作。
 * 执行副作用函数后返回原始值不变。
 *
 * 特性：
 * - 自动检测并处理 Promise 值
 * - 副作用函数接收解包后的值（非 Promise）
 * - 支持同步和异步副作用函数
 * - 运行时根据情况返回 T 或 Promise<T>
 *
 * @template T - 值的类型（可以是 Promise<U> 或普通值）
 * @param fn - 副作用函数，接收解包后的值
 * @returns 返回函数，保持原始值不变
 *
 * @example
 * // 同步使用
 * const result = pipe(
 *   5,
 *   tap(x => console.log('Value:', x)),
 *   x => x * 2
 * ) // 输出: Value: 5, 返回: 10
 *
 * @example
 * // 异步使用 - tap 自动解包 Promise
 * const result = await pipe(
 *   getData(),  // 返回 Promise<Data>
 *   async data => processData(data),  // 返回 Promise<Result>
 *   tap(result => console.log(result)),  // result 已自动解包为 Result 类型
 *   tap(async result => await saveToDb(result))  // 支持异步副作用
 * )
 */

// 辅助类型：提取 Promise 中的类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

// 类型声明 - 副作用函数接收解包后的类型
export function tap<T>(fn: (value: UnwrapPromise<T>) => void | Promise<void>): (value: T) => T

// 实现
export function tap<T>(fn: (value: UnwrapPromise<T>) => void | Promise<void>): (value: T) => T {
  return ((value: T) => {
    // Promise 值需要先解包
    if (value instanceof Promise) {
      return value.then((unwrapped: any) => {
        const result = fn(unwrapped)
        return result instanceof Promise ? result.then(() => value) : value
      })
    }

    // 同步值直接处理
    const result = fn(value as any)
    return result instanceof Promise ? result.then(() => value) : value
  }) as (value: T) => T
}
