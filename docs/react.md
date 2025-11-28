# react

**ReAct 执行器** - 实现 Reasoning + Acting + Observing 模式，用于需要自我修正的决策场景

## 函数签名

```typescript
function react<TInput, TDecision, TActResult, TSuccess, TError>(
  config: ReactConfig<TInput, TDecision, TActResult, TSuccess, TError>,
  input: TInput
): Promise<ReactResult<TSuccess, TDecision>>
```

## 描述

`react` 函数实现 ReAct 模式（Reasoning + Acting + Observing），用于需要根据执行结果进行自我修正的场景。与 `retry` 不同，`react` 不是简单重复相同操作，而是将错误反馈传递给推理函数，让其做出更好的决策。

## 与 retry 的区别

| 特性 | retry | react |
|------|-------|-------|
| 重试策略 | 相同操作重复执行 | 根据错误反馈调整决策 |
| 适用场景 | 临时故障（网络超时等） | 需要自我修正（LLM 决策错误等） |
| 反馈机制 | 无 | 错误信息传递给 reason 函数 |

## 类型定义

```typescript
// 观察结果
type ObserveResult<TSuccess, TError> =
  | { success: true; data: TSuccess }
  | { success: false; error: TError }

// 配置
interface ReactConfig<TInput, TDecision, TActResult, TSuccess, TError> {
  reason: (input: TInput, feedback?: TError) => Promise<TDecision>
  act: (decision: TDecision) => Promise<TActResult>
  observe: (result: TActResult, decision: TDecision) => ObserveResult<TSuccess, TError>
  isRetryable: (error: TError) => boolean
  onRetry?: (attempt: number, error: TError, decision: TDecision) => void
  maxRetries?: number
}

// 执行结果
interface ReactResult<TSuccess, TDecision> {
  data: TSuccess
  decision: TDecision
  attempts: number
}
```

## 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `config.reason` | `(input, feedback?) => Promise<TDecision>` | 推理函数：根据输入和可选的错误反馈做出决策 |
| `config.act` | `(decision) => Promise<TActResult>` | 行动函数：执行决策，返回原始结果 |
| `config.observe` | `(result, decision) => ObserveResult` | 观察函数：分析行动结果，判断成功或失败 |
| `config.isRetryable` | `(error) => boolean` | 判断错误是否可重试 |
| `config.onRetry` | `(attempt, error, decision) => void` | 可选，重试前的回调 |
| `config.maxRetries` | `number` | 可选，最大重试次数（默认 2） |

## 返回值

- **类型**: `Promise<ReactResult<TSuccess, TDecision>>`
- **描述**: 成功时返回包含 `data`、`decision` 和 `attempts` 的对象，失败时抛出 `ReactError`

## 执行流程

```
reason()        <- 1. 首次推理（无 feedback）
    |
act()           <- 2. 执行
    |
observe()       <- 3. 观察
    |
成功? --是--> 返回成功
    | 否
isRetryable()?
    | 否
抛出错误
    | 是
onRetry()       <- 4. 通知（副作用）
    |
reason()        <- 5. 重新推理（带 feedback）
    |
act()           <- 6. 再次执行
    |
observe()       <- 7. 再次观察
    |
... 循环直到成功或达到 maxRetries
```

## 基础示例

### 示例 1: 简单用法

```typescript
import { react } from '@about-me/fp'

const result = await react({
  reason: async (input, feedback) => {
    if (feedback) {
      return adjustedDecision(input, feedback)
    }
    return initialDecision(input)
  },

  act: async (decision) => {
    return await execute(decision)
  },

  observe: (result, decision) => {
    if (result.error) {
      return { success: false, error: result.error }
    }
    return { success: true, data: result.data }
  },

  isRetryable: (error) => error.type === 'RECOVERABLE',

  maxRetries: 2,
}, input)
```

### 示例 2: 带回调的重试

```typescript
const result = await react({
  reason: async (input, feedback) => {
    if (feedback) {
      console.log('收到反馈，调整决策:', feedback)
      return betterDecision(input, feedback)
    }
    return firstDecision(input)
  },

  act: async (decision) => await callService(decision),

  observe: (result) => {
    if (result.errorCode) {
      return { success: false, error: { code: result.errorCode, message: result.message } }
    }
    return { success: true, data: result }
  },

  isRetryable: (error) => error.code !== 'FATAL',

  onRetry: (attempt, error, decision) => {
    console.log(`决策 ${decision.id} 失败，重试 ${attempt}: ${error.message}`)
  },

  maxRetries: 3,
}, input)
```

## 实际应用

### 应用 1: Agent 选择

```typescript
import { react, type ObserveResult } from '@about-me/fp'

type AgentSelection = {
  primaryAgent: string
  team: string[]
}

type ExecutionError = {
  type: 'agentError' | 'systemError'
  selectedAgent: string
  errorMessage: string
}

const result = await react({
  // 1. Reasoning: LLM 选择 Agent 团队
  reason: async (requirement, feedback) => {
    const feedbackMessage = feedback
      ? `上一次选择失败：
         - 选择的 Agent: ${feedback.selectedAgent}
         - 错误信息: ${feedback.errorMessage}
         请重新选择其他 Agent。`
      : undefined

    return await agentSelector.selectTeam(requirement, feedbackMessage)
  },

  // 2. Acting: 调用选中的 Agent
  act: async (selection) => {
    try {
      const response = await callAgent(selection.primaryAgent)
      return { response, error: undefined }
    } catch (error) {
      return { response: undefined, error }
    }
  },

  // 3. Observing: 分析调用结果
  observe: (result, selection) => {
    if (result.error) {
      return {
        success: false,
        error: {
          type: 'agentError',
          selectedAgent: selection.primaryAgent,
          errorMessage: result.error.message,
        },
      }
    }
    return { success: true, data: { selection, response: result.response } }
  },

  isRetryable: (error) => error.type === 'agentError',

  onRetry: (attempt, error) => {
    console.log(`Agent ${error.selectedAgent} 失败，重试 ${attempt}/2`)
  },

  maxRetries: 2,
}, userRequirement)
```

### 应用 2: 代码生成与修复

```typescript
const result = await react({
  reason: async (task, feedback) => {
    if (feedback) {
      return await llm.generate(`
        之前生成的代码有错误：${feedback.error}
        请修复以下代码：${feedback.code}
      `)
    }
    return await llm.generate(`请完成以下任务：${task}`)
  },

  act: async (code) => {
    const result = await runTests(code)
    return { code, testResult: result }
  },

  observe: (result) => {
    if (!result.testResult.passed) {
      return {
        success: false,
        error: { code: result.code, error: result.testResult.error },
      }
    }
    return { success: true, data: result.code }
  },

  isRetryable: () => true,

  maxRetries: 3,
}, taskDescription)
```

### 应用 3: 智能路由选择

```typescript
const result = await react({
  reason: async (request, feedback) => {
    if (feedback) {
      // 根据失败的服务调整路由
      return selectAlternativeRoute(request, feedback.failedService)
    }
    return selectOptimalRoute(request)
  },

  act: async (route) => {
    return await forwardRequest(route, request)
  },

  observe: (response, route) => {
    if (response.status >= 500) {
      return {
        success: false,
        error: { failedService: route.service, status: response.status },
      }
    }
    return { success: true, data: response }
  },

  isRetryable: (error) => error.status >= 500,

  maxRetries: 2,
}, incomingRequest)
```

## 与 retry 组合使用

`react` 用于决策级重试，`retry` 用于网络级重试，两者可以组合：

```typescript
import { react, retry } from '@about-me/fp'

const result = await react({
  reason: async (requirement, feedback) => {
    // 使用 retry 处理 LLM 调用的网络故障
    return await retry(
      () => agentSelector.selectTeam(requirement, feedback),
      { maxRetries: 3, baseDelay: 2000, maxDelay: 30000 }
    )
  },

  act: async (selection) => {
    // 使用 retry 处理 Agent 调用的网络故障
    return await retry(
      () => callAgent(selection),
      { maxRetries: 2, baseDelay: 1000, maxDelay: 10000 }
    )
  },

  observe: (result, selection) => { ... },

  isRetryable: (error) => error.type === 'agentError',

  maxRetries: 2,  // 决策级重试
}, input)
```

## 错误处理

```typescript
import { react, ReactError } from '@about-me/fp'

try {
  const result = await react(config, input)
  console.log('成功:', result.data)
  console.log('尝试次数:', result.attempts)
} catch (error) {
  if (error instanceof ReactError) {
    console.error(`ReAct 失败，尝试了 ${error.attempts} 次`)
    console.error('最后的决策:', error.lastDecision)
    console.error('最后的错误:', error.error)
  }
}
```

## 注意事项

### 1. observe 接收 decision 参数

```typescript
observe: (result, decision) => {
  // 可以在错误中包含决策上下文
  return {
    success: false,
    error: {
      selectedAgent: decision.primaryAgent,
      errorMessage: result.error,
    },
  }
}
```

### 2. isRetryable 控制重试逻辑

```typescript
isRetryable: (error) => {
  // 返回 false 会立即抛出错误，不再重试
  if (error.type === 'systemError') return false
  return true
}
```

### 3. feedback 在首次调用时为 undefined

```typescript
reason: async (input, feedback) => {
  if (feedback) {
    // 重试时：根据反馈调整决策
    return adjustDecision(input, feedback)
  }
  // 首次调用：正常决策
  return makeDecision(input)
}
```

### 4. ReactError 包含完整上下文

```typescript
class ReactError<TError, TDecision> extends Error {
  error: TError           // 最后一次的错误
  lastDecision: TDecision // 最后一次的决策
  attempts: number        // 总尝试次数
}
```

### 5. maxRetries 默认值为 2

```typescript
// 默认最多尝试 3 次（1 次初始 + 2 次重试）
await react(config, input)

// 自定义重试次数
await react({ ...config, maxRetries: 5 }, input)
```

[<- 返回 API 文档](./README.md)