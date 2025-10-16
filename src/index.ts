/**
 * 函数式编程工具库
 *
 * 一个全面的函数式编程工具集合。
 * 每个工具都在独立文件中实现，并提供详细示例。
 *
 * @module fp
 */

// 核心组合函数
export { pipe } from './pipe'
export { compose } from './compose'

// 函数转换
export { curry } from './curry'
export { partial } from './partial'

// 副作用和调试
export { tap } from './tap'

// 基础工具
export { identity } from './identity'
export { constant } from './constant'

// 性能优化
export { memoize } from './memoize'
export { debounce } from './debounce'
export { throttle } from './throttle'
