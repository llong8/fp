# constant

**常量函数** - 返回固定值的函数

## 函数签名

```typescript
function constant<T>(value: T): (...args: any[]) => T
```

## 描述

`constant` 函数接受一个值，返回一个函数，这个函数无论接收什么参数，总是返回最初提供的那个值。在函数式编程中，这对于提供默认值、占位符函数或在高阶函数中使用非常有用。

## 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `value` | `T` | 要返回的固定值 |

## 返回值

- **类型**: `(...args: any[]) => T`
- **描述**: 返回一个函数，该函数总是返回提供的值

## 基础示例

### 示例 1: 基本使用

```typescript
import { constant } from '@about-me/fp'

const alwaysFive = constant(5)

alwaysFive()           // 5
alwaysFive(1)          // 5
alwaysFive(1, 2, 3)    // 5
alwaysFive('hello')    // 5

const alwaysHello = constant('hello')
alwaysHello()          // 'hello'
alwaysHello('world')   // 'hello'
```

### 示例 2: 数组操作

```typescript
// 将所有元素替换为固定值
[1, 2, 3, 4, 5].map(constant(0))
// [0, 0, 0, 0, 0]

[1, 2, 3].map(constant('x'))
// ['x', 'x', 'x']

// 创建填充数组
Array.from({ length: 5 }, constant(10))
// [10, 10, 10, 10, 10]
```

## 实际应用

### 应用 1: 默认值提供

```typescript
interface Config {
  timeout: number
  retries: number
  debug: boolean
}

const getDefaultConfig = constant<Config>({
  timeout: 3000,
  retries: 3,
  debug: false
})

// 每次调用都返回相同的默认配置
const config1 = getDefaultConfig()
const config2 = getDefaultConfig()
```

### 应用 2: 初始化状态

```typescript
interface User {
  name: string
  role: string
  permissions: string[]
}

const getGuestUser = constant<User>({
  name: 'Guest',
  role: 'guest',
  permissions: ['read']
})

// 在需要默认用户时使用
function processUser(user: User = getGuestUser()) {
  console.log(`Processing ${user.name}`)
}

processUser()  // Processing Guest
```

### 应用 3: 错误处理回退

```typescript
function fetchUserSafely(userId: number): Promise<User> {
  return fetch(`/api/users/${userId}`)
    .then(r => r.json())
    .catch(constant({
      name: 'Unknown',
      role: 'guest',
      permissions: []
    }))
}

// 失败时返回默认用户
const user = await fetchUserSafely(999)
```

### 应用 4: React 默认 Props

```typescript
interface ButtonProps {
  text: string
  onClick: () => void
  disabled: boolean
}

const getDefaultProps = constant<Partial<ButtonProps>>({
  disabled: false,
  onClick: () => console.log('Clicked')
})

function Button(props: ButtonProps) {
  const finalProps = { ...getDefaultProps(), ...props }
  // 使用 finalProps
}
```

### 应用 5: 测试模拟

```typescript
// 模拟总是成功的 API
const mockSuccessAPI = constant({
  status: 'success',
  data: { id: 1, name: 'Test' }
})

// 模拟总是失败的 API
const mockFailureAPI = constant({
  status: 'error',
  message: 'Test error'
})

// 在测试中使用
test('should handle API response', () => {
  const result = processAPIResponse(mockSuccessAPI())
  expect(result).toBeDefined()
})
```

### 应用 6: 条件渲染

```typescript
// 根据条件返回不同的渲染函数
function getRenderFunction(hasPermission: boolean) {
  return hasPermission
    ? renderContent
    : constant('<p>Access Denied</p>')
}

const render = getRenderFunction(false)
render()  // '<p>Access Denied</p>'
```

### 应用 7: 填充数据结构

```typescript
// 创建初始化的矩阵
const create2DArray = (rows: number, cols: number, value: any) => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, constant(value))
  )
}

create2DArray(3, 3, 0)
// [
//   [0, 0, 0],
//   [0, 0, 0],
//   [0, 0, 0]
// ]
```

### 应用 8: 管道中的占位符

```typescript
import { pipe } from '@about-me/fp'

const processData = (data: number[], shouldDouble: boolean) =>
  pipe(
    data,
    arr => arr.filter(x => x > 0),
    shouldDouble ? (arr => arr.map(x => x * 2)) : constant,
    arr => arr.reduce((sum, x) => sum + x, 0)
  )

processData([1, 2, 3], false)  // 6
processData([1, 2, 3], true)   // 12
```

### 应用 9: 惰性求值

```typescript
const expensiveOperation = () => {
  console.log('Computing...')
  // 复杂计算
  return 42
}

// 立即计算（不推荐）
const value1 = expensiveOperation()
const getValue1 = () => value1

// 惰性计算（使用 constant）
const getValue2 = constant(expensiveOperation())

// 每次调用都执行（不推荐）
const getValue3 = expensiveOperation

// 只计算一次，之后返回缓存值
const cachedValue = expensiveOperation()
const getValue4 = constant(cachedValue)
```

### 应用 10: Promise 默认值

```typescript
function fetchWithFallback<T>(
  url: string,
  fallback: T
): Promise<T> {
  return fetch(url)
    .then(r => r.json())
    .catch(constant(fallback))
}

const users = await fetchWithFallback('/api/users', [])
// 失败时返回空数组
```

## 使用场景

### 适合的场景

- **默认值** - 提供配置、状态的默认值
- **占位符** - 在需要函数但返回固定值时
- **填充** - 创建填充特定值的数组
- **回退** - 错误处理中的回退值
- **测试模拟** - 模拟固定响应
- **条件逻辑** - 根据条件返回固定值或计算值

### 可视化说明

```
constant(5) 创建:

输入: 任何参数
  │
  ↓
[constant 函数]
  │
  ↓
输出: 总是 5
```

## 注意事项

### 1. 引用共享

constant 返回的函数总是返回同一个引用：

```typescript
const getUser = constant({ name: 'Alice' })

const user1 = getUser()
const user2 = getUser()

user1 === user2  // true - 相同引用!

user1.name = 'Bob'
console.log(user2.name)  // 'Bob' - 修改影响所有引用
```

解决方案：

```typescript
// 每次返回新副本
const getUser = () => ({ name: 'Alice' })

// 或者使用深拷贝
const getUser = constant(JSON.parse(JSON.stringify({ name: 'Alice' })))
```

### 2. 不适合可变对象

对于数组和对象，要小心引用共享：

```typescript
const getArray = constant([1, 2, 3])

const arr1 = getArray()
arr1.push(4)

const arr2 = getArray()
console.log(arr2)  // [1, 2, 3, 4] - 被修改了!
```

### 3. 惰性求值陷阱

constant 会立即求值：

```typescript
// 立即执行（可能不是你想要的）
const getTimestamp = constant(Date.now())

setTimeout(() => {
  console.log(getTimestamp())  // 总是初始时间
}, 1000)

// 每次调用时执行
const getTimestamp = () => Date.now()

setTimeout(() => {
  console.log(getTimestamp())  // 当前时间
}, 1000)
```

### 4. 内存考虑

constant 会一直持有值的引用：

```typescript
// 大对象会一直在内存中
const getLargeData = constant(new Array(1000000).fill(0))

// 如果不再需要，确保清理
```


[← 返回 API 文档](./README.md)
