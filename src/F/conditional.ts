/**
 * F 条件逻辑 - when, unless, if 等
 */

import type { F } from './core'
import type { Option } from './Option'
import { some, none } from './Option'
import { right } from './Either'

/**
 * when - 条件执行效果，返回 Option
 *
 * @example
 * pipe(
 *   succeed(5),
 *   when(x => x > 0)  // 返回 Some(5)
 * )
 */
export const when =
  <A>(predicate: (a: A) => boolean) =>
  <E>(self: F<E, A>): F<E, Option<A>> => ({
    _tag: 'F',
    run: async () => {
      const result = await self.run()
      if (result._tag === 'Left') return result as any

      const value = result.right
      if (predicate(value)) {
        return right(some(value))
      }
      return right(none<A>())
    },
  })

/**
 * whenEffect - 条件由另一个 Effect 决定
 *
 * @example
 * pipe(
 *   succeed(user),
 *   whenEffect(u => checkPermission(u))
 * )
 */
export const whenEffect =
  <A, E2>(predicateEffect: (a: A) => F<E2, boolean>) =>
  <E1>(self: F<E1, A>): F<E1 | E2, Option<A>> => ({
    _tag: 'F',
    run: async () => {
      const result = await self.run()
      if (result._tag === 'Left') return result as any

      const value = result.right
      const conditionResult = await predicateEffect(value).run()

      if (conditionResult._tag === 'Left') return conditionResult as any

      if (conditionResult.right) {
        return right(some(value))
      }
      return right(none<A>())
    },
  })

/**
 * unless - when 的反向
 *
 * @example
 * pipe(
 *   succeed(''),
 *   unless(s => s.length > 0)  // 返回 Some('')
 * )
 */
export const unless =
  <A>(predicate: (a: A) => boolean) =>
  <E>(self: F<E, A>): F<E, Option<A>> =>
    when<A>((a: A) => !predicate(a))(self)

/**
 * unlessEffect - whenEffect 的反向
 */
export const unlessEffect =
  <A, E2>(predicateEffect: (a: A) => F<E2, boolean>) =>
  <E1>(self: F<E1, A>): F<E1 | E2, Option<A>> => ({
    _tag: 'F',
    run: async () => {
      const result = await self.run()
      if (result._tag === 'Left') return result as any

      const value = result.right
      const conditionResult = await predicateEffect(value).run()

      if (conditionResult._tag === 'Left') return conditionResult as any

      if (!conditionResult.right) {
        return right(some(value))
      }
      return right(none<A>())
    },
  })

/**
 * if - 基于条件执行两个分支之一
 *
 * @example
 * _if(succeed(true), {
 *   onTrue: () => succeed('yes'),
 *   onFalse: () => succeed('no')
 * })
 */
export const _if = <E, A>(
  condition: F<E, boolean>,
  branches: {
    onTrue: () => F<E, A>
    onFalse: () => F<E, A>
  },
): F<E, A> => ({
  _tag: 'F',
  run: async () => {
    const result = await condition.run()
    if (result._tag === 'Left') return result as any

    const branch = result.right ? branches.onTrue : branches.onFalse
    return branch().run()
  },
})

// 导出为 'if' (处理关键字冲突)
export { _if as if }
