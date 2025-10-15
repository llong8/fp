import { describe, it, expect } from 'vitest'
import { partial } from '../src/partial'

describe('partial', () => {
  it('应该固定单个参数', () => {
    const multiply = (a: number, b: number, c: number) => a * b * c
    const multiplyBy2 = partial(multiply, 2)
    expect(multiplyBy2(3, 4)).toBe(24) // 2 * 3 * 4 = 24
  })

  it('应该固定多个参数', () => {
    const multiply = (a: number, b: number, c: number) => a * b * c
    const multiplyBy2And3 = partial(multiply, 2, 3)
    expect(multiplyBy2And3(4)).toBe(24) // 2 * 3 * 4 = 24
  })

  it('应该固定所有参数', () => {
    const add = (a: number, b: number, c: number) => a + b + c
    const addSpecific = partial(add, 1, 2, 3)
    expect(addSpecific()).toBe(6)
  })

  it('应该处理字符串参数', () => {
    const concat = (a: string, b: string, c: string) => a + b + c
    const prependHello = partial(concat, 'Hello ')
    expect(prependHello('World', '!')).toBe('Hello World!')
  })

  it('应该创建专用函数', () => {
    const greet = (greeting: string, name: string) => `${greeting}, ${name}!`
    const sayHello = partial(greet, 'Hello')
    const sayHi = partial(greet, 'Hi')

    expect(sayHello('Alice')).toBe('Hello, Alice!')
    expect(sayHi('Bob')).toBe('Hi, Bob!')
  })

  it('应该处理数组操作', () => {
    const slice = (arr: number[], start: number, end: number) => arr.slice(start, end)
    const numbers = [1, 2, 3, 4, 5]

    const sliceFrom2 = partial(slice, numbers, 2)
    expect(sliceFrom2(4)).toEqual([3, 4])
  })

  it('应该处理对象操作', () => {
    const createUser = (role: string, name: string, age: number) => ({
      role,
      name,
      age,
    })

    const createAdmin = partial(createUser, 'admin')
    expect(createAdmin('Alice', 30)).toEqual({ role: 'admin', name: 'Alice', age: 30 })
  })

  it('应该支持函数组合', () => {
    const add = (a: number, b: number) => a + b
    const add5 = partial(add, 5)
    const add10 = partial(add, 10)

    const numbers = [1, 2, 3]
    expect(numbers.map(add5)).toEqual([6, 7, 8])
    expect(numbers.map(add10)).toEqual([11, 12, 13])
  })

  it('应该保持原函数不变', () => {
    const multiply = (a: number, b: number, c: number) => a * b * c
    const multiplyBy2 = partial(multiply, 2)

    expect(multiply(1, 2, 3)).toBe(6)
    expect(multiplyBy2(2, 3)).toBe(12)
    expect(multiply(1, 2, 3)).toBe(6) // 原函数未受影响
  })
})
