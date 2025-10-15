/**
 * pipeAsync - 异步版本的 pipe，用于组合异步函数
 *
 * 类似 pipe，但支持异步函数并返回 Promise。
 * 每个函数可以是同步或异步的，它们将按顺序等待执行。
 *
 * @template T - 初始值的类型
 * @param value - 要转换的初始值
 * @param fns - 按顺序应用的同步或异步函数
 * @returns 返回 Promise，resolve 为最终结果
 *
 * @example
 * const result = await pipeAsync(
 *   userId,
 *   fetchUser,           // async
 *   validateUser,        // sync
 *   enrichWithProfile,   // async
 *   saveToDatabase       // async
 * )
 */
export const pipeAsync = async <T>(
  value: T,
  ...fns: Array<(arg: any) => any | Promise<any>>
): Promise<any> => {
  let result: any = value
  for (const fn of fns) {
    result = await fn(result)
  }
  return result
}
