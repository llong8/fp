/**
 * F 构造器 - 创建 F 容器的各种方式
 */

import type { F } from './core'
import { right, left } from './Either'

/**
 * succeed - 创建成功的 F
 *
 * @example
 * const f = succeed(42)
 */
export const succeed = <A>(value: A): F<never, A> => ({
  _tag: 'F',
  run: async () => right(value)
})

/**
 * fail - 创建失败的 F
 *
 * @example
 * const f = fail('Something went wrong')
 */
export const fail = <E>(error: E): F<E, never> => ({
  _tag: 'F',
  run: async () => left(error)
})

/**
 * try - 从同步函数创建 F，自动捕获异常
 *
 * @example
 * const f = _try({
 *   try: () => JSON.parse(str),
 *   catch: error => 'Parse error'
 * })
 */
export const _try = <E, A>(options: {
  try: () => A
  catch: (error: unknown) => E
}): F<E, A> => ({
  _tag: 'F',
  run: async () => {
    try {
      return right(options.try())
    } catch (error) {
      return left(options.catch(error))
    }
  }
})

/**
 * tryPromise - 从 Promise 创建 F
 *
 * @example
 * const f = tryPromise({
 *   try: () => fetch('/api/data'),
 *   catch: error => ({ type: 'NetworkError', error })
 * })
 */
export const tryPromise = <E, A>(options: {
  try: () => Promise<A>
  catch: (error: unknown) => E
}): F<E, A> => ({
  _tag: 'F',
  run: async () => {
    try {
      const value = await options.try()
      return right(value)
    } catch (error) {
      return left(options.catch(error))
    }
  }
})

/**
 * defer - 延迟创建 F
 *
 * @example
 * const f = defer(() => succeed(computeValue()))
 */
export const defer = <E, A>(thunk: () => F<E, A>): F<E, A> => ({
  _tag: 'F',
  run: () => thunk().run()
})

/**
 * sync - 从同步函数创建 F（不捕获异常）
 *
 * @example
 * const f = sync(() => 42)
 */
export const sync = <A>(thunk: () => A): F<never, A> => ({
  _tag: 'F',
  run: async () => right(thunk())
})

/**
 * async - 从异步函数创建 F（不捕获异常）
 *
 * @example
 * const f = async(() => Promise.resolve(42))
 */
export const _async = <A>(thunk: () => Promise<A>): F<never, A> => ({
  _tag: 'F',
  run: async () => right(await thunk())
})

/**
 * of - succeed 的别名
 */
export const of = succeed
