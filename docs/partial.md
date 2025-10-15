# partial

**部分应用** - 固定函数的部分参数

## 函数签名

```typescript
function partial<T extends (...args: any[]) => any>(
  fn: T,
  ...args: any[]
): (...remainingArgs: any[]) => ReturnType<T>
```

## 描述

`partial` 函数创建一个新函数，其中一些参数被预先固定。这使得你可以创建函数的专用版本，而无需每次都传递相同的参数。

## 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `fn` | `T extends (...args: any[]) => any` | 要部分应用的函数 |
| `...args` | `any[]` | 要预先固定的参数 |

## 返回值

- **类型**: `(...remainingArgs: any[]) => ReturnType<T>`
- **描述**: 返回一个新函数，接受剩余的参数并返回与原函数相同的类型

## 基础示例

### 示例 1: 基础部分应用

```typescript
import { partial } from '@about-me/fp'

const multiply = (a: number, b: number, c: number) => a * b * c

// 固定第一个参数
const multiplyBy2 = partial(multiply, 2)
multiplyBy2(3, 4)  // 2 * 3 * 4 = 24

// 固定前两个参数
const multiplyBy2And3 = partial(multiply, 2, 3)
multiplyBy2And3(5)  // 2 * 3 * 5 = 30
```

### 示例 2: 日志系统

```typescript
const log = (level: string, namespace: string, message: string) => {
  console.log(`[${level}] ${namespace}: ${message}`)
}

// 创建不同级别的日志函数
const errorLog = partial(log, 'ERROR')
const infoLog = partial(log, 'INFO')
const debugLog = partial(log, 'DEBUG')

errorLog('database', 'Connection failed')
// [ERROR] database: Connection failed

infoLog('server', 'Server started')
// [INFO] server: Server started

// 更具体的日志记录器
const dbErrorLog = partial(log, 'ERROR', 'database')
dbErrorLog('Query failed')
// [ERROR] database: Query failed
```

## 实际应用

### 应用 1: HTTP 请求构建器

```typescript
const makeRequest = (
  method: string,
  baseURL: string,
  endpoint: string,
  data?: any
) => ({
  method,
  url: `${baseURL}${endpoint}`,
  data
})

// 创建 API 客户端
const apiRequest = partial(
  makeRequest,
  'GET',
  'https://api.example.com'
)

const postRequest = partial(
  makeRequest,
  'POST',
  'https://api.example.com'
)

apiRequest('/users')
// { method: 'GET', url: 'https://api.example.com/users' }

postRequest('/users', { name: 'Alice' })
// { method: 'POST', url: 'https://api.example.com/users', data: { name: 'Alice' } }
```

### 应用 2: 字符串格式化

```typescript
const formatPrice = (currency: string, locale: string, amount: number) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount)
}

// 创建不同货币的格式化器
const formatUSD = partial(formatPrice, 'USD', 'en-US')
const formatEUR = partial(formatPrice, 'EUR', 'de-DE')
const formatJPY = partial(formatPrice, 'JPY', 'ja-JP')

formatUSD(1234.56)  // $1,234.56
formatEUR(1234.56)  // 1.234,56 €
formatJPY(1234.56)  // ¥1,235
```

### 应用 3: 数组操作

```typescript
const slice = (start: number, end: number, arr: any[]) =>
  arr.slice(start, end)

// 创建专用的数组切片函数
const first3 = partial(slice, 0, 3)
const skip2 = partial(slice, 2, Infinity)
const last3 = (arr: any[]) => arr.slice(-3)

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

first3(numbers)  // [1, 2, 3]
skip2(numbers)   // [3, 4, 5, 6, 7, 8, 9, 10]
```

### 应用 4: 验证函数

```typescript
const validate = (
  fieldName: string,
  validator: (val: any) => boolean,
  value: any
) => {
  const isValid = validator(value)
  return {
    field: fieldName,
    value,
    isValid,
    message: isValid ? 'Valid' : `Invalid ${fieldName}`
  }
}

// 创建专用验证器
const validateEmail = partial(
  validate,
  'email',
  (val: string) => val.includes('@')
)

const validateAge = partial(
  validate,
  'age',
  (val: number) => val >= 18 && val <= 120
)

validateEmail('alice@example.com')
// { field: 'email', value: 'alice@example.com', isValid: true, message: 'Valid' }

validateAge(25)
// { field: 'age', value: 25, isValid: true, message: 'Valid' }

validateAge(15)
// { field: 'age', value: 15, isValid: false, message: 'Invalid age' }
```

### 应用 5: 事件处理器

```typescript
const handleEvent = (
  eventType: string,
  elementId: string,
  callback: Function
) => {
  const element = document.getElementById(elementId)
  element?.addEventListener(eventType, callback as EventListener)
}

// 创建专用事件注册器
const onClick = partial(handleEvent, 'click')
const onSubmit = partial(handleEvent, 'submit')
const onChange = partial(handleEvent, 'change')

onClick('myButton', () => console.log('Button clicked'))
onSubmit('myForm', () => console.log('Form submitted'))
onChange('myInput', () => console.log('Input changed'))
```

## partial vs curry

```typescript
import { partial, curry } from '@about-me/fp'

const add = (a: number, b: number, c: number) => a + b + c

// curry: 逐步应用参数
const curriedAdd = curry(add)
curriedAdd(1)(2)(3)           // 6
curriedAdd(1, 2)(3)           // 6
curriedAdd(1)(2, 3)           // 6

// partial: 一次性固定参数
const partialAdd5 = partial(add, 5)
partialAdd5(10, 3)            // 5 + 10 + 3 = 18

const partialAdd5And10 = partial(add, 5, 10)
partialAdd5And10(3)           // 5 + 10 + 3 = 18
```

### 对比表格

| 特性 | partial | curry |
|------|---------|-------|
| 灵活性 | 一次性固定参数 | 逐步应用参数 |
| 复杂度 | 简单 | 较复杂 |
| 性能 | 更快 | 稍慢 |
| 用途 | 创建专用函数 | 函数组合 |
| 参数顺序 | 必须从左到右 | 必须从左到右 |

### 选择建议

- **partial**: 简单场景，只需固定部分参数
- **curry**: 需要逐步构建函数、与 pipe/compose 配合

## 注意事项

### 1. 参数顺序

partial 只能固定从左到右的参数：

```typescript
const subtract = (a: number, b: number) => a - b

const subtract5 = partial(subtract, 5)
subtract5(3)  // 5 - 3 = 2

// 不能固定右边的参数
// 如果需要，请调整函数参数顺序
const subtractFrom = (b: number, a: number) => a - b
const subtractFrom5 = partial(subtractFrom, 5)
subtractFrom5(3)  // 3 - 5 = -2
```

### 2. 类型推断

TypeScript 可能无法完美推断 partial 返回函数的类型：

```typescript
const multiply = (a: number, b: number, c: number): number => a * b * c

// 可能需要显式类型注解
const multiplyBy2: (b: number, c: number) => number = partial(multiply, 2)
```

### 3. 默认参数

partial 会覆盖默认参数：

```typescript
const greet = (name: string, greeting: string = 'Hello') =>
  `${greeting}, ${name}!`

const greetAlice = partial(greet, 'Alice')
greetAlice()  // "undefined, Alice!" - 默认参数被忽略

// 需要显式传递默认值
greetAlice('Hello')  // "Hello, Alice!"
```

### 4. this 绑定

partial 不会绑定 this：

```typescript
const obj = {
  value: 42,
  getValue(multiplier: number) {
    return this.value * multiplier
  }
}

const getValueBy2 = partial(obj.getValue, 2)
// getValueBy2() 会失去 this 绑定

// 需要使用 bind
const getValueBy2Bound = partial(obj.getValue.bind(obj), 2)
getValueBy2Bound()  // 84
```



[← 返回 API 文档](./README.md)
