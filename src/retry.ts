/**
 * 重试工具
 *
 * 支持：
 * - 指数退避 (Exponential Backoff)
 * - 抖动 (Jitter) - AWS 推荐策略
 * - 选择性重试 (Selective Retry)
 * - 自定义回调 (onRetry)
 *
 */

/**
 * 重试配置接口
 */
export interface RetryConfig {
  /** 最大重试次数（不包含首次尝试） */
  maxRetries: number

  /** 基础延迟（毫秒） */
  baseDelay: number

  /** 最大延迟（毫秒） */
  maxDelay: number

  /**
   * 判断是否应该重试
   * @param error - 错误对象
   * @param attempt - 当前尝试次数（从 0 开始）
   * @returns true 表示应该重试，false 表示不重试
   */
  shouldRetry?: (error: Error, attempt: number) => boolean

  /**
   * 重试前的回调
   * @param error - 错误对象
   * @param attempt - 重试次数（从 1 开始）
   * @param delay - 延迟时间（毫秒）
   */
  onRetry?: (error: Error, attempt: number, delay: number) => void
}

/**
 * 默认重试配置
 */
export const defaultRetryConfig: Partial<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 秒
  maxDelay: 10000, // 10 秒
  shouldRetry: () => true,
}

/**
 * 延迟函数
 * @param ms - 延迟毫秒数
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 通用重试函数（指数退避 + 抖动 + 选择性重试）
 *
 * @param fn - 要重试的异步函数
 * @param config - 重试配置
 * @returns 函数执行结果
 *
 * @example
 * ```typescript
 * const result = await retry(
 *   () => fetchData(),
 *   {
 *     maxRetries: 3,
 *     baseDelay: 1000,
 *     maxDelay: 10000,
 *     shouldRetry: (error) => error.message.includes('timeout'),
 *     onRetry: (error, attempt, delay) => {
 *       console.log(`重试 ${attempt}/3，延迟 ${delay}ms`)
 *     }
 *   }
 * )
 * ```
 */
export const retry = async <T>(fn: () => Promise<T>, config: RetryConfig): Promise<T> => {
  const { maxRetries, baseDelay, maxDelay, shouldRetry = defaultRetryConfig.shouldRetry!, onRetry } = config

  let lastError: Error

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // 最后一次尝试，直接抛出错误
      if (attempt === maxRetries - 1) {
        throw lastError
      }

      // 判断是否应该重试
      if (!shouldRetry(lastError, attempt)) {
        throw lastError
      }

      // 计算延迟：指数退避 + 完全抖动（AWS 推荐）
      const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      const jitteredDelay = Math.random() * exponentialDelay

      // 执行重试回调
      onRetry?.(lastError, attempt + 1, jitteredDelay)

      // 等待后重试
      await sleep(jitteredDelay)
    }
  }

  // 理论上不会到达这里，但 TypeScript 需要
  throw lastError!
}
