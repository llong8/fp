/**
 * 重试工具（支持错误反馈）
 *
 * 支持：
 * - 指数退避 (Exponential Backoff)
 * - 抖动 (Jitter) - AWS 推荐策略
 * - 选择性重试 (Selective Retry)
 * - 错误反馈 (Error Feedback) - 将错误转换为反馈，传递给下次调用
 * - 自定义回调 (onRetry)
 *
 */

/**
 * 重试配置接口
 */
export interface RetryConfig<TError = Error> {
  /** 最大重试次数（不包含首次尝试） */
  maxRetries: number

  /** 基础延迟（毫秒） */
  baseDelay: number

  /** 最大延迟（毫秒） */
  maxDelay: number

  /**
   * 判断是否应该重试（可选）
   * @param error - 错误对象
   * @param attempt - 当前尝试次数（从 0 开始）
   * @returns true 表示应该重试，false 表示不重试
   */
  shouldRetry?: (error: TError, attempt: number) => boolean

  /**
   * 错误转换器（可选）：将错误转换为反馈消息
   *
   * 当提供此函数时：
   * - 第 1 次调用：fn(undefined)
   * - 第 2 次调用：fn(transformError(error1))
   * - 第 3 次调用：fn(transformError(error2))
   *
   * @param error - 错误对象
   * @param attempt - 当前尝试次数（从 0 开始）
   * @returns 反馈消息（传递给下次调用），返回 undefined 表示不提供反馈（但仍然重试）
   *
   * @example
   * ```typescript
   * transformError: (error) => {
   *   if (error.lc_error_code === 'OUTPUT_PARSING_FAILURE') {
   *     return `⚠️ 上次输出格式错误：${error.message}\n请严格按照 schema 定义返回。`
   *   }
   *   return undefined  // 不提供反馈，但仍然重试
   * }
   * ```
   */
  transformError?: (error: TError, attempt: number) => string | undefined

  /**
   * 重试前的回调
   * @param error - 错误对象
   * @param attempt - 重试次数（从 1 开始）
   * @param delay - 延迟时间（毫秒）
   * @param feedback - 错误反馈消息（如果提供了 transformError）
   */
  onRetry?: (error: TError, attempt: number, delay: number, feedback?: string) => void
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
 * 通用重试函数（指数退避 + 抖动 + 错误反馈）
 *
 * @param fn - 要重试的异步函数（接收可选的错误反馈参数）
 * @param config - 重试配置
 * @returns 函数执行结果
 *
 * @example
 * ```typescript
 * // 示例 1: 普通重试（无反馈）
 * const result = await retry(
 *   (_feedback) => fetchData(),  // 忽略 feedback 参数
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
 *
 * // 示例 2: 带错误反馈的智能重试（用于 LLM 输出格式纠正）
 * const result = await retry(
 *   (feedback) => callLLMWithStructuredOutput(schema, feedback),
 *   {
 *     maxRetries: 3,
 *     baseDelay: 2000,
 *     maxDelay: 30000,
 *     transformError: (error) => {
 *       if (error.lc_error_code === 'OUTPUT_PARSING_FAILURE') {
 *         return `⚠️ 上次输出格式错误：${error.message}\n请严格按照 schema 定义返回 JSON。`
 *       }
 *       return undefined  // 其他错误不提供反馈
 *     },
 *     onRetry: (error, attempt, delay, feedback) => {
 *       console.log(`格式错误，重试 ${attempt}/3`)
 *       if (feedback) {
 *         console.log(`反馈给 LLM: ${feedback}`)
 *       }
 *     }
 *   }
 * )
 * ```
 */
export const retry = async <T, TError = Error>(fn: (feedback?: string) => Promise<T>, config: RetryConfig<TError>): Promise<T> => {
  const { maxRetries, baseDelay, maxDelay, shouldRetry, transformError, onRetry } = config

  let lastFeedback: string | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn(lastFeedback)
    } catch (error) {
      const typedError = error as TError

      // 最后一次尝试，直接抛出错误
      if (attempt === maxRetries - 1) {
        throw typedError
      }

      // 判断是否应该重试
      if (shouldRetry && !shouldRetry(typedError, attempt)) {
        throw typedError
      }

      // 如果提供了 transformError，使用它生成反馈
      if (transformError) {
        lastFeedback = transformError(typedError, attempt)
      }

      // 计算延迟：指数退避 + 完全抖动（AWS 推荐）
      const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      const jitteredDelay = Math.random() * exponentialDelay

      // 执行重试回调
      onRetry?.(typedError, attempt + 1, jitteredDelay, lastFeedback)

      // 等待后重试
      await sleep(jitteredDelay)
    }
  }

  // 理论上不会到达这里，但 TypeScript 需要
  throw new Error('Retry exhausted')
}
