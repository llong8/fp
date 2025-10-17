/**
 * Option - 表示可能存在的值
 */

/**
 * Option 类型定义
 */
export type Option<A> =
  | { readonly _tag: 'Some'; readonly value: A }
  | { readonly _tag: 'None' }

/**
 * 创建 Some
 */
export const some = <A>(value: A): Option<A> => ({
  _tag: 'Some',
  value
})

/**
 * 创建 None
 */
export const none = <A = never>(): Option<A> => ({
  _tag: 'None'
})

/**
 * 检查是否为 Some
 */
export const isSome = <A>(option: Option<A>): option is { _tag: 'Some'; value: A } =>
  option._tag === 'Some'

/**
 * 检查是否为 None
 */
export const isNone = <A>(option: Option<A>): option is { _tag: 'None' } =>
  option._tag === 'None'

/**
 * 获取值或提供默认值
 */
export const getOrElse = <A>(defaultValue: A) => (option: Option<A>): A =>
  option._tag === 'Some' ? option.value : defaultValue

/**
 * 从可空值创建 Option
 */
export const fromNullable = <A>(value: A | null | undefined): Option<A> =>
  value !== null && value !== undefined ? some(value) : none()

/**
 * map - 转换 Some 的值
 */
export const map = <A, B>(f: (a: A) => B) => (option: Option<A>): Option<B> =>
  option._tag === 'Some' ? some(f(option.value)) : none()

/**
 * flatMap - 链式组合
 */
export const flatMap = <A, B>(f: (a: A) => Option<B>) => (option: Option<A>): Option<B> =>
  option._tag === 'Some' ? f(option.value) : none()

/**
 * filter - 根据条件过滤
 */
export const filter = <A>(predicate: (a: A) => boolean) => (option: Option<A>): Option<A> =>
  option._tag === 'Some' && predicate(option.value) ? option : none()

/**
 * match - 模式匹配
 */
export const match = <A, B>(options: {
  onNone: () => B
  onSome: (value: A) => B
}) => (option: Option<A>): B =>
  option._tag === 'Some' ? options.onSome(option.value) : options.onNone()

/**
 * Option 工具命名空间
 */
export const Option = {
  some,
  none,
  isSome,
  isNone,
  getOrElse,
  fromNullable,
  map,
  flatMap,
  filter,
  match
}
