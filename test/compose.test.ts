import { describe, it, expect } from 'vitest'
import { compose } from '../src/compose'

describe('compose', () => {
  it('应该组合单个函数', () => {
    const double = (x: number) => x * 2
    const composed = compose(double)
    expect(composed(5)).toBe(10)
  })

  it('应该从右到左组合多个函数', () => {
    const double = (x: number) => x * 2
    const addTen = (x: number) => x + 10
    const square = (x: number) => x * x

    // compose 从右到左: square(addTen(double(5)))
    const composed = compose(square, addTen, double)
    // 5 * 2 = 10, 10 + 10 = 20, 20 * 20 = 400
    expect(composed(5)).toBe(400)
  })

  it('应该处理字符串转换', () => {
    const trim = (str: string) => str.trim()
    const toUpperCase = (str: string) => str.toUpperCase()
    const addBrackets = (str: string) => `[${str}]`

    // compose 从右到左: addBrackets(toUpperCase(trim(input)))
    const format = compose(addBrackets, toUpperCase, trim)
    expect(format('  hello  ')).toBe('[HELLO]')
  })

  it('应该处理数组转换', () => {
    const filterEven = (arr: number[]) => arr.filter(x => x % 2 === 0)
    const double = (arr: number[]) => arr.map(x => x * 2)
    const sum = (arr: number[]) => arr.reduce((sum, x) => sum + x, 0)

    const composed = compose(sum, double, filterEven)
    // [1,2,3,4,5] -> [2,4] -> [4,8] -> 12
    expect(composed([1, 2, 3, 4, 5])).toBe(12)
  })

  it('应该处理对象转换', () => {
    const addEmail = (user: { name: string }) => ({
      ...user,
      email: `${user.name}@example.com`,
    })
    const addVerified = (user: any) => ({ ...user, verified: true })
    const toUpperName = (user: any) => ({
      ...user,
      name: user.name.toUpperCase(),
    })

    const transform = compose(toUpperName, addVerified, addEmail)
    const result = transform({ name: 'alice' })
    expect(result).toEqual({
      name: 'ALICE',
      email: 'alice@example.com',
      verified: true,
    })
  })

  it('应该与 pipe 相反的顺序执行', () => {
    const add1 = (x: number) => x + 1
    const add2 = (x: number) => x + 2
    const add3 = (x: number) => x + 3

    // compose: add3(add2(add1(0))) = 0+1+2+3 = 6
    const composed = compose(add3, add2, add1)
    expect(composed(0)).toBe(6)
  })

  it('应该处理恒等函数', () => {
    const identity = (x: any) => x
    const composed = compose(identity)
    expect(composed(42)).toBe(42)
    expect(composed('hello')).toBe('hello')
  })
})
