# curry

**柯里化** - 将多参数函数转换为单参数函数序列

## 函数签名

```typescript
function curry<T extends (...args: any[]) => any>(
  fn: T
): (...args: any[]) => any
```

## 描述

`curry` 函数将一个接受多个参数的函数转换为一系列接受单个参数的函数。这使得你可以部分应用参数，创建专用版本的函数。

## 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `fn` | `T extends (...args: any[]) => any` | 要柯里化的函数 |

## 返回值

- **类型**: `(...args: any[]) => any`
- **描述**: 柯里化后的函数，可以逐个接收参数或一次性接收所有参数

## 基础示例

### 示例 1: 基本柯里化

```typescript
import { curry } from '@about-me/fp'

const add = (a: number, b: number, c: number) => a + b + c
const curriedAdd = curry(add)

// 方式 1: 逐个参数
curriedAdd(1)(2)(3)  // 6

// 方式 2: 部分应用
const add5 = curriedAdd(5)
const add5And10 = add5(10)
add5And10(3)  // 18

// 方式 3: 一次性传递
curriedAdd(1, 2, 3)  // 6

// 方式 4: 混合
curriedAdd(1, 2)(3)  // 6
curriedAdd(1)(2, 3)  // 6
```

### 示例 2: 创建专用函数

```typescript
const multiply = (a: number, b: number, c: number) => a * b * c
const curriedMultiply = curry(multiply)

const double = curriedMultiply(2)
const doubleAndTriple = double(3)

double(5, 1)         // 2 * 5 * 1 = 10
doubleAndTriple(4)   // 2 * 3 * 4 = 24
```

## 实际应用

### 应用 1: 数组过滤器

```typescript
const filterBy = curry(
  (prop: string, value: any, arr: any[]) =>
    arr.filter(item => item[prop] === value)
)

const users = [
  { name: 'Alice', role: 'admin', active: true },
  { name: 'Bob', role: 'user', active: true },
  { name: 'Charlie', role: 'admin', active: false }
]

// 创建专用过滤器
const filterByRole = filterBy('role')
const filterByActive = filterBy('active')

const getAdmins = filterByRole('admin')
const getActiveUsers = filterByActive(true)

console.log(getAdmins(users))
// [{ name: 'Alice', ... }, { name: 'Charlie', ... }]

console.log(getActiveUsers(users))
// [{ name: 'Alice', ... }, { name: 'Bob', ... }]
```

### 应用 2: HTTP 请求构建器

```typescript
const apiRequest = curry(
  (method: string, endpoint: string, data: any) => ({
    method,
    url: `https://api.example.com${endpoint}`,
    data
  })
)

// 创建专用请求函数
const get = apiRequest('GET')
const post = apiRequest('POST')
const put = apiRequest('PUT')

const getUsers = get('/users')
const postUser = post('/users')

console.log(getUsers(null))
// { method: 'GET', url: 'https://api.example.com/users', data: null }

console.log(postUser({ name: 'Alice' }))
// { method: 'POST', url: 'https://api.example.com/users', data: { name: 'Alice' } }
```

### 应用 3: 日志系统

```typescript
const log = curry(
  (level: string, namespace: string, message: string) => {
    console.log(`[${level}] ${namespace}: ${message}`)
  }
)

// 创建不同级别的日志函数
const info = log('INFO')
const error = log('ERROR')
const debug = log('DEBUG')

// 创建不同模块的日志函数
const appInfo = info('app')
const dbError = error('database')
const apiDebug = debug('api')

appInfo('Application started')
// [INFO] app: Application started

dbError('Connection failed')
// [ERROR] database: Connection failed

apiDebug('Request received')
// [DEBUG] api: Request received
```

### 应用 4: 数据验证器

```typescript
const validate = curry(
  (validator: (v: any) => boolean, errorMsg: string, value: any) => {
    if (!validator(value)) {
      throw new Error(errorMsg)
    }
    return value
  }
)

// 创建专用验证器
const validateMinLength = validate(
  (s: string) => s.length >= 3
)('字符串长度至少 3 个字符')

const validateEmail = validate(
  (s: string) => s.includes('@')
)('邮箱格式无效')

const validateAge = validate(
  (n: number) => n >= 18
)('年龄必须至少 18 岁')

try {
  validateMinLength('ab')  // 抛出错误
} catch (error) {
  console.error(error.message)  // "字符串长度至少 3 个字符"
}

validateEmail('alice@example.com')  // "alice@example.com"
validateAge(25)  // 25
```

## 配合其他工具使用

### 配合 pipe 使用

```typescript
import { curry, pipe } from '@about-me/fp'

const add = curry((a: number, b: number) => a + b)
const multiply = curry((a: number, b: number) => a * b)
const subtract = curry((a: number, b: number) => b - a)

const calculate = pipe(
  5,
  add(10),        // 5 + 10 = 15
  multiply(2),    // 15 * 2 = 30
  subtract(5)     // 30 - 5 = 25
)

console.log(calculate)  // 25
```

### 配合 map/filter 使用

```typescript
const products = [
  { name: 'Laptop', price: 1000 },
  { name: 'Phone', price: 500 },
  { name: 'Tablet', price: 300 }
]

const setProp = curry((prop: string, value: any, obj: any) => ({
  ...obj,
  [prop]: value
}))

const applyDiscount = setProp('price')

const discountedProducts = products.map(
  p => applyDiscount(p.price * 0.9, p)
)
```

## 注意事项

### 1. 函数参数数量

curry 基于函数的 `length` 属性判断参数数量，不适用于可变参数函数：

```typescript
// 固定参数数量
const add = (a, b, c) => a + b + c
const curriedAdd = curry(add)  // 正常工作

// 可变参数
const sum = (...numbers) => numbers.reduce((a, b) => a + b, 0)
const curriedSum = curry(sum)  // 可能不会按预期工作
```

### 2. 类型推断

TypeScript 可能无法完美推断柯里化后的函数类型，建议添加类型注解：

```typescript
const add = curry(<(a: number, b: number, c: number) => number>(
  (a, b, c) => a + b + c
))
```

### 3. 默认参数

带默认参数的函数柯里化后可能不符合预期：

```typescript
const greet = (name: string, greeting: string = 'Hello') =>
  `${greeting}, ${name}!`

const curriedGreet = curry(greet)
// 可能需要显式传递 greeting 参数
```



[← 返回 API 文档](./README.md)
