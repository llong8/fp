/**
 * constant - 返回一个始终返回相同值的函数
 *
 * 创建一个忽略其参数、始终返回
 * 调用 constant 时提供的值的函数。
 *
 * @template T - 常量值的类型
 * @param value - 要返回的值
 * @returns 始终返回该值的函数
 *
 * @example
 * const getTrue = constant(true)
 * getTrue() // true
 * [1, 2, 3].map(constant('x')) // ['x', 'x', 'x']
 */
export const constant = <T>(value: T) => (): T => value
