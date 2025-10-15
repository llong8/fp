# pipeAsync

**异步管道** - 支持 Promise 的从左到右函数组合

## 函数签名

```typescript
function pipeAsync<T>(
  value: T,
  ...fns: Array<(arg: any) => any | Promise<any>>
): Promise<any>
```

## 描述

`pipeAsync` 是 `pipe` 的异步版本，用于组合异步操作。它将初始值依次传递给一系列函数（可以是同步或异步），每个函数的输出作为下一个函数的输入。所有异步操作会按顺序执行，等待前一个完成后再执行下一个。

## 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `value` | `T` | 初始值，传递给第一个函数 |
| `...fns` | `Array<(arg: any) => any \| Promise<any>>` | 要依次执行的函数列表，可以是同步或异步函数 |

## 返回值

- **类型**: `Promise<any>`
- **描述**: 返回一个 Promise，resolve 为最后一个函数的返回值

## 基础示例

### 示例 1: 用户数据处理

```typescript
import { pipeAsync } from '@about-me/fp'

interface User {
  id: number
  name: string
  email: string
}

const fetchUserFromDB = async (userId: number): Promise<User> => {
  const response = await fetch(`/api/users/${userId}`)
  return response.json()
}

const validateUser = async (user: User): Promise<User> => {
  if (!user.email.includes('@')) {
    throw new Error('Invalid email')
  }
  return user
}

const enrichWithProfile = async (user: User): Promise<User> => {
  const profile = await fetch(`/api/profiles/${user.id}`).then(r => r.json())
  return { ...user, profile }
}

const processUser = async (userId: number) => {
  return await pipeAsync(
    userId,
    fetchUserFromDB,      // 从数据库获取
    validateUser,         // 验证数据
    enrichWithProfile     // 丰富信息
  )
}

processUser(123).then(user => {
  console.log('处理完成:', user)
})
```

### 示例 2: API 数据处理

```typescript
interface APIResponse {
  data: any[]
  metadata: { page: number; total: number }
}

const fetchFromAPI = async (endpoint: string): Promise<APIResponse> => {
  const response = await fetch(endpoint)
  return response.json()
}

// 同步函数
const extractData = (response: APIResponse) => response.data

// 同步函数
const filterActive = (items: any[]) =>
  items.filter(item => item.status === 'active')

// 异步函数
const transformToViewModel = async (items: any[]) => {
  return items.map(item => ({
    id: item.id,
    displayName: item.name.toUpperCase(),
    isActive: item.status === 'active'
  }))
}

const processAPIData = async (endpoint: string) => {
  return await pipeAsync(
    endpoint,
    fetchFromAPI,           // 异步
    extractData,            // 同步
    filterActive,           // 同步
    transformToViewModel    // 异步
  )
}

processAPIData('/api/items').then(items => {
  console.log('处理结果:', items)
})
```

## 实际应用

### 应用 1: 认证流程

```typescript
interface Credentials {
  username: string
  password: string
}

interface AuthToken {
  token: string
  expiresIn: number
}

const validateCredentials = async (creds: Credentials): Promise<Credentials> => {
  if (creds.username.length < 3) {
    throw new Error('用户名太短')
  }
  return creds
}

const authenticateWithServer = async (creds: Credentials): Promise<AuthToken> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(creds)
  })
  return response.json()
}

const fetchUserProfile = async (token: AuthToken) => {
  const response = await fetch('/api/user/profile', {
    headers: { Authorization: `Bearer ${token.token}` }
  })
  return response.json()
}

const storeAuthToken = async (authData: any) => {
  localStorage.setItem('authToken', authData.token)
  return authData
}

const login = async (credentials: Credentials) => {
  return await pipeAsync(
    credentials,
    validateCredentials,        // 1. 验证输入
    authenticateWithServer,     // 2. 服务器认证
    fetchUserProfile,           // 3. 获取用户信息
    storeAuthToken             // 4. 存储令牌
  )
}

login({ username: 'alice', password: 'secret123' })
  .then(user => console.log('登录成功:', user))
  .catch(error => console.error('登录失败:', error))
```

### 应用 2: 文件处理管道

```typescript
const readFile = async (filePath: string): Promise<string> => {
  const fs = require('fs').promises
  return await fs.readFile(filePath, 'utf-8')
}

const parseLines = (content: string): string[] => {
  return content.split('\n')
}

const filterComments = (lines: string[]): string[] => {
  return lines.filter(line => !line.startsWith('#'))
}

const trimLines = (lines: string[]): string[] => {
  return lines.map(line => line.trim())
}

const filterEmpty = (lines: string[]): string[] => {
  return lines.filter(line => line.length > 0)
}

const writeFile = async (lines: string[]): Promise<string> => {
  const fs = require('fs').promises
  const content = lines.join('\n')
  await fs.writeFile('/output.txt', content)
  return content
}

const processFile = async (filePath: string) => {
  return await pipeAsync(
    filePath,
    readFile,         // 异步读取
    parseLines,       // 解析行
    filterComments,   // 过滤注释
    trimLines,        // 修剪空格
    filterEmpty,      // 过滤空行
    writeFile         // 异步写入
  )
}

processFile('/input.txt')
  .then(result => console.log('文件处理完成'))
  .catch(error => console.error('处理失败:', error))
```

### 应用 3: AI 提供商集成

```typescript
interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface APIRequest {
  model: string
  messages: any[]
  max_tokens: number
}

// 转换消息格式
const convertMessagesToAnthropicFormat = (messages: Message[]) => {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }))
}

// 创建 API 请求
const createAPIRequest = (model: string) => (messages: any[]): APIRequest => ({
  model,
  messages,
  max_tokens: 1024
})

// 调用 API
const callAnthropicAPI = async (request: APIRequest) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || ''
    },
    body: JSON.stringify(request)
  })
  return response.json()
}

// 提取文本
const extractTextFromResponse = (response: any): string => {
  return response.content[0].text
}

// 组合管道
const generateResponse = async (messages: Message[]) => {
  return await pipeAsync(
    messages,
    convertMessagesToAnthropicFormat,
    createAPIRequest('claude-3-sonnet-20240229'),
    callAnthropicAPI,
    extractTextFromResponse
  )
}

generateResponse([
  { role: 'user', content: 'Hello, Claude!' }
]).then(response => {
  console.log('AI 响应:', response)
})
```

## 错误处理

### 错误传播

pipeAsync 中的任何函数抛出错误都会中断整个管道：

```typescript
const step1 = async (value: number) => {
  console.log('步骤 1:', value)
  return value * 2
}

const step2 = async (value: number) => {
  console.log('步骤 2:', value)
  if (value > 50) {
    throw new Error('值太大!')
  }
  return value + 10
}

const step3 = async (value: number) => {
  console.log('步骤 3:', value)
  return value / 2
}

// 正常执行
await pipeAsync(10, step1, step2, step3)
// 步骤 1: 10
// 步骤 2: 20
// 步骤 3: 30
// 结果: 15

// 错误情况
try {
  await pipeAsync(30, step1, step2, step3)
  // 步骤 1: 30
  // 步骤 2: 60
  // 抛出错误，步骤 3 不会执行
} catch (error) {
  console.error('管道失败:', error.message)
}
```

### 错误恢复

可以在管道中添加错误恢复步骤：

```typescript
const withErrorRecovery = async (fn: Function) => {
  return async (value: any) => {
    try {
      return await fn(value)
    } catch (error) {
      console.error('步骤失败，使用默认值')
      return value  // 返回原值继续
    }
  }
}

const safeProcessing = async (input: number) => {
  return await pipeAsync(
    input,
    step1,
    withErrorRecovery(step2),  // 这步失败不会中断
    step3
  )
}
```

## 与 pipe 的区别

```typescript
import { pipe, pipeAsync } from '@about-me/fp'

// pipe: 同步函数组合
const result1 = pipe(
  5,
  x => x * 2,      // 10
  x => x + 10,     // 20
  x => x / 2       // 10
)

// pipeAsync: 异步函数组合
const result2 = await pipeAsync(
  5,
  async x => x * 2,      // 10
  async x => x + 10,     // 20
  async x => x / 2       // 10
)
```

## 注意事项

### 1. 必须使用 await

pipeAsync 返回 Promise，必须使用 await 或 .then()：

```typescript
// 错误
const result = pipeAsync(value, fn1, fn2)  // 得到 Promise 对象

// 正确
const result = await pipeAsync(value, fn1, fn2)
```

### 2. 顺序执行

所有函数按顺序执行，不是并行：

```typescript
const result = await pipeAsync(
  value,
  async x => {
    await delay(1000)  // 等待 1 秒
    return x * 2
  },
  async x => {
    await delay(1000)  // 再等待 1 秒
    return x + 10
  }
)
// 总共需要 2 秒，不是 1 秒
```

### 3. 类型推断

TypeScript 可能无法完美推断复杂异步链的类型：

```typescript
interface User { name: string; age: number }

const processUser = async (userId: number): Promise<User> => {
  return await pipeAsync(
    userId,
    async (id: number): Promise<User> => ({ name: 'Alice', age: 25 }),
    async (user: User): Promise<User> => ({ ...user, age: user.age + 1 })
  )
}
```

### 4. 错误处理必不可少

务必使用 try/catch 或 .catch() 处理错误：

```typescript
// 推荐
try {
  const result = await pipeAsync(value, fn1, fn2, fn3)
} catch (error) {
  console.error('管道失败:', error)
}

// 或者
pipeAsync(value, fn1, fn2, fn3)
  .then(result => console.log('成功:', result))
  .catch(error => console.error('失败:', error))
```


[← 返回 API 文档](./README.md)
