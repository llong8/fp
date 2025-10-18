/**
 * F 组合器 - 转换和组合 F 容器
 */

import type { F } from './core'
import { right, left } from './Either'

/**
 * map - 转换成功值
 *
 * @example
 * pipe(
 *   succeed(5),
 *   map(x => x * 2)
 * )
 */
export const map =
  <A, B>(f: (a: A) => B) =>
  <E>(self: F<E, A>): F<E, B> => ({
    _tag: 'F',
    run: async () => {
      const result = await self.run()
      return result._tag === 'Right' ? right(f(result.right)) : result
    },
  })

/**
 * flatMap - 链式组合 F
 *
 * @example
 * pipe(
 *   succeed(5),
 *   flatMap(x => succeed(x * 2))
 * )
 */
export const flatMap =
  <A, E2, B>(f: (a: A) => F<E2, B>) =>
  <E1>(self: F<E1, A>): F<E1 | E2, B> => ({
    _tag: 'F',
    run: async () => {
      const result = await self.run()
      if (result._tag === 'Left') return result
      return f(result.right).run()
    },
  })

/**
 * tap - 执行副作用但保持原值
 *
 * @example
 * pipe(
 *   succeed(5),
 *   tap(x => console.log('Value:', x))
 * )
 */
export const tap =
  <A>(f: (a: A) => void | Promise<void>) =>
  <E>(self: F<E, A>): F<E, A> => ({
    _tag: 'F',
    run: async () => {
      const result = await self.run()
      if (result._tag === 'Right') {
        await f(result.right)
      }
      return result
    },
  })

/**
 * tapError - 处理错误副作用
 *
 * @example
 * pipe(
 *   someF,
 *   tapError(err => console.error('Error:', err))
 * )
 */
export const tapError =
  <E>(f: (error: E) => void | Promise<void>) =>
  <A>(self: F<E, A>): F<E, A> => ({
    _tag: 'F',
    run: async () => {
      const result = await self.run()
      if (result._tag === 'Left') {
        await f(result.left)
      }
      return result
    },
  })

/**
 * mapError - 转换错误类型
 *
 * @example
 * pipe(
 *   someF,
 *   mapError(err => ({ type: 'CustomError', error: err }))
 * )
 */
export const mapError =
  <E, E2>(f: (error: E) => E2) =>
  <A>(self: F<E, A>): F<E2, A> => ({
    _tag: 'F',
    run: async () => {
      const result = await self.run()
      return result._tag === 'Left' ? left(f(result.left)) : result
    },
  })

/**
 * zip - 组合两个 F
 *
 * @example
 * pipe(
 *   succeed(1),
 *   zip(succeed(2))
 * ) // F<never, [1, 2]>
 */
export const zip =
  <E2, B>(that: F<E2, B>, options?: { concurrent?: boolean }) =>
  <E1, A>(self: F<E1, A>): F<E1 | E2, [A, B]> => ({
    _tag: 'F',
    run: async () => {
      if (options?.concurrent) {
        // 并发执行
        const [result1, result2] = await Promise.all([self.run(), that.run()])

        if (result1._tag === 'Left') return result1
        if (result2._tag === 'Left') return result2

        return right([result1.right, result2.right] as [A, B])
      } else {
        // 顺序执行
        const result1 = await self.run()
        if (result1._tag === 'Left') return result1

        const result2 = await that.run()
        if (result2._tag === 'Left') return result2

        return right([result1.right, result2.right] as [A, B])
      }
    },
  })

/**
 * zipWith - 用自定义函数组合
 *
 * @example
 * pipe(
 *   succeed(1),
 *   zipWith(succeed(2), (a, b) => a + b)
 * ) // F<never, 3>
 */
export const zipWith: <E2, B, A, C>(that: F<E2, B>, f: (a: A, b: B) => C, options?: { concurrent?: boolean }) => <E1>(self: F<E1, A>) => F<E1 | E2, C> = (that, f, options) => self => ({
  _tag: 'F',
  run: async () => {
    const zipResult = await zip(that, options)(self).run()
    if (zipResult._tag === 'Left') return zipResult
    const [a, b] = zipResult.right
    return right(f(a, b))
  },
})

/**
 * all - 聚合多个 F
 *
 * @example
 * all([succeed(1), succeed(2), succeed(3)])
 * // F<never, [1, 2, 3]>
 */
export const all = <E, A>(effects: readonly F<E, A>[], options?: { concurrency?: number | 'unbounded' }): F<E, A[]> => ({
  _tag: 'F',
  run: async () => {
    if (options?.concurrency === 'unbounded') {
      // 无限并发
      const results = await Promise.all(effects.map(e => e.run()))

      // 检查是否有错误
      for (const result of results) {
        if (result._tag === 'Left') return result
      }

      // 所有结果都是 Right，安全地提取值
      return right(
        results.map(r => {
          if (r._tag === 'Right') return r.right
          throw new Error('Unexpected Left after error check')
        }),
      )
    } else {
      // 顺序执行（默认）
      const results: A[] = []
      for (const effect of effects) {
        const result = await effect.run()
        if (result._tag === 'Left') return result
        results.push(result.right)
      }
      return right(results)
    }
  },
})

/**
 * forEach - 迭代应用 F
 *
 * @example
 * forEach([1, 2, 3], n => succeed(n * 2))
 * // F<never, [2, 4, 6]>
 */
export const forEach = <A, E, B>(items: Iterable<A>, f: (a: A, index: number) => F<E, B>, options?: { concurrency?: number | 'unbounded' }): F<E, B[]> => {
  const itemsArray = Array.from(items)
  const effects = itemsArray.map((item, index) => f(item, index))
  return all(effects, options)
}

/**
 * loop - 循环迭代
 *
 * @example
 * loop(0, {
 *   while: n => n < 3,
 *   step: n => n + 1,
 *   body: n => succeed(n * 2)
 * })
 * // F<never, [0, 2, 4]>
 */
export const loop = <S, E, A>(
  initial: S,
  options: {
    while: (state: S) => boolean
    step: (state: S) => S
    body: (state: S) => F<E, A>
  },
): F<E, A[]> => ({
  _tag: 'F',
  run: async () => {
    const results: A[] = []
    let state = initial

    while (options.while(state)) {
      const result = await options.body(state).run()
      if (result._tag === 'Left') return result

      results.push(result.right)
      state = options.step(state)
    }

    return right(results)
  },
})

/**
 * iterate - 迭代
 *
 * @example
 * iterate(0, {
 *   while: n => n < 10,
 *   body: n => succeed(n + 1)
 * })
 * // F<never, 10>
 */
export const iterate = <S, E>(
  initial: S,
  options: {
    while: (state: S) => boolean
    body: (state: S) => F<E, S>
  },
): F<E, S> => ({
  _tag: 'F',
  run: async () => {
    let state = initial

    while (options.while(state)) {
      const result = await options.body(state).run()
      if (result._tag === 'Left') return result
      state = result.right
    }

    return right(state)
  },
})

/**
 * flatten - 展平嵌套的 F
 *
 * @example
 * pipe(
 *   succeed(succeed(42)),
 *   flatten
 * ) // F<never, 42>
 */
export const flatten = <E1, E2, A>(self: F<E1, F<E2, A>>): F<E1 | E2, A> => ({
  _tag: 'F',
  run: async () => {
    const result = await self.run()
    if (result._tag === 'Left') return result
    return result.right.run()
  },
})

/**
 * as - 替换成功值
 *
 * @example
 * pipe(
 *   succeed(42),
 *   as('done')
 * ) // F<never, 'done'>
 */
export const as =
  <B>(value: B) =>
  <E, A>(self: F<E, A>): F<E, B> =>
    map(() => value)(self)

/**
 * asUnit - 替换为 void
 */
export const asUnit = <E, A>(self: F<E, A>): F<E, void> => as(undefined)(self)
