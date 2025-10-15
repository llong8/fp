/**
 * identity - 返回输入的值，保持不变
 *
 * identity 函数简单地返回传递给它的任何值。
 * 可用作默认函数、过滤器或函数组合中。
 *
 * @template T - 值的类型
 * @param value - 要返回的值
 * @returns 相同的值
 *
 * @example
 * identity(42) // 42
 * identity("hello") // "hello"
 * [1, 2, null, 3, undefined].filter(identity) // [1, 2, 3]
 */
export const identity = <T>(value: T): T => value
