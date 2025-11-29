# retry

**重试** - 异步函数重试工具，支持指数退避和抖动策略

## 函数签名

```typescript
function retry<T, TError = Error>(
  fn: (feedback?: string) => Promise<T>,
  config: {
    maxRetries: number
    baseDelay: number
    maxDelay: number
    shouldRetry?: (error: TError, attempt: number) => boolean
    transformError?: (error: TError, attempt: number) => string | undefined
    onRetry?: (error: TError, attempt: number, delay: number, feedback?: string) => void
  }
): Promise<T>
```

## 描述

`retry` 函数为异步操作提供重试能力。当异步函数失败时，会按照指数退避策略等待后重试，并加入随机抖动避免"惊群效应"。这是 AWS 推荐的重试策略。支持错误反馈机制，可以将错误信息转换为反馈并传递给下次调用。

## 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `fn` | `(feedback?: string) => Promise<T>` | 要重试的异步函数，可接收错误反馈参数 |
| `config.maxRetries` | `number` | 最大重试次数（不包含首次尝试） |
| `config.baseDelay` | `number` | 基础延迟（毫秒） |
| `config.maxDelay` | `number` | 最大延迟（毫秒） |
| `config.shouldRetry` | `(error: TError, attempt: number) => boolean` | 可选，判断是否应该重试 |
| `config.transformError` | `(error: TError, attempt: number) => string \| undefined` | 可选，将错误转换为反馈消息 |
| `config.onRetry` | `(error: TError, attempt: number, delay: number, feedback?: string) => void` | 可选，重试前的回调 |

## 返回值

- **类型**: `Promise<T>`
- **描述**: 成功时返回异步函数的结果，失败时抛出最后一次的错误

## 基础示例

### 示例 1: 简单重试

```typescript
import { retry } from '@about-me/fp'

const result = await retry(
  () => fetch('/api/data').then(r => r.json()),
  {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  }
)
```

### 示例 2: 带回调的重试

```typescript
const result = await retry(
  () => fetchUserData(userId),
  {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    onRetry: (error, attempt, delay) => {
      console.log(`重试 ${attempt}/3，延迟 ${Math.round(delay)}ms: ${error.message}`)
    },
  }
)
```

### 示例 3: 选择性重试

```typescript
const result = await retry(
  () => callExternalAPI(),
  {
    maxRetries: 5,
    baseDelay: 500,
    maxDelay: 30000,
    shouldRetry: (error) => {
      // 只重试网络错误和 5xx 错误
      return error.message.includes('network') ||
             error.message.includes('500') ||
             error.message.includes('503')
    },
  }
)
```

## 实际应用

### 应用 1: API 调用重试

```typescript
const fetchWithRetry = async (url: string) => {
  return retry(
    async () => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return response.json()
    },
    {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      shouldRetry: (error) => {
        // 不重试 4xx 客户端错误
        return !error.message.includes('4')
      },
    }
  )
}
```

### 应用 2: 数据库连接重试

```typescript
const connectWithRetry = async () => {
  return retry(
    () => database.connect(),
    {
      maxRetries: 5,
      baseDelay: 2000,
      maxDelay: 30000,
      onRetry: (error, attempt, delay) => {
        logger.warn(`数据库连接失败，重试 ${attempt}/5: ${error.message}`)
      },
    }
  )
}
```

### 应用 3: LLM API 调用

```typescript
const callLLM = async (prompt: string) => {
  return retry(
    () => openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    }),
    {
      maxRetries: 3,
      baseDelay: 2000,
      maxDelay: 30000,
      shouldRetry: (error) => {
        // 重试速率限制和服务器错误
        return error.message.includes('rate_limit') ||
               error.message.includes('500')
      },
      onRetry: (error, attempt, delay) => {
        console.log(`LLM 调用失败，重试 ${attempt}/3 (${Math.round(delay)}ms)`)
      },
    }
  )
}
```

### 应用 4: 文件上传重试

```typescript
const uploadWithRetry = async (file: File) => {
  return retry(
    async () => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error(`Upload failed: ${response.status}`)
      return response.json()
    },
    {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 15000,
    }
  )
}
```

### 应用 5: LLM 输出格式纠正

```typescript
import { retry } from '@about-me/fp'

// 提取 Zod 验证错误
const buildParseErrorFeedback = (error: any): string | undefined => {
  if (error.lc_error_code !== 'OUTPUT_PARSING_FAILURE') {
    return undefined  // 不是格式错误，不提供反馈
  }

  const llmOutput = error.llmOutput || '未知输出'
  const zodErrors = error.error?.issues
    ?.map((issue: any) => `字段 "${issue.path.join('.')}"：${issue.message}`)
    .join('\n') || '未知错误'

  return `上次输出格式错误

你返回的 JSON:
\`\`\`json
${llmOutput}
\`\`\`

验证错误:
${zodErrors}

请严格按照 schema 定义返回。`
}

// 带格式纠正的 LLM 调用
const callLLMWithSchema = async (prompt: string, schema: any) => {
  return retry(
    (errorFeedback?: string) => {
      // 如果有错误反馈，追加到 prompt
      const fullPrompt = errorFeedback
        ? `${prompt}\n\n${errorFeedback}`
        : prompt

      return llm.withStructuredOutput(schema).invoke(fullPrompt)
    },
    {
      maxRetries: 3,
      baseDelay: 2000,
      maxDelay: 30000,
      transformError: buildParseErrorFeedback,  // 提取格式错误
      onRetry: (error, attempt, delay, feedback) => {
        const reason = feedback ? '格式错误' : error.message
        console.log(`LLM 调用失败 (${reason})，重试 ${attempt}/3`)
        if (feedback) {
          console.log('反馈给 LLM:', feedback)
        }
      },
    }
  )
}
```

## 指数退避 + 抖动策略

### 算法说明

```
延迟计算:
1. 指数退避: min(baseDelay * 2^attempt, maxDelay)
2. 完全抖动: random() * 指数退避值

示例 (baseDelay=1000, maxDelay=10000):
- 第 1 次重试: random() * min(1000 * 2^0, 10000) = random() * 1000  (0-1000ms)
- 第 2 次重试: random() * min(1000 * 2^1, 10000) = random() * 2000  (0-2000ms)
- 第 3 次重试: random() * min(1000 * 2^2, 10000) = random() * 4000  (0-4000ms)
- 第 4 次重试: random() * min(1000 * 2^3, 10000) = random() * 8000  (0-8000ms)
- 第 5 次重试: random() * min(1000 * 2^4, 10000) = random() * 10000 (0-10000ms)
```

### 为什么使用抖动

```
没有抖动 (所有客户端同时重试):
Client A: ----X----X----X----X
Client B: ----X----X----X----X
Client C: ----X----X----X----X
          服务器负载集中爆发 (惊群效应)

有抖动 (客户端错开重试):
Client A: --X------X--------X
Client B: ----X--------X------X
Client C: ------X----X----------X
          服务器负载均匀分布
```

## 何时使用

### 适合的场景

- **网络请求** - API 调用、文件上传下载
- **数据库操作** - 连接、查询、事务
- **外部服务调用** - 第三方 API、微服务通信
- **LLM/AI 服务** - OpenAI、Anthropic 等 API
- **消息队列** - 发送消息、消费确认

### 不适合的场景

- **同步操作** - retry 只支持异步函数
- **幂等性问题** - 重复执行会产生副作用的操作（如多次扣款）
- **用户交互** - 需要即时反馈的操作

## 配置建议

### 推荐配置

```typescript
// API 请求 (快速响应)
{ maxRetries: 3, baseDelay: 1000, maxDelay: 10000 }

// 数据库连接 (允许较长等待)
{ maxRetries: 5, baseDelay: 2000, maxDelay: 30000 }

// LLM API (考虑速率限制)
{ maxRetries: 3, baseDelay: 2000, maxDelay: 60000 }

// 关键操作 (保守策略)
{ maxRetries: 10, baseDelay: 1000, maxDelay: 60000 }
```

## 注意事项

### 1. 首次尝试不算重试

```typescript
// maxRetries: 3 表示最多尝试 4 次 (1 次初始 + 3 次重试)
await retry(fn, { maxRetries: 3, baseDelay: 1000, maxDelay: 10000 })
```

### 2. 错误会被抛出

```typescript
try {
  await retry(fn, { maxRetries: 3, baseDelay: 1000, maxDelay: 10000 })
} catch (error) {
  // 这是最后一次尝试的错误
  console.error('所有重试都失败了:', error)
}
```

### 3. shouldRetry 可以提前终止

```typescript
await retry(fn, {
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 10000,
  shouldRetry: (error) => {
    // 返回 false 会立即抛出错误，不再重试
    if (error.message.includes('401')) return false
    return true
  },
})
```

### 4. onRetry 的 attempt 从 1 开始

```typescript
await retry(fn, {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  onRetry: (error, attempt, delay) => {
    // attempt: 1, 2, 3 (不是 0, 1, 2)
    console.log(`第 ${attempt} 次重试`)
  },
})
```

[← 返回 API 文档](./README.md)