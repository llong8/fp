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

  // 异步测试
  describe('异步支持', () => {
    it('应该处理异步副作用函数', async () => {
      const logs: number[] = []
      const asyncLog = async (x: number) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        logs.push(x)
      }

      const result = await tap(asyncLog)(42)

      expect(logs).toEqual([42])
      expect(result).toBe(42)
    })

    it('应该在异步管道中工作', async () => {
      const logs: string[] = []

      const asyncTapLog = tap(async (x: string) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        logs.push(x)
      })

      const result = await asyncTapLog('test')

      expect(logs).toEqual(['test'])
      expect(result).toBe('test')
    })

    it('应该处理多个异步 tap', async () => {
      const logs: number[] = []

      const asyncTap1 = tap(async (x: number) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        logs.push(x)
      })

      const asyncTap2 = tap(async (x: number) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        logs.push(x * 2)
      })

      const value = 5
      const result1 = await asyncTap1(value)
      const result2 = await asyncTap2(value)

      expect(logs).toEqual([5, 10])
      expect(result1).toBe(5)
      expect(result2).toBe(5)
    })

    it('应该处理异步错误', async () => {
      const asyncFail = tap(async (x: number) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        throw new Error('Async tap error')
      })

      await expect(asyncFail(42)).rejects.toThrow('Async tap error')
    })

    it('应该在 pipe 中与异步函数配合', async () => {
      const logs: number[] = []
      const { pipe } = await import('../src/pipe')

      const result = await pipe(
        5,
        x => x * 2,
        tap(async x => {
          await new Promise(resolve => setTimeout(resolve, 10))
          logs.push(x)
        }),
        x => x + 10,
        tap(async x => {
          await new Promise(resolve => setTimeout(resolve, 10))
          logs.push(x)
        })
      )

      expect(logs).toEqual([10, 20])
      expect(result).toBe(20)
    })

    it('应该正确传递值类型', async () => {
      const asyncTapString = tap(async (x: string) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        console.log(x)
      })

      const result = await asyncTapString('hello')
      expect(typeof result).toBe('string')
      expect(result).toBe('hello')
    })

    it('应该处理复杂对象的异步 tap', async () => {
      const logs: any[] = []
      const user = { name: 'Alice', age: 25 }

      const asyncTapUser = tap(async (u: typeof user) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        logs.push({ ...u })
      })

      const result = await asyncTapUser(user)

      expect(logs).toEqual([{ name: 'Alice', age: 25 }])
      expect(result).toBe(user)
      expect(result).toEqual({ name: 'Alice', age: 25 })
    })
  })

  // Promise 自动解包测试
  describe('Promise 自动解包', () => {
    it('应该自动解包 Promise 值', async () => {
      const logs: string[] = []

      // tap 接收解包后的值，而非 Promise
      const tapped = tap((value: string) => {
        logs.push(value)
      })

      const promiseValue = Promise.resolve('hello')
      const result = await tapped(promiseValue)

      expect(logs).toEqual(['hello'])
      expect(result).toBe(promiseValue) // 返回原始 Promise
    })

    it('应该在 pipe 链中正确处理 Promise 解包', async () => {
      const { pipe } = await import('../src/pipe')
      const logs: any[] = []

      interface User {
        id: number
        name: string
      }

      interface EnrichedUser extends User {
        email: string
      }

      const fetchUser = async (id: number): Promise<User> => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return { id, name: 'Alice' }
      }

      const enrichUser = async (user: User): Promise<EnrichedUser> => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return { ...user, email: 'alice@example.com' }
      }

      const result = await pipe(
        123,
        tap(id => logs.push({ type: 'id', value: id })),

        fetchUser,  // 返回 Promise<User>

        // tap 应该接收 User，而非 Promise<User>
        tap(user => {
          logs.push({ type: 'user', value: user })
          // TypeScript 应该允许访问 user.name
          expect(user.name).toBe('Alice')
        }),

        enrichUser,  // 返回 Promise<EnrichedUser>

        // tap 应该接收 EnrichedUser，而非 Promise<EnrichedUser>
        tap(enrichedUser => {
          logs.push({ type: 'enriched', value: enrichedUser })
          // TypeScript 应该允许访问 enrichedUser.email
          expect(enrichedUser.email).toBe('alice@example.com')
        })
      )

      expect(logs).toEqual([
        { type: 'id', value: 123 },
        { type: 'user', value: { id: 123, name: 'Alice' } },
        { type: 'enriched', value: { id: 123, name: 'Alice', email: 'alice@example.com' } }
      ])
      expect(result).toEqual({ id: 123, name: 'Alice', email: 'alice@example.com' })
    })

    it('应该处理混合同步和异步的 tap', async () => {
      const logs: string[] = []

      // 同步 tap
      const syncTap = tap((value: string) => {
        logs.push(`sync: ${value}`)
      })

      // 异步 tap
      const asyncTap = tap(async (value: string) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        logs.push(`async: ${value}`)
      })

      const promiseValue = Promise.resolve('test')

      // 两种 tap 都应该正确处理 Promise
      const result1 = await syncTap(promiseValue)
      const result2 = await asyncTap(promiseValue)

      expect(logs).toEqual(['sync: test', 'async: test'])
      expect(result1).toBe(promiseValue)
      expect(result2).toBe(promiseValue)
    })

    it('应该保持原始 Promise 引用', async () => {
      const originalPromise = Promise.resolve({ data: 'test' })

      const tapped = tap((value: { data: string }) => {
        expect(value.data).toBe('test')
      })

      const result = await tapped(originalPromise)

      // 应该返回原始 Promise，而不是新的 Promise
      expect(result).toBe(originalPromise)
    })

    it('应该处理嵌套的 Promise', async () => {
      const logs: any[] = []

      const nestedPromise = Promise.resolve(42)

      const tapped = tap((value: number) => {
        logs.push(value)
      })

      const result = await tapped(nestedPromise)

      expect(logs).toEqual([42])
      expect(result).toBe(nestedPromise)
    })
  })
})
