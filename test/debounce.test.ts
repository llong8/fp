import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from '../src/debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该延迟函数执行', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('应该取消之前的调用', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced()
    debounced()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1) // 只执行最后一次
  })

  it('应该传递参数', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('hello', 'world')
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledWith('hello', 'world')
  })

  it('应该使用最后一次调用的参数', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('first')
    debounced('second')
    debounced('third')

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('third') // 使用最后一次的参数
  })

  it('应该在多次调用后只执行一次', () => {
    const fn = vi.fn((x: number) => x * 2)
    const debounced = debounce(fn, 100)

    debounced(1)
    vi.advanceTimersByTime(50)
    debounced(2)
    vi.advanceTimersByTime(50)
    debounced(3)
    vi.advanceTimersByTime(50)
    debounced(4)

    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(4)
  })

  it('应该在延迟时间后允许再次调用', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)

    debounced()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('应该处理搜索输入场景', () => {
    const searchAPI = vi.fn()
    const debouncedSearch = debounce(searchAPI, 300)

    // 模拟快速输入
    debouncedSearch('h')
    vi.advanceTimersByTime(50)
    debouncedSearch('he')
    vi.advanceTimersByTime(50)
    debouncedSearch('hel')
    vi.advanceTimersByTime(50)
    debouncedSearch('hello')

    expect(searchAPI).not.toHaveBeenCalled()

    // 300ms 不活动后执行
    vi.advanceTimersByTime(300)
    expect(searchAPI).toHaveBeenCalledTimes(1)
    expect(searchAPI).toHaveBeenCalledWith('hello')
  })

  it('应该处理窗口调整大小场景', () => {
    const handleResize = vi.fn()
    const debouncedResize = debounce(handleResize, 250)

    // 模拟连续调整大小
    for (let i = 0; i < 10; i++) {
      debouncedResize()
      vi.advanceTimersByTime(50)
    }

    expect(handleResize).not.toHaveBeenCalled()

    // 停止调整后 250ms 执行
    vi.advanceTimersByTime(250)
    expect(handleResize).toHaveBeenCalledTimes(1)
  })

  it('应该处理表单自动保存场景', () => {
    const autoSave = vi.fn()
    const debouncedSave = debounce(autoSave, 1000)

    // 模拟用户输入
    debouncedSave({ name: 'A' })
    vi.advanceTimersByTime(200)
    debouncedSave({ name: 'Al' })
    vi.advanceTimersByTime(200)
    debouncedSave({ name: 'Ali' })
    vi.advanceTimersByTime(200)
    debouncedSave({ name: 'Alice' })

    expect(autoSave).not.toHaveBeenCalled()

    // 停止输入 1 秒后保存
    vi.advanceTimersByTime(1000)
    expect(autoSave).toHaveBeenCalledTimes(1)
    expect(autoSave).toHaveBeenCalledWith({ name: 'Alice' })
  })

  it('应该处理不同的延迟时间', () => {
    const fn100 = vi.fn()
    const fn500 = vi.fn()
    const debounced100 = debounce(fn100, 100)
    const debounced500 = debounce(fn500, 500)

    debounced100()
    debounced500()

    vi.advanceTimersByTime(100)
    expect(fn100).toHaveBeenCalledTimes(1)
    expect(fn500).not.toHaveBeenCalled()

    vi.advanceTimersByTime(400)
    expect(fn500).toHaveBeenCalledTimes(1)
  })

  it('应该保持原函数不变', () => {
    const original = vi.fn()
    const debounced = debounce(original, 100)

    original('direct')
    expect(original).toHaveBeenCalledWith('direct')

    debounced('debounced')
    vi.advanceTimersByTime(100)
    expect(original).toHaveBeenCalledTimes(2)
  })
})
