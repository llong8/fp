/**
 * Either - 表示成功或失败的结果
 */

/**
 * Either 类型定义
 * - Left: 表示失败，包含错误值
 * - Right: 表示成功，包含成功值
 */
export type Either<E, A> =
  | { readonly _tag: 'Left'; readonly left: E }
  | { readonly _tag: 'Right'; readonly right: A }

/**
 * 创建 Left（失败）
 */
export const left = <E>(error: E): Either<E, never> => ({
  _tag: 'Left',
  left: error
})

/**
 * 创建 Right（成功）
 */
export const right = <A>(value: A): Either<never, A> => ({
  _tag: 'Right',
  right: value
})

/**
 * 检查是否为 Left
 */
export const isLeft = <E, A>(either: Either<E, A>): either is { _tag: 'Left'; left: E } =>
  either._tag === 'Left'

/**
 * 检查是否为 Right
 */
export const isRight = <E, A>(either: Either<E, A>): either is { _tag: 'Right'; right: A } =>
  either._tag === 'Right'

/**
 * 获取值或提供默认值
 */
export const getOrElse = <A>(defaultValue: A) => <E>(either: Either<E, A>): A =>
  either._tag === 'Right' ? either.right : defaultValue

/**
 * map - 转换 Right 的值
 */
export const map = <A, B>(f: (a: A) => B) => <E>(either: Either<E, A>): Either<E, B> =>
  either._tag === 'Right' ? right(f(either.right)) : either

/**
 * mapLeft - 转换 Left 的值
 */
export const mapLeft = <E, E2>(f: (e: E) => E2) => <A>(either: Either<E, A>): Either<E2, A> =>
  either._tag === 'Left' ? left(f(either.left)) : either

/**
 * flatMap - 链式组合
 */
export const flatMap = <A, E2, B>(f: (a: A) => Either<E2, B>) =>
  <E1>(either: Either<E1, A>): Either<E1 | E2, B> =>
    either._tag === 'Right' ? f(either.right) : either

/**
 * match - 模式匹配
 */
export const match = <E, A, B>(options: {
  onLeft: (error: E) => B
  onRight: (value: A) => B
}) => (either: Either<E, A>): B =>
  either._tag === 'Left' ? options.onLeft(either.left) : options.onRight(either.right)

/**
 * Either 工具命名空间
 */
export const Either = {
  left,
  right,
  isLeft,
  isRight,
  getOrElse,
  map,
  mapLeft,
  flatMap,
  match
}
