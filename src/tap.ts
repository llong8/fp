/**
 * tap - 执行副作用而不改变值
 *
 * 在 pipe 链或任何转换管道中用于调试非常有用。
 * 执行一个函数产生副作用，然后返回原始值。
 *
 * @template T - 值的类型
 * @param fn - 要执行副作用的函数
 * @returns 返回一个函数，接收值、执行 fn、返回不变的值
 *
 * @example
 * const result = pipe(
 *   value,
 *   transform1,
 *   tap(x => console.log('After transform1:', x)),
 *   transform2,
 *   tap(x => console.log('After transform2:', x)),
 *   transform3
 * )
 */
export const tap = <T>(fn: (value: T) => void) => {
  return (value: T): T => {
    fn(value)
    return value
  }
}
