/**
 * ReAct 执行器 (Reasoning + Acting + Observing)
 *
 * 实现 ReAct 模式：推理 → 行动 → 观察 → 再推理
 *
 * 与 retry 的区别：
 * - retry: 相同操作重复执行，适用于临时故障（网络超时等）
 * - react: 根据错误反馈调整决策，适用于需要自我修正的场景（LLM 决策错误等）
 *
 * @example
 * ```typescript
 * const result = await react({
 *   // 推理：根据输入做出决策
 *   reason: async (input, feedback) => {
 *     if (feedback) {
 *       // 根据上次错误调整决策
 *       return adjustedDecision
 *     }
 *     return initialDecision
 *   },
 *
 *   // 行动：执行决策，返回原始结果
 *   act: async (decision) => {
 *     return await execute(decision)
 *   },
 *
 *   // 观察：分析行动结果，判断成功或失败
 *   observe: (result) => {
 *     if (result.error) {
 *       return { success: false, error: result.error }
 *     }
 *     return { success: true, data: result.data }
 *   },
 *
 *   // 判断：是否是可重试的错误
 *   isRetryable: (error) => error.type === 'INVALID_SELECTION',
 *
 *   // 可选：重试回调
 *   onRetry: (attempt, error) => console.log(`重试 ${attempt}...`),
 *
 *   maxRetries: 2,
 * }, input)
 * ```
 */

/**
 * ReAct 观察结果
 */
export type ObserveResult<TSuccess, TError> = { success: true; data: TSuccess } | { success: false; error: TError }

/**
 * ReAct 配置
 *
 * @template TInput - 输入类型
 * @template TDecision - 决策类型（reason 的输出，act 的输入）
 * @template TActResult - 行动原始结果类型（act 的输出，observe 的输入）
 * @template TSuccess - 最终成功数据类型
 * @template TError - 错误类型
 */
export interface ReactConfig<TInput, TDecision, TActResult, TSuccess, TError> {
  /**
   * 推理函数：根据输入（和可选的上次错误反馈）做出决策
   *
   * @param input - 原始输入
   * @param feedback - 上次执行的错误反馈（首次为 undefined）
   * @returns 决策结果
   */
  reason: (input: TInput, feedback?: TError) => Promise<TDecision>

  /**
   * 行动函数：执行决策，返回原始结果
   *
   * @param decision - 决策结果
   * @returns 行动的原始结果（交给 observe 分析）
   */
  act: (decision: TDecision) => Promise<TActResult>

  /**
   * 观察函数：分析行动结果，判断成功或失败
   *
   * @param result - 行动的原始结果
   * @param decision - 当前决策（用于构建错误上下文）
   * @returns 观察结果（成功或失败）
   */
  observe: (result: TActResult, decision: TDecision) => ObserveResult<TSuccess, TError>

  /**
   * 判断是否是可重试的错误
   *
   * @param error - 错误对象
   * @returns true 表示可以重试，false 表示直接失败
   */
  isRetryable: (error: TError) => boolean

  /**
   * 重试前的回调（可选）
   *
   * @param attempt - 重试次数（从 1 开始）
   * @param error - 错误对象
   * @param decision - 导致错误的决策
   */
  onRetry?: (attempt: number, error: TError, decision: TDecision) => void

  /**
   * 最大重试次数（默认 2）
   */
  maxRetries?: number
}

/**
 * ReAct 执行结果
 */
export interface ReactResult<TSuccess, TDecision> {
  /** 最终数据 */
  data: TSuccess

  /** 最终使用的决策 */
  decision: TDecision

  /** 总尝试次数 */
  attempts: number
}

/**
 * ReAct 执行器
 *
 * 实现 ReAct 循环：推理 → 行动 → 观察 → 再推理
 * 

  reason()        ← 1. 首次推理（无 feedback）
      ↓
  act()           ← 2. 执行
      ↓
  observe()       ← 3. 观察
      ↓
  失败? ──否──→ 返回成功
      ↓ 是
  isRetryable()?
      ↓ 否
  抛出错误
      ↓ 是
  onRetry()       ← 4. 通知（副作用）
      ↓
  reason()        ← 5. 重新推理（带 feedback）
      ↓
  act()           ← 6. 再次执行
      ↓
  observe()       ← 7. 再次观察
      ↓
  ... 循环直到成功或达到 maxRetries
  
 *
 * @template TInput - 输入类型
 * @template TDecision - 决策类型
 * @template TActResult - 行动原始结果类型
 * @template TSuccess - 最终成功数据类型
 * @template TError - 错误类型
 *
 * @param config - ReAct 配置
 * @param input - 输入数据
 * @returns 执行结果
 * @throws 当所有重试都失败时抛出最后一个错误
 *
 * @example
 * ```typescript
 * // Agent 选择场景
 * const result = await react({
 *   // 1. Reasoning: LLM 选择 Agent
 *   reason: async (requirement, lastError) => {
 *     if (lastError) {
 *       return await agentSelector.selectWithFeedback(requirement, lastError)
 *     }
 *     return await agentSelector.select(requirement)
 *   },
 *
 *   // 2. Acting: 调用选中的 Agent
 *   act: async (selection) => {
 *     return await callAgent(selection.primaryAgent)
 *   },
 *
 *   // 3. Observing: 分析调用结果
 *   observe: (result, selection) => {
 *     if (result.errorMessage) {
 *       return {
 *         success: false,
 *         error: {
 *           selectedAgent: selection.primaryAgent,
 *           errorMessage: result.errorMessage,
 *         }
 *       }
 *     }
 *     return { success: true, data: result }
 *   },
 *
 *   isRetryable: (error) => error.type === 'agentError',
 *
 *   onRetry: (attempt, error) => {
 *     console.log(`Agent 选择失败，重试 ${attempt}...`)
 *   },
 *
 *   maxRetries: 2,
 * }, userRequirement)
 * ```
 */
export const react = async <TInput, TDecision, TActResult, TSuccess, TError>(
  config: ReactConfig<TInput, TDecision, TActResult, TSuccess, TError>,
  input: TInput,
): Promise<ReactResult<TSuccess, TDecision>> => {
  const { reason, act, observe, isRetryable, onRetry, maxRetries = 2 } = config

  let lastError: TError | undefined
  let lastDecision: TDecision | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // 1. Reasoning: 做出决策（首次无反馈，重试时带上错误反馈）
    const decision = await reason(input, lastError)
    lastDecision = decision

    // 2. Acting: 执行决策
    const actResult = await act(decision)

    // 3. Observing: 观察并分析结果
    const observation = observe(actResult, decision)

    if (observation.success) {
      // 观察到成功，返回结果
      return {
        data: observation.data,
        decision,
        attempts: attempt + 1,
      }
    }

    // 观察到失败，检查是否可重试
    lastError = observation.error

    // 最后一次尝试，不再重试
    if (attempt === maxRetries) {
      break
    }

    // 检查是否是可重试的错误
    if (!isRetryable(observation.error)) {
      break
    }

    // 执行重试回调
    onRetry?.(attempt + 1, observation.error, decision)
  }

  // 所有重试都失败，抛出错误
  throw new ReactError(lastError!, lastDecision!, maxRetries + 1)
}

/**
 * ReAct 错误类
 *
 * 包含错误详情、最后的决策和尝试次数
 */
export class ReactError<TError, TDecision> extends Error {
  constructor(public readonly error: TError, public readonly lastDecision: TDecision, public readonly attempts: number) {
    const errorMessage = typeof error === 'string' ? error : JSON.stringify(error)
    super(`ReAct failed after ${attempts} attempts: ${errorMessage}`)
    this.name = 'ReactError'
  }
}
