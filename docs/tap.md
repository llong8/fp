# tap

**执行副作用** - 在数据流中执行操作但不改变值

## 函数签名

```typescript
function tap<T>(fn: (value: T) => void): (value: T) => T
```

## 描述

`tap` 函数接受一个副作用函数，返回一个新函数。这个新函数会执行副作用（如日志、调试、监控），但总是返回原始值不变。这使得 `tap` 非常适合在 `pipe` 或 `compose` 中添加调试和日志，而不影响数据流。

## 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `fn` | `(value: T) => void` | 要执行的副作用函数，接收当前值但不返回任何内容 |

## 返回值

- **类型**: `(value: T) => T`
- **描述**: 返回一个函数，执行副作用后返回原始值不变

## 基础示例

### 示例 1: 管道中的调试

```typescript
import { tap, pipe } from '@about-me/fp'

const result = pipe(
  [1, 2, 3, 4, 5],
  tap(arr => console.log('原始数组:', arr)),
  arr => arr.map(x => x * 2),
  tap(arr => console.log('翻倍后:', arr)),
  arr => arr.filter(x => x > 5),
  tap(arr => console.log('过滤后:', arr)),
  arr => arr.reduce((sum, x) => sum + x, 0)
)

console.log('最终结果:', result)

// 输出:
// 原始数组: [1, 2, 3, 4, 5]
// 翻倍后: [2, 4, 6, 8, 10]
// 过滤后: [6, 8, 10]
// 最终结果: 24
```

### 示例 2: 对象转换日志

```typescript
interface User {
  name: string
  age: number
}

const processUser = (user: User) =>
  pipe(
    user,
    tap(u => console.log('输入:', u)),
    u => ({ ...u, name: u.name.toUpperCase() }),
    tap(u => console.log('大写转换后:', u)),
    u => ({ ...u, verified: true }),
    tap(u => console.log('验证后:', u)),
    u => ({ ...u, timestamp: Date.now() }),
    tap(u => console.log('最终:', u))
  )

processUser({ name: 'alice', age: 25 })
```

## 实际应用

### 应用 1: 性能监控

```typescript
const tapWithTimer = (label: string) =>
  tap((value: any) => {
    console.time(label)
    console.timeEnd(label)
  })

const heavyProcessing = pipe(
  Array.from({ length: 1000 }, (_, i) => i),
  tapWithTimer('开始'),
  arr => arr.map(x => x * x),
  tapWithTimer('平方计算后'),
  arr => arr.filter(x => x % 2 === 0),
  tapWithTimer('过滤后'),
  arr => arr.slice(0, 10),
  tapWithTimer('切片后')
)
```

### 应用 2: 条件日志

```typescript
const tapIf = (
  predicate: (val: any) => boolean,
  fn: (val: any) => void
) =>
  tap((value: any) => {
    if (predicate(value)) {
      fn(value)
    }
  })

const result = pipe(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  arr => arr.filter(x => x % 2 === 0),
  tapIf(
    arr => arr.length > 0,
    arr => console.log('找到偶数:', arr)
  ),
  arr => arr.map(x => x * 2),
  tapIf(
    arr => arr.some(x => x > 10),
    arr => console.log('部分值超过 10:', arr)
  )
)
```

### 应用 3: 保存中间结果

```typescript
const intermediateResults: any[] = []

const saveResult = (label: string) =>
  tap((value: any) => {
    intermediateResults.push({ label, value })
  })

pipe(
  10,
  x => x * 2,
  saveResult('翻倍后'),
  x => x + 5,
  saveResult('加法后'),
  x => x / 5,
  saveResult('除法后')
)

console.log('中间结果:', intermediateResults)
// [
//   { label: '翻倍后', value: 20 },
//   { label: '加法后', value: 25 },
//   { label: '除法后', value: 5 }
// ]
```

### 应用 4: 验证日志

```typescript
const validateAndLog = pipe(
  { username: 'alice', age: 25, email: 'alice@example.com' },
  tap(form => console.log('开始验证:', form)),
  form => {
    if (form.username.length < 3) throw new Error('用户名太短')
    return form
  },
  tap(() => console.log('✓ 用户名有效')),
  form => {
    if (!form.email.includes('@')) throw new Error('邮箱无效')
    return form
  },
  tap(() => console.log('✓ 邮箱有效')),
  form => {
    if (form.age < 18) throw new Error('必须年满 18 岁')
    return form
  },
  tap(() => console.log('✓ 年龄有效')),
  tap(form => console.log('所有验证通过:', form))
)
```

### 应用 5: 异步操作中的日志

```typescript
import { pipeAsync } from '@about-me/fp'

const fetchUser = async (userId: number) => {
  await new Promise(resolve => setTimeout(resolve, 100))
  return { id: userId, name: 'Alice', email: 'alice@example.com' }
}

const processAPIData = async (userId: number) => {
  return await pipeAsync(
    userId,
    tap(id => console.log('获取用户:', id)),
    fetchUser,
    tap(user => console.log('收到用户:', user)),
    user => ({ ...user, processed: true }),
    tap(user => console.log('处理后的用户:', user))
  )
}

processAPIData(123)
```

### 应用 6: 进度跟踪

```typescript
let progress = 0
const totalSteps = 5

const trackProgress = (step: string) =>
  tap(() => {
    progress++
    const percent = Math.round((progress / totalSteps) * 100)
    console.log(`[${percent}%] ${step}`)
  })

pipe(
  'data',
  trackProgress('加载数据'),
  data => data.toUpperCase(),
  trackProgress('转换中'),
  data => data + '!!!',
  trackProgress('格式化'),
  data => data.repeat(2),
  trackProgress('复制中'),
  data => data.trim(),
  trackProgress('最终处理')
)

// 输出:
// [20%] 加载数据
// [40%] 转换中
// [60%] 格式化
// [80%] 复制中
// [100%] 最终处理
```

## 使用场景

### 适合的场景

- **调试** - 在管道中添加 console.log
- **性能监控** - 测量每个步骤的执行时间
- **进度跟踪** - 显示处理进度
- **验证日志** - 记录验证步骤
- **审计追踪** - 记录数据流转过程
- **保存中间状态** - 收集中间结果用于分析

### 不适合的场景

- **修改数据** - 不应该用 tap 修改传递的值
- **业务逻辑** - tap 应该只用于副作用，不是业务逻辑
- **返回值** - tap 的返回值会被忽略

## 注意事项

### 1. 不应修改值

tap 应该只执行副作用，不应修改传递的值：

```typescript
// 错误: 修改了原始数组
pipe(
  [1, 2, 3],
  tap(arr => arr.push(4)),  // 修改了原数组!
  arr => arr.map(x => x * 2)
)

// 正确: 只读取，不修改
pipe(
  [1, 2, 3],
  tap(arr => console.log('原数组:', arr)),  // 只读取
  arr => [...arr, 4],  // 在正常步骤中添加元素
  arr => arr.map(x => x * 2)
)
```

### 2. 返回值被忽略

tap 函数的返回值总是被忽略：

```typescript
pipe(
  10,
  tap(x => x * 2),  // 返回值被忽略
  x => console.log(x)  // 输出: 10 (不是 20)
)

// 正确做法
pipe(
  10,
  tap(x => console.log('原值:', x)),  // 只用于日志
  x => x * 2,  // 实际的转换
  tap(x => console.log('转换后:', x))
)
```

### 3. 性能考虑

tap 本身开销很小，但副作用可能有开销：

```typescript
// 开销小
pipe(
  data,
  tap(x => console.log(x)),  // 只打印
  transform
)

// 开销大
pipe(
  data,
  tap(x => {
    // 复杂的序列化
    fs.writeFileSync('/log.txt', JSON.stringify(x, null, 2))
  }),
  transform
)
```

### 4. 生产环境

考虑在生产环境中禁用调试 tap：

```typescript
const DEBUG = process.env.NODE_ENV !== 'production'

const debugTap = (fn: Function) =>
  DEBUG ? tap(fn) : (x: any) => x

pipe(
  data,
  debugTap(x => console.log('Debug:', x)),  // 生产环境跳过
  transform
)
```

[← 返回 API 文档](./README.md)
