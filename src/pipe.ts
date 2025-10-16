/**
 * pipe - 从左到右的函数组合（统一版本，支持同步和异步）
 *
 * 接收一个初始值，依次通过一系列函数进行转换，
 * 每个函数接收上一个函数的输出作为输入。
 *
 * 自动检测 Promise 并切换到异步模式，无需区分 pipe/pipeAsync。
 *
 * @template T - 初始值的类型
 * @param value - 要转换的初始值
 * @param fns - 按顺序应用的函数序列（可以是同步或异步）
 * @returns 应用所有函数后的最终结果（如果有异步函数则返回 Promise）
 *
 * @example
 * // 同步使用
 * const result = pipe(5, x => x * 2, x => x + 10) // 20
 *
 * @example
 * // 异步使用
 * const result = await pipe(
 *   userId,
 *   async id => await fetchUser(id),
 *   user => user.name
 * )
 *
 * @example
 * // Promise 输入
 * const result = await pipe(
 *   Promise.resolve(5),
 *   x => x * 2,
 *   x => x + 10
 * )
 */

// ============================================
// 类型重载
// ============================================

// ============================================
// 同步重载
// ============================================

// 0 个函数：直接返回值
export function pipe<A>(value: A): A

// 1 个函数
export function pipe<A, B>(value: A, fn1: (a: A) => B): B

// 2 个函数
export function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C

// 3 个函数
export function pipe<A, B, C, D>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): D

// 4 个函数
export function pipe<A, B, C, D, E>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E): E

// 5 个函数
export function pipe<A, B, C, D, E, F>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F): F

// 6 个函数
export function pipe<A, B, C, D, E, F, G>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G): G

// 7 个函数
export function pipe<A, B, C, D, E, F, G, H>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H): H

// 8 个函数
export function pipe<A, B, C, D, E, F, G, H, I>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
): I

// 9 个函数
export function pipe<A, B, C, D, E, F, G, H, I, J>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J,
): J

// 10 个函数
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J,
  fn10: (j: J) => K,
): K

// ============================================
// 异步重载
// ============================================

// 1 个函数 - 异步
export function pipe<A, B>(value: A, fn1: (a: A) => Promise<B>): Promise<B>

// 1 个函数 - Promise 输入
export function pipe<A, B>(value: Promise<A>, fn1: (a: A) => B): Promise<B>

// 2 个函数 - 有异步
export function pipe<A, B, C>(value: A, fn1: (a: A) => B | Promise<B>, fn2: (b: B) => C | Promise<C>): Promise<C>

// 2 个函数 - Promise 输入
export function pipe<A, B, C>(value: Promise<A>, fn1: (a: A) => B, fn2: (b: B) => C): Promise<C>

// 3 个函数 - 有异步
export function pipe<A, B, C, D>(value: A, fn1: (a: A) => B | Promise<B>, fn2: (b: B) => C | Promise<C>, fn3: (c: C) => D | Promise<D>): Promise<D>

// 3 个函数 - Promise 输入
export function pipe<A, B, C, D>(value: Promise<A>, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): Promise<D>

// 4 个函数 - 有异步
export function pipe<A, B, C, D, E>(value: A, fn1: (a: A) => B | Promise<B>, fn2: (b: B) => C | Promise<C>, fn3: (c: C) => D | Promise<D>, fn4: (d: D) => E | Promise<E>): Promise<E>

// 4 个函数 - Promise 输入
export function pipe<A, B, C, D, E>(value: Promise<A>, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E): Promise<E>

// 5 个函数 - 有异步
export function pipe<A, B, C, D, E, F>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
): Promise<F>

// 5 个函数 - Promise 输入
export function pipe<A, B, C, D, E, F>(value: Promise<A>, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F): Promise<F>

// 6 个函数 - 有异步
export function pipe<A, B, C, D, E, F, G>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  fn6: (f: F) => G | Promise<G>,
): Promise<G>

// 6 个函数 - Promise 输入
export function pipe<A, B, C, D, E, F, G>(value: Promise<A>, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G): Promise<G>

// 7 个函数 - 有异步
export function pipe<A, B, C, D, E, F, G, H>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  fn6: (f: F) => G | Promise<G>,
  fn7: (g: G) => H | Promise<H>,
): Promise<H>

// 7 个函数 - Promise 输入
export function pipe<A, B, C, D, E, F, G, H>(
  value: Promise<A>,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
): Promise<H>

// 8 个函数 - 有异步
export function pipe<A, B, C, D, E, F, G, H, I>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  fn6: (f: F) => G | Promise<G>,
  fn7: (g: G) => H | Promise<H>,
  fn8: (h: H) => I | Promise<I>,
): Promise<I>

// 8 个函数 - Promise 输入
export function pipe<A, B, C, D, E, F, G, H, I>(
  value: Promise<A>,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
): Promise<I>

// 9 个函数 - 有异步
export function pipe<A, B, C, D, E, F, G, H, I, J>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  fn6: (f: F) => G | Promise<G>,
  fn7: (g: G) => H | Promise<H>,
  fn8: (h: H) => I | Promise<I>,
  fn9: (i: I) => J | Promise<J>,
): Promise<J>

// 9 个函数 - Promise 输入
export function pipe<A, B, C, D, E, F, G, H, I, J>(
  value: Promise<A>,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J,
): Promise<J>

// 10 个函数 - 有异步
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  fn6: (f: F) => G | Promise<G>,
  fn7: (g: G) => H | Promise<H>,
  fn8: (h: H) => I | Promise<I>,
  fn9: (i: I) => J | Promise<J>,
  fn10: (j: J) => K | Promise<K>,
): Promise<K>

// 10 个函数 - Promise 输入
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(
  value: Promise<A>,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J,
  fn10: (j: J) => K,
): Promise<K>

// ============================================
// 实现：运行时自动检测同步/异步
// ============================================

export function pipe<T>(value: T, ...fns: Array<(arg: any) => any>): any {
  let result: any = value

  // 如果初始值是 Promise，进入异步模式
  if (result instanceof Promise) {
    return (async () => {
      let asyncResult = await result
      for (const fn of fns) {
        asyncResult = await fn(asyncResult)
      }
      return asyncResult
    })()
  }

  // 同步模式：遇到 Promise 时切换到异步
  for (let i = 0; i < fns.length; i++) {
    const fn = fns[i]
    if (!fn) continue

    result = fn(result)

    if (result instanceof Promise) {
      return (async () => {
        let asyncResult = await result
        for (let j = i + 1; j < fns.length; j++) {
          const nextFn = fns[j]
          if (!nextFn) continue
          asyncResult = await nextFn(asyncResult)
        }
        return asyncResult
      })()
    }
  }

  return result
}
