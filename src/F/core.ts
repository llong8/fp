/**
 * F - 函数式计算容器
 *
 * F<E, A> 表示一个可能失败的延迟计算：
 * - E: 错误类型
 * - A: 成功值类型
 *
 * 核心特性：
 * - 惰性求值：创建时不执行，需要显式 run
 * - 类型安全的错误处理：错误是类型的一部分
 * - 可组合：所有操作返回 F，可继续组合
 */

import type { Either } from './Either'

/**
 * F - 核心容器类型
 */
export type F<E, A> = {
  readonly _tag: 'F'
  readonly run: () => Promise<Either<E, A>>
}
