import { describe, it, expect } from 'vitest'
import { identity } from '../src/identity'

describe('identity', () => {
  it('应该返回数字', () => {
    expect(identity(42)).toBe(42)
    expect(identity(0)).toBe(0)
    expect(identity(-10)).toBe(-10)
  })

  it('应该返回字符串', () => {
    expect(identity('hello')).toBe('hello')
    expect(identity('')).toBe('')
  })

  it('应该返回布尔值', () => {
    expect(identity(true)).toBe(true)
    expect(identity(false)).toBe(false)
  })

  it('应该返回数组', () => {
    const arr = [1, 2, 3]
    expect(identity(arr)).toBe(arr)
    expect(identity(arr)).toEqual([1, 2, 3])
  })

  it('应该返回对象', () => {
    const obj = { name: 'Alice', age: 30 }
    expect(identity(obj)).toBe(obj)
    expect(identity(obj)).toEqual({ name: 'Alice', age: 30 })
  })

  it('应该返回 null 和 undefined', () => {
    expect(identity(null)).toBe(null)
    expect(identity(undefined)).toBe(undefined)
  })

  it('应该用于过滤假值', () => {
    const mixedArray = [1, 0, 'hello', '', null, undefined, false, true, NaN]
    const truthyValues = mixedArray.filter(identity)
    expect(truthyValues).toEqual([1, 'hello', true])
  })

  it('应该用作默认转换函数', () => {
    const transform = <T>(value: T, fn: (v: T) => T = identity) => fn(value)
    expect(transform(10)).toBe(10)
    expect(transform(10, x => x * 2)).toBe(20)
  })

  it('应该用于数组映射（创建副本）', () => {
    const original = [1, 2, 3]
    const copy = original.map(identity)
    expect(copy).toEqual([1, 2, 3])
    expect(copy).not.toBe(original) // 不是同一个引用
  })

  it('应该保持类型不变', () => {
    type User = { name: string; age: number }
    const user: User = { name: 'Alice', age: 30 }
    const result = identity(user)
    // TypeScript 应该推断 result 类型为 User
    expect(result.name).toBe('Alice')
    expect(result.age).toBe(30)
  })

  it('应该在函数组合中使用', () => {
    const add10 = (x: number) => x + 10
    const compose = <T>(f: (x: T) => T, g: (x: T) => T) => (x: T) => f(g(x))

    const withIdentity = compose(add10, identity)
    expect(withIdentity(5)).toBe(15)
  })
})
