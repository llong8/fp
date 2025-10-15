/**
 * memoize - 缓存函数结果以避免重复计算
 *
 * 创建一个函数的记忆化版本，根据参数缓存结果。
 * 仅适用于具有单个参数的函数。
 *
 * @template T - 函数参数的类型
 * @template R - 函数返回值的类型
 * @param fn - 要记忆化的函数
 * @returns 记忆化后的函数
 *
 * @example
 * const fibonacci = memoize((n: number): number => {
 *   if (n <= 1) return n
 *   return fibonacci(n - 1) + fibonacci(n - 2)
 * })
 *
 * fibonacci(40) // 很快！结果已被缓存
 */
export const memoize = <T, R>(fn: (arg: T) => R): ((arg: T) => R) => {
  const cache = new Map<T, R>()

  return (arg: T): R => {
    if (cache.has(arg)) {
      return cache.get(arg)!
    }
    const result = fn(arg)
    cache.set(arg, result)
    return result
  }
}
