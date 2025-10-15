# memoize

**记忆化** - 缓存函数结果，避免重复计算

## 函数签名

```typescript
function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R
```

## 描述

`memoize` 函数创建一个缓存版本的函数。当使用相同参数调用时，直接返回缓存的结果，而不是重新执行函数。这对于优化昂贵的计算非常有用。

## 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `fn` | `(arg: T) => R` | 要记忆化的函数（仅支持单参数） |

## 返回值

- **类型**: `(arg: T) => R`
- **描述**: 记忆化后的函数，自动缓存结果

## 基础示例

### 示例 1: 斐波那契数列优化

```typescript
import { memoize } from '@about-me/fp'

// 未优化版本 - O(2^n) 时间复杂度
const fibNormal = (n: number): number => {
  if (n <= 1) return n
  return fibNormal(n - 1) + fibNormal(n - 2)
}

// 记忆化版本 - O(n) 时间复杂度
const fibonacci = memoize((n: number): number => {
  console.log(`计算 fib(${n})`)
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
})

console.log(fibonacci(10))
// 只会打印 11 次 "计算 fib(x)"，而不是 177 次

console.log(fibonacci(10))
// 直接返回缓存，不打印任何内容
```

### 性能对比

```typescript
// 未记忆化
console.time('normal')
fibNormal(40)  // 需要数秒
console.timeEnd('normal')

// 记忆化 - 第一次调用
console.time('memoized-first')
fibonacci(40)  // 很快完成
console.timeEnd('memoized-first')

// 记忆化 - 第二次调用
console.time('memoized-cached')
fibonacci(40)  // 瞬间返回
console.timeEnd('memoized-cached')
```

## 实际应用

### 应用 1: API 数据缓存

```typescript
interface User {
  id: number
  name: string
  email: string
}

let apiCallCount = 0

const fetchUser = memoize(async (userId: number): Promise<User> => {
  apiCallCount++
  console.log(`API 调用 #${apiCallCount}: 获取用户 ${userId}`)

  // 模拟 API 调用
  const response = await fetch(`/api/users/${userId}`)
  return response.json()
})

// 第一次调用 - 发送 API 请求
await fetchUser(123)  // API 调用 #1

// 第二次调用 - 返回缓存，不发送请求
await fetchUser(123)  // 直接返回缓存

// 不同参数 - 发送新请求
await fetchUser(456)  // API 调用 #2
```

### 应用 2: 昂贵的计算

```typescript
const expensiveCalculation = memoize((n: number) => {
  console.log(`执行昂贵计算: ${n}`)
  let result = 0
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(n)
  }
  return result
})

console.time('first')
expensiveCalculation(100)
console.timeEnd('first')  // 需要一些时间

console.time('cached')
expensiveCalculation(100)
console.timeEnd('cached')  // 瞬间返回
```

### 应用 3: 数据格式化

```typescript
const formatCurrency = memoize((amount: number): string => {
  console.log(`格式化金额: ${amount}`)
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
})

const prices = [100, 200, 100, 300, 200, 100]

prices.forEach(price => {
  console.log(formatCurrency(price))
})

// 只会打印 3 次 "格式化金额"（100, 200, 300）
// 重复的金额直接使用缓存
```

### 应用 4: 正则表达式编译

```typescript
const createRegex = memoize((pattern: string): RegExp => {
  console.log(`编译正则: ${pattern}`)
  return new RegExp(pattern, 'gi')
})

const texts = [
  'hello world',
  'hello javascript',
  'goodbye world',
  'hello typescript'
]

texts.forEach(text => {
  const regex = createRegex('hello')  // 只编译一次
  const matches = text.match(regex)
  console.log(matches)
})
```

## 配合其他工具使用

### 配合 pipe 使用

```typescript
import { memoize, pipe } from '@about-me/fp'

const expensiveTransform = memoize((data: any) => {
  // 昂贵的转换操作
  return /* ... */
})

const processData = (input: any) => pipe(
  input,
  normalizeData,
  expensiveTransform,  // 缓存结果
  validateData
)
```

## 注意事项

### 1. 仅支持单参数

memoize 目前只支持单参数函数：

```typescript
// 支持
const add5 = memoize((x: number) => x + 5)

// 不支持多参数
const add = memoize((a: number, b: number) => a + b)  // 可能不会正常工作
```

**解决方案**：使用对象或数组作为单个参数

```typescript
const add = memoize(({ a, b }: { a: number; b: number }) => a + b)
add({ a: 1, b: 2 })

// 或使用 curry
const curriedAdd = curry((a: number, b: number) => a + b)
const memoizedAdd5 = memoize(curriedAdd(5))
```

### 2. 参数序列化

缓存键基于参数的序列化（JSON.stringify），复杂对象可能有问题：

```typescript
const obj1 = { a: 1, b: 2 }
const obj2 = { a: 1, b: 2 }

const fn = memoize((obj: any) => obj.a + obj.b)

fn(obj1)  // 计算
fn(obj2)  // 缓存命中（因为序列化后相同）
fn(obj1)  // 缓存命中
```

### 3. 内存占用

所有结果都会被缓存，可能导致内存占用增加：

```typescript
const fn = memoize((n: number) => n * 2)

// 调用 1000 次不同参数
for (let i = 0; i < 1000; i++) {
  fn(i)  // 每次都会缓存新结果
}
// 缓存中现在有 1000 个条目
```

### 4. 只用于纯函数

memoize 只应用于纯函数（无副作用）：

```typescript
// 不适合记忆化（有副作用）
let counter = 0
const impure = memoize((x: number) => {
  counter++  // 副作用
  return x * 2
})

impure(5)  // counter = 1
impure(5)  // counter 仍然是 1（缓存命中，不执行函数）

// 适合记忆化（纯函数）
const pure = memoize((x: number) => x * 2)
```



[← 返回 API 文档](./README.md)
