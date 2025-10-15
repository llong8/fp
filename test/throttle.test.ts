import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { throttle } from '../src/throttle'

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该立即执行第一次调用', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('应该在延迟时间内忽略后续调用', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled() // 第 1 次：执行
    throttled() // 忽略
    throttled() // 忽略

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('应该在延迟时间后允许再次执行', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled() // 第 1 次：执行
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)

    throttled() // 第 2 次：执行
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('应该传递参数', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('hello', 'world')
    expect(fn).toHaveBeenCalledWith('hello', 'world')
  })

  it('应该处理滚动事件场景', () => {
    const logScroll = vi.fn()
    const throttledScroll = throttle(logScroll, 1000)

    // 模拟快速滚动
    for (let i = 0; i < 10; i++) {
      throttledScroll()
      vi.advanceTimersByTime(100) // 每 100ms 滚动一次
    }

    // 在 1 秒内，只执行第一次
    expect(logScroll).toHaveBeenCalledTimes(1)

    // 1 秒后，允许再次执行
    throttledScroll()
    expect(logScroll).toHaveBeenCalledTimes(2)
  })

  it('应该处理鼠标移动场景', () => {
    const handleMouseMove = vi.fn()
    const throttledMove = throttle(handleMouseMove, 500)

    // 模拟频繁的鼠标移动
    throttledMove({ x: 0, y: 0 })
    expect(handleMouseMove).toHaveBeenCalledTimes(1)

    for (let i = 1; i < 10; i++) {
      throttledMove({ x: i * 10, y: i * 10 })
      vi.advanceTimersByTime(50)
    }

    // 500ms 内只执行第一次
    expect(handleMouseMove).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(50) // 总共 500ms

    throttledMove({ x: 100, y: 100 })
    expect(handleMouseMove).toHaveBeenCalledTimes(2)
  })

  it('应该处理 API 请求限流场景', () => {
    const apiCall = vi.fn()
    const throttledAPI = throttle(apiCall, 2000)

    // 模拟用户点击按钮
    throttledAPI('request1')
    expect(apiCall).toHaveBeenCalledTimes(1)

    // 在 2 秒内的重复点击被忽略
    vi.advanceTimersByTime(500)
    throttledAPI('request2') // 忽略
    vi.advanceTimersByTime(500)
    throttledAPI('request3') // 忽略
    vi.advanceTimersByTime(500)
    throttledAPI('request4') // 忽略

    expect(apiCall).toHaveBeenCalledTimes(1)

    // 2 秒后允许新请求
    vi.advanceTimersByTime(500)
    throttledAPI('request5')
    expect(apiCall).toHaveBeenCalledTimes(2)
  })

  it('应该每隔固定时间执行一次', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 1000)

    // 第 0ms: 执行
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)

    // 第 500ms: 忽略
    vi.advanceTimersByTime(500)
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)

    // 第 1000ms: 执行
    vi.advanceTimersByTime(500)
    throttled()
    expect(fn).toHaveBeenCalledTimes(2)

    // 第 1500ms: 忽略
    vi.advanceTimersByTime(500)
    throttled()
    expect(fn).toHaveBeenCalledTimes(2)

    // 第 2000ms: 执行
    vi.advanceTimersByTime(500)
    throttled()
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('应该处理不同的延迟时间', () => {
    const fn100 = vi.fn()
    const fn500 = vi.fn()
    const throttled100 = throttle(fn100, 100)
    const throttled500 = throttle(fn500, 500)

    throttled100()
    throttled500()
    expect(fn100).toHaveBeenCalledTimes(1)
    expect(fn500).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)

    throttled100() // 允许
    throttled500() // 忽略
    expect(fn100).toHaveBeenCalledTimes(2)
    expect(fn500).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(400)

    throttled500() // 允许
    expect(fn500).toHaveBeenCalledTimes(2)
  })

  it('应该保持原函数不变', () => {
    const original = vi.fn()
    const throttled = throttle(original, 100)

    original('direct')
    expect(original).toHaveBeenCalledWith('direct')

    throttled('throttled')
    expect(original).toHaveBeenCalledTimes(2)
  })

  it('应该使用第一次调用的参数', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('first')
    throttled('second') // 忽略
    throttled('third') // 忽略

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('first') // 使用第一次的参数
  })

  it('应该处理窗口大小调整场景', () => {
    const handleResize = vi.fn()
    const throttledResize = throttle(handleResize, 200)

    // 模拟持续调整窗口大小 1 秒
    for (let i = 0; i < 10; i++) {
      throttledResize()
      vi.advanceTimersByTime(100)
    }

    // 每 200ms 执行一次，1 秒内执行 5 次
    expect(handleResize).toHaveBeenCalledTimes(5)
  })
})
