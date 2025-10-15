import { describe, it, expect } from 'vitest'
import { pipe } from '../src/pipe'

describe('pipe', () => {
  it('应该处理单个函数', () => {
    const double = (x: number) => x * 2
    const result = pipe(5, double)
    expect(result).toBe(10)
  })

  it('应该处理多个函数', () => {
    const double = (x: number) => x * 2
    const addTen = (x: number) => x + 10
    const square = (x: number) => x * x

    const result = pipe(5, double, addTen, square)
    // (5 * 2) = 10, + 10 = 20, ^ 2 = 400
    expect(result).toBe(400)
  })

  it('应该处理字符串', () => {
    const trim = (str: string) => str.trim()
    const toUpperCase = (str: string) => str.toUpperCase()
    const addExclamation = (str: string) => `${str}!`

    const result = pipe('  hello  ', trim, toUpperCase, addExclamation)
    expect(result).toBe('HELLO!')
  })

  it('应该处理数组', () => {
    const result = pipe(
      [1, 2, 3, 4, 5],
      arr => arr.filter(x => x % 2 === 0),
      arr => arr.map(x => x * 2),
      arr => arr.reduce((sum, x) => sum + x, 0)
    )
    expect(result).toBe(12) // [2,4] -> [4,8] -> 12
  })

  it('应该处理对象', () => {
    const addEmail = (user: { name: string }) => ({
      ...user,
      email: `${user.name}@example.com`,
    })
    const addVerified = (user: any) => ({ ...user, verified: true })

    const result = pipe({ name: 'alice' }, addEmail, addVerified)
    expect(result).toEqual({
      name: 'alice',
      email: 'alice@example.com',
      verified: true,
    })
  })

  it('应该处理恒等函数', () => {
    const identity = (x: any) => x
    const result = pipe(42, identity)
    expect(result).toBe(42)
  })
})
