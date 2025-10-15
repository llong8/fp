import { describe, it, expect } from 'vitest'
import { curry } from '../src/curry'

describe('curry', () => {
  it('应该柯里化三参数函数', () => {
    const add = (a: number, b: number, c: number) => a + b + c
    const curriedAdd = curry(add)

    expect(curriedAdd(1)(2)(3)).toBe(6)
  })

  it('应该支持部分应用', () => {
    const add = (a: number, b: number, c: number) => a + b + c
    const curriedAdd = curry(add)

    const add5 = curriedAdd(5)
    expect(add5(10)(3)).toBe(18)

    const add5and10 = add5(10)
    expect(add5and10(3)).toBe(18)
  })

  it('应该支持一次性完全应用', () => {
    const multiply = (a: number, b: number) => a * b
    const curriedMultiply = curry(multiply)

    expect(curriedMultiply(3, 4)).toBe(12)
  })

  it('应该创建专用的过滤函数', () => {
    const hasProperty = curry((prop: string, value: any, obj: any) => obj[prop] === value)

    const users = [
      { name: 'Alice', role: 'admin' },
      { name: 'Bob', role: 'user' },
      { name: 'Charlie', role: 'admin' },
    ]

    const isAdmin = hasProperty('role')('admin')
    const admins = users.filter(isAdmin)

    expect(admins).toHaveLength(2)
    expect(admins[0].name).toBe('Alice')
    expect(admins[1].name).toBe('Charlie')
  })

  it('应该处理不同数量的参数', () => {
    const add2 = curry((a: number, b: number) => a + b)
    expect(add2(1)(2)).toBe(3)

    const add4 = curry((a: number, b: number, c: number, d: number) => a + b + c + d)
    expect(add4(1)(2)(3)(4)).toBe(10)
  })
})
