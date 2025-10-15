import { describe, it, expect } from 'vitest'
import { pipeAsync } from '../src/pipeAsync'

describe('pipeAsync', () => {
  it('应该处理单个异步函数', async () => {
    const asyncDouble = async (x: number) => x * 2
    const result = await pipeAsync(5, asyncDouble)
    expect(result).toBe(10)
  })

  it('应该按顺序执行多个异步函数', async () => {
    const asyncDouble = async (x: number) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return x * 2
    }
    const asyncAddTen = async (x: number) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return x + 10
    }
    const asyncSquare = async (x: number) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return x * x
    }

    const result = await pipeAsync(5, asyncDouble, asyncAddTen, asyncSquare)
    // (5 * 2) = 10, + 10 = 20, ^ 2 = 400
    expect(result).toBe(400)
  })

  it('应该混合同步和异步函数', async () => {
    const syncDouble = (x: number) => x * 2
    const asyncAddTen = async (x: number) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return x + 10
    }
    const syncSquare = (x: number) => x * x

    const result = await pipeAsync(5, syncDouble, asyncAddTen, syncSquare)
    expect(result).toBe(400)
  })

  it('应该处理 await Promise 后的值', async () => {
    const addOne = (x: number) => x + 1
    const asyncDouble = async (x: number) => x * 2

    const initialValue = await Promise.resolve(5)
    const result = await pipeAsync(initialValue, addOne, asyncDouble)
    // 5 -> 6 -> 12
    expect(result).toBe(12)
  })

  it('应该处理异步字符串转换', async () => {
    const asyncTrim = async (str: string) => str.trim()
    const syncToUpper = (str: string) => str.toUpperCase()
    const asyncAddExclamation = async (str: string) => `${str}!`

    const result = await pipeAsync('  hello  ', asyncTrim, syncToUpper, asyncAddExclamation)
    expect(result).toBe('HELLO!')
  })

  it('应该处理异步数组操作', async () => {
    const asyncFilter = async (arr: number[]) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return arr.filter(x => x % 2 === 0)
    }
    const syncMap = (arr: number[]) => arr.map(x => x * 2)
    const asyncSum = async (arr: number[]) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return arr.reduce((sum, x) => sum + x, 0)
    }

    const result = await pipeAsync([1, 2, 3, 4, 5], asyncFilter, syncMap, asyncSum)
    // [1,2,3,4,5] -> [2,4] -> [4,8] -> 12
    expect(result).toBe(12)
  })

  it('应该处理异步对象转换', async () => {
    const asyncAddEmail = async (user: { name: string }) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return {
        ...user,
        email: `${user.name}@example.com`,
      }
    }
    const syncAddVerified = (user: any) => ({ ...user, verified: true })
    const asyncUpperName = async (user: any) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return {
        ...user,
        name: user.name.toUpperCase(),
      }
    }

    const result = await pipeAsync({ name: 'alice' }, asyncAddEmail, syncAddVerified, asyncUpperName)
    expect(result).toEqual({
      name: 'ALICE',
      email: 'alice@example.com',
      verified: true,
    })
  })

  it('应该处理错误传播', async () => {
    const asyncThrow = async () => {
      throw new Error('Test error')
    }
    const neverCalled = () => 'should not be called'

    await expect(pipeAsync(5, asyncThrow, neverCalled)).rejects.toThrow('Test error')
  })

  it('应该按顺序等待执行', async () => {
    const executionOrder: number[] = []

    const step1 = async (x: number) => {
      await new Promise(resolve => setTimeout(resolve, 30))
      executionOrder.push(1)
      return x + 1
    }
    const step2 = async (x: number) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      executionOrder.push(2)
      return x + 1
    }
    const step3 = async (x: number) => {
      await new Promise(resolve => setTimeout(resolve, 20))
      executionOrder.push(3)
      return x + 1
    }

    await pipeAsync(0, step1, step2, step3)
    // 应该按顺序执行，尽管 step1 最慢
    expect(executionOrder).toEqual([1, 2, 3])
  })
})
