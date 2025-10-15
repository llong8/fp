import { describe, it, expect, vi } from 'vitest'
import { tap } from '../src/tap'

describe('tap', () => {
  it('应该执行函数但返回原始值', () => {
    const value = 42
    const fn = vi.fn()

    const result = tap(fn)(value)

    expect(fn).toHaveBeenCalledWith(42)
    expect(result).toBe(42)
  })

  it('应该在管道中工作', () => {
    const logs: number[] = []

    const result = [1, 2, 3]
      .map(x => x * 2)
      .map(tap(x => logs.push(x)))
      .filter(x => x > 2)

    expect(logs).toEqual([2, 4, 6])
    expect(result).toEqual([4, 6])
  })

  it('应该不修改值', () => {
    const obj = { count: 0 }

    const result = tap((x: { count: number }) => {
      // 尝试修改（不良实践，但测试 tap 不会阻止它）
      x.count = 100
    })(obj)

    // tap 返回原始引用
    expect(result).toBe(obj)
    expect(result.count).toBe(100) // 修改发生了
  })

  it('应该处理多个 tap', () => {
    const log1 = vi.fn()
    const log2 = vi.fn()
    const log3 = vi.fn()

    const value = 'test'
    tap(log1)(value)
    tap(log2)(value)
    tap(log3)(value)

    expect(log1).toHaveBeenCalledWith('test')
    expect(log2).toHaveBeenCalledWith('test')
    expect(log3).toHaveBeenCalledWith('test')
  })
})
