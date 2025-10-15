import { describe, it, expect } from 'vitest'
import { constant } from '../src/constant'

describe('constant', () => {
  it('应该返回始终相同的数字', () => {
    const getFortyTwo = constant(42)
    expect(getFortyTwo()).toBe(42)
    expect(getFortyTwo()).toBe(42)
    expect(getFortyTwo()).toBe(42)
  })

  it('应该返回始终相同的字符串', () => {
    const getHello = constant('hello')
    expect(getHello()).toBe('hello')
  })

  it('应该返回始终相同的布尔值', () => {
    const getTrue = constant(true)
    const getFalse = constant(false)
    expect(getTrue()).toBe(true)
    expect(getFalse()).toBe(false)
  })

  it('应该用于数组映射', () => {
    const numbers = [1, 2, 3, 4, 5]
    const result = numbers.map(constant('x'))
    expect(result).toEqual(['x', 'x', 'x', 'x', 'x'])
  })

  it('应该用于数组填充', () => {
    const zeros = [1, 2, 3].map(constant(0))
    expect(zeros).toEqual([0, 0, 0])
  })

  it('应该返回相同的对象引用', () => {
    const defaultUser = { name: 'Guest', role: 'user' }
    const getDefaultUser = constant(defaultUser)

    const user1 = getDefaultUser()
    const user2 = getDefaultUser()

    expect(user1).toBe(user2) // 同一个引用
    expect(user1).toEqual({ name: 'Guest', role: 'user' })
  })

  it('应该返回相同的数组引用', () => {
    const defaultArray = [1, 2, 3]
    const getArray = constant(defaultArray)

    const arr1 = getArray()
    const arr2 = getArray()

    expect(arr1).toBe(arr2) // 同一个引用
  })

  it('应该用作默认值提供者', () => {
    const getConfig = (override?: any) => override || constant({ debug: false })()

    expect(getConfig()).toEqual({ debug: false })
    expect(getConfig({ debug: true })).toEqual({ debug: true })
  })

  it('应该忽略传入的参数', () => {
    const getFortyTwo = constant(42)
    expect(getFortyTwo()).toBe(42)
    expect(getFortyTwo('ignored')).toBe(42)
    expect(getFortyTwo(1, 2, 3)).toBe(42)
  })

  it('应该用于创建占位符函数', () => {
    const noop = constant(undefined)
    expect(noop()).toBe(undefined)

    const alwaysNull = constant(null)
    expect(alwaysNull()).toBe(null)
  })

  it('应该在函数组合中使用', () => {
    const double = (x: number) => x * 2
    const ignoreInput = constant(10)

    // 无论输入是什么，总是返回 10 然后加倍
    const result = double(ignoreInput())
    expect(result).toBe(20)
  })

  it('应该创建多个独立的常量函数', () => {
    const getOne = constant(1)
    const getTwo = constant(2)
    const getThree = constant(3)

    expect(getOne()).toBe(1)
    expect(getTwo()).toBe(2)
    expect(getThree()).toBe(3)
  })
})
