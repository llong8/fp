/**
 * pipe - 从左到右的函数组合
 *
 * 接收一个初始值，依次通过一系列函数进行转换，
 * 每个函数接收上一个函数的输出作为输入。
 *
 * @template T - 初始值的类型
 * @param value - 要转换的初始值
 * @param fns - 按顺序应用的函数序列
 * @returns 应用所有函数后的最终结果
 *
 * @example
 * const double = (x: number) => x * 2
 * const addTen = (x: number) => x + 10
 * const result = pipe(5, double, addTen) // (5 * 2) + 10 = 20
 */
export const pipe = <T>(value: T, ...fns: Array<(arg: any) => any>): any => {
  return fns.reduce((acc, fn) => fn(acc), value)
}
