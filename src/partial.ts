/**
 * partial - 固定函数的部分参数
 *
 * 创建一个新函数，预填充部分参数。
 * 比 curry 更简单，但灵活性较低。
 *
 * @template T - 函数类型
 * @param fn - 要部分应用的函数
 * @param fixedArgs - 要固定的参数
 * @returns 返回参数已固定的新函数
 *
 * @example
 * const multiply = (a: number, b: number, c: number) => a * b * c
 * const multiplyBy2 = partial(multiply, 2)
 * multiplyBy2(3, 4) // 2 * 3 * 4 = 24
 */
export const partial = <T extends (...args: any[]) => any>(
  fn: T,
  ...fixedArgs: any[]
) => {
  return (...remainingArgs: any[]) => fn(...fixedArgs, ...remainingArgs)
}
