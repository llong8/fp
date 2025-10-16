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

  // 异步测试
  describe('异步支持', () => {
    it('应该处理单个异步函数', async () => {
      const asyncDouble = async (x: number) => x * 2
      const result = await pipe(5, asyncDouble)
      expect(result).toBe(10)
    })

    it('应该处理多个异步函数', async () => {
      const asyncDouble = async (x: number) => x * 2
      const asyncAddTen = async (x: number) => x + 10
      const asyncSquare = async (x: number) => x * x

      const result = await pipe(5, asyncDouble, asyncAddTen, asyncSquare)
      // (5 * 2) = 10, + 10 = 20, ^ 2 = 400
      expect(result).toBe(400)
    })

    it('应该处理同步和异步函数混合', async () => {
      const double = (x: number) => x * 2
      const asyncAddTen = async (x: number) => x + 10
      const square = (x: number) => x * x

      const result = await pipe(5, double, asyncAddTen, square)
      // (5 * 2) = 10, + 10 = 20, ^ 2 = 400
      expect(result).toBe(400)
    })

    it('应该处理 Promise 输入', async () => {
      const double = (x: number) => x * 2
      const addTen = (x: number) => x + 10

      const result = await pipe(Promise.resolve(5), double, addTen)
      expect(result).toBe(20)
    })

    it('应该处理中间出现的 Promise', async () => {
      const double = (x: number) => x * 2
      const asyncAddTen = async (x: number) => x + 10
      const square = (x: number) => x * x

      // 同步 -> 异步 -> 同步
      const result = await pipe(5, double, asyncAddTen, square)
      expect(result).toBe(400)
    })

    it('应该处理异步数组操作', async () => {
      const asyncFilter = async (arr: number[]) => arr.filter(x => x > 2)
      const asyncMap = async (arr: number[]) => arr.map(x => x * 2)
      const reduce = (arr: number[]) => arr.reduce((sum, x) => sum + x, 0)

      const result = await pipe(
        [1, 2, 3, 4, 5],
        asyncFilter,
        asyncMap,
        reduce
      )
      expect(result).toBe(24) // [3,4,5] -> [6,8,10] -> 24
    })

    it('应该正确传递异步错误', async () => {
      const asyncFail = async (x: number) => {
        throw new Error('Async error')
      }

      await expect(pipe(5, asyncFail)).rejects.toThrow('Async error')
    })

    it('应该处理复杂的异步工作流', async () => {
      const fetchUser = async (id: number) => ({
        id,
        name: 'Alice',
        age: 25,
      })
      const extractName = (user: { name: string }) => user.name
      const toUpperCase = (name: string) => name.toUpperCase()
      const asyncAddGreeting = async (name: string) => `Hello, ${name}!`

      const result = await pipe(
        123,
        fetchUser,
        extractName,
        toUpperCase,
        asyncAddGreeting
      )
      expect(result).toBe('Hello, ALICE!')
    })
  })
})
