/**
 * curry - 将多参数函数转换为单参数函数序列
 *
 * @param fn - 要柯里化的函数
 * @returns 柯里化后的函数
 *
 * @example
 * const add = (a: number, b: number, c: number) => a + b + c
 * const curriedAdd = curry(add)
 * curriedAdd(1)(2)(3) // 6
 *
 * // 偏函数应用
 * const add5 = curriedAdd(5)
 * add5(10)(3) // 18
 */
export const curry = (fn: (...args: any[]) => any) => {
  return function curried(...args: any[]): any {
    if (args.length >= fn.length) {
      return fn(...args)
    }
    return (...nextArgs: any[]) => curried(...args, ...nextArgs)
  }
}
