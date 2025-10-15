/**
 * compose - 从右到左的函数组合
 *
 * 与 pipe 相反，函数从右向左依次执行。
 * 这是数学上的函数复合 f ∘ g（先执行 g，再执行 f）。
 *
 * @template T - 输入值的类型
 * @param fns - 要组合的函数（从右向左执行）
 * @returns 返回一个新函数，按相反顺序应用所有函数
 *
 * @example
 * const double = (x: number) => x * 2
 * const addTen = (x: number) => x + 10
 * const doubleThenAdd = compose(addTen, double)
 * doubleThenAdd(5) // (5 * 2) + 10 = 20
 */
export const compose = <T>(...fns: Array<(arg: any) => any>) => {
  return (value: T): any => {
    return fns.reduceRight((acc, fn) => fn(acc), value)
  }
}
