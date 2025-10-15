import { describe, it, expect, vi } from 'vitest'
import { memoize } from '../src/memoize'

describe('memoize', () => {
  it('应该缓存函数结果', () => {
    const fn = vi.fn((x: number) => x * 2)
    const memoized = memoize(fn)

    expect(memoized(5)).toBe(10)
    expect(memoized(5)).toBe(10)
    expect(fn).toHaveBeenCalledTimes(1) // 只调用一次
  })

  it('应该为不同参数分别缓存', () => {
    const fn = vi.fn((x: number) => x * 2)
    const memoized = memoize(fn)

    expect(memoized(5)).toBe(10)
    expect(memoized(10)).toBe(20)
    expect(memoized(5)).toBe(10)
    expect(fn).toHaveBeenCalledTimes(2) // 为 5 和 10 各调用一次
  })

  it('应该处理字符串参数', () => {
    const fn = vi.fn((str: string) => str.toUpperCase())
    const memoized = memoize(fn)

    expect(memoized('hello')).toBe('HELLO')
    expect(memoized('hello')).toBe('HELLO')
    expect(memoized('world')).toBe('WORLD')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('应该加速斐波那契计算', () => {
    let callCount = 0
    const fibonacci = memoize((n: number): number => {
      callCount++
      if (n <= 1) return n
      return fibonacci(n - 1) + fibonacci(n - 2)
    })

    const result = fibonacci(10)
    expect(result).toBe(55)
    // 使用 memoize 后，调用次数应该大幅减少
    expect(callCount).toBeLessThan(20) // 不使用缓存会是 177 次
  })

  it('应该处理对象参数', () => {
    const fn = vi.fn((obj: { x: number }) => obj.x * 2)
    const memoized = memoize(fn)

    const obj1 = { x: 5 }
    const obj2 = { x: 10 }

    expect(memoized(obj1)).toBe(10)
    expect(memoized(obj1)).toBe(10) // 使用缓存
    expect(memoized(obj2)).toBe(20)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('应该处理返回对象的函数', () => {
    const fn = vi.fn((id: number) => ({ id, name: `User${id}` }))
    const memoized = memoize(fn)

    const user1 = memoized(1)
    const user1Again = memoized(1)

    expect(user1).toEqual({ id: 1, name: 'User1' })
    expect(user1).toBe(user1Again) // 同一个对象引用
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('应该处理计算密集型操作', () => {
    const expensiveCalculation = vi.fn((n: number) => {
      let result = 0
      for (let i = 0; i < n; i++) {
        result += i
      }
      return result
    })
    const memoized = memoize(expensiveCalculation)

    expect(memoized(1000)).toBe(499500)
    expect(memoized(1000)).toBe(499500)
    expect(memoized(1000)).toBe(499500)
    expect(expensiveCalculation).toHaveBeenCalledTimes(1)
  })

  it('应该处理 null 和 undefined', () => {
    const fn = vi.fn((x: any) => String(x))
    const memoized = memoize(fn)

    expect(memoized(null)).toBe('null')
    expect(memoized(null)).toBe('null')
    expect(memoized(undefined)).toBe('undefined')
    expect(memoized(undefined)).toBe('undefined')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('应该处理布尔值', () => {
    const fn = vi.fn((bool: boolean) => (bool ? 'yes' : 'no'))
    const memoized = memoize(fn)

    expect(memoized(true)).toBe('yes')
    expect(memoized(true)).toBe('yes')
    expect(memoized(false)).toBe('no')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('应该保持原函数不变', () => {
    const original = (x: number) => x * 2
    const memoized = memoize(original)

    expect(original(5)).toBe(10)
    expect(memoized(5)).toBe(10)
    expect(original(5)).toBe(10) // 原函数不受影响
  })

  it('应该缓存零值', () => {
    const fn = vi.fn((x: number) => x * 0)
    const memoized = memoize(fn)

    expect(memoized(5)).toBe(0)
    expect(memoized(5)).toBe(0)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
