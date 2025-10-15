# compose

**从右到左组合函数** - 数学风格的函数组合

## 函数签名

```typescript
function compose<T>(...fns: Array<(arg: any) => any>): (value: T) => any
```

## 描述

`compose` 函数将多个函数从右到左组合成一个新函数。执行顺序是从右到左，这符合数学中的函数组合概念 f(g(x))。与 `pipe` 相反，`compose` 先执行最右边的函数。

## 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `...fns` | `Array<(arg: any) => any>` | 要组合的函数列表，从右到左执行 |

## 返回值

- **类型**: `(value: T) => any`
- **描述**: 返回一个新函数，接受初始值并按从右到左的顺序应用所有函数

## 基础示例

### 示例 1: 数字处理

```typescript
import { compose } from '@about-me/fp'

const double = (x: number) => x * 2
const addTen = (x: number) => x + 10
const square = (x: number) => x * x

// 从右到左执行: square -> addTen -> double
const calculate = compose(
  double,   // 3. 最后执行: 30 * 2 = 60
  addTen,   // 2. 然后: 20 + 10 = 30
  square    // 1. 首先: 4 * 4 = 16... 等等，不对!
)

// 实际执行顺序: 4 -> square(16) -> addTen(26) -> double(52)
calculate(4)  // 52

// 等价于嵌套调用
double(addTen(square(4)))  // 52
```

### 示例 2: 字符串转换

```typescript
const trim = (str: string) => str.trim()
const toUpper = (str: string) => str.toUpperCase()
const addPrefix = (str: string) => `PREFIX: ${str}`

// 从右到左: addPrefix <- toUpper <- trim
const processString = compose(
  addPrefix,   // 3. "PREFIX: HELLO"
  toUpper,     // 2. "HELLO"
  trim         // 1. "hello"
)

processString("  hello  ")  // "PREFIX: HELLO"
```

## 实际应用

### 应用 1: 数据转换管道

```typescript
interface RawUser {
  first_name: string
  last_name: string
  email_address: string
}

interface User {
  fullName: string
  email: string
}

const normalizeKeys = (user: RawUser): any => ({
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email_address
})

const combineNames = (user: any): any => ({
  ...user,
  fullName: `${user.firstName} ${user.lastName}`
})

const removeExtraFields = (user: any): User => ({
  fullName: user.fullName,
  email: user.email
})

const processUser = compose(
  removeExtraFields,
  combineNames,
  normalizeKeys
)

const rawUser: RawUser = {
  first_name: 'Alice',
  last_name: 'Smith',
  email_address: 'alice@example.com'
}

processUser(rawUser)
// { fullName: 'Alice Smith', email: 'alice@example.com' }
```

### 应用 2: 验证器组合

```typescript
type Validator<T> = (value: T) => T | never

const notEmpty: Validator<string> = (value) => {
  if (value.length === 0) throw new Error('不能为空')
  return value
}

const minLength = (min: number): Validator<string> => (value) => {
  if (value.length < min) throw new Error(`至少 ${min} 个字符`)
  return value
}

const maxLength = (max: number): Validator<string> => (value) => {
  if (value.length > max) throw new Error(`最多 ${max} 个字符`)
  return value
}

const hasEmail: Validator<string> = (value) => {
  if (!value.includes('@')) throw new Error('必须是有效邮箱')
  return value
}

// 从右到左验证
const validateUsername = compose(
  maxLength(20),
  minLength(3),
  notEmpty
)

const validateEmail = compose(
  hasEmail,
  maxLength(100),
  notEmpty
)

try {
  validateUsername('ab')  // 错误: 至少 3 个字符
} catch (error) {
  console.error(error.message)
}

validateEmail('alice@example.com')  // 通过
```

### 应用 3: 响应转换

```typescript
interface APIResponse {
  status: number
  data: {
    items: any[]
    metadata: any
  }
}

const extractData = (response: APIResponse) => response.data

const extractItems = (data: any) => data.items

const filterActive = (items: any[]) =>
  items.filter(item => item.status === 'active')

const sortByDate = (items: any[]) =>
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

const transformToViewModel = (items: any[]) =>
  items.map(item => ({
    id: item.id,
    title: item.name,
    date: item.createdAt
  }))

const processResponse = compose(
  transformToViewModel,
  sortByDate,
  filterActive,
  extractItems,
  extractData
)

const apiResponse: APIResponse = {
  status: 200,
  data: {
    items: [
      { id: 1, name: 'Item 1', status: 'active', createdAt: '2024-01-01' },
      { id: 2, name: 'Item 2', status: 'inactive', createdAt: '2024-01-02' },
      { id: 3, name: 'Item 3', status: 'active', createdAt: '2024-01-03' }
    ],
    metadata: {}
  }
}

processResponse(apiResponse)
// [
//   { id: 3, title: 'Item 3', date: '2024-01-03' },
//   { id: 1, title: 'Item 1', date: '2024-01-01' }
// ]
```

## compose vs pipe

```typescript
import { compose, pipe } from '@about-me/fp'

const double = (x: number) => x * 2
const addTen = (x: number) => x + 10

// compose: 从右到左执行
const composedFn = compose(double, addTen)
composedFn(5)  // double(addTen(5)) = double(15) = 30

// pipe: 从左到右执行
const pipedResult = pipe(5, addTen, double)
// addTen(5) = 15, double(15) = 30

// 两者结果相同，但思考方式不同
```

### 对比表格

| 特性 | compose | pipe |
|------|---------|------|
| 执行顺序 | 从右到左 | 从左到右 |
| 风格 | 数学风格 | 直观流程 |
| 初始值 | 作为返回函数的参数 | 作为第一个参数 |
| 用法 | `compose(f, g)(x)` | `pipe(x, g, f)` |
| 可读性 | 需要逆向思考 | 符合阅读习惯 |

### 选择建议

- **compose**: 习惯数学表示法、需要创建可复用的组合函数
- **pipe**: 希望代码更直观、强调数据流转过程

## 配合 curry 使用

```typescript
import { compose, curry } from '@about-me/fp'

const add = curry((a: number, b: number) => a + b)
const multiply = curry((a: number, b: number) => a * b)
const subtract = curry((a: number, b: number) => a - b)

// 创建专用函数
const add10 = add(10)
const multiplyBy2 = multiply(2)
const subtract5 = subtract(5)

const calculate = compose(
  multiplyBy2,   // 3. * 2
  add10,         // 2. + 10
  subtract5      // 1. - 5
)

calculate(20)  // multiplyBy2(add10(subtract5(20)))
               // multiplyBy2(add10(15))
               // multiplyBy2(25)
               // 50
```

## 注意事项

### 1. 执行顺序

compose 从右到左执行，容易混淆：

```typescript
const result = compose(fn1, fn2, fn3)(value)
// 执行顺序: value -> fn3 -> fn2 -> fn1

// 等价于
fn1(fn2(fn3(value)))
```

### 2. 类型兼容

相邻函数的类型必须兼容：

```typescript
const toNumber = (str: string): number => parseInt(str, 10)
const double = (n: number): number => n * 2
const toString = (n: number): string => n.toString()

// 正确: string -> number -> number -> string
const valid = compose(toString, double, toNumber)
valid("5")  // "10"

// 错误: 类型不匹配
const invalid = compose(double, toString, toNumber)
// double 期望 number，但 toString 返回 string
```

### 3. 调试困难

从右到左的执行顺序使调试更困难：

```typescript
// 难以追踪数据流
const result = compose(fn1, fn2, fn3, fn4, fn5)(value)

// 建议使用 pipe 或添加调试日志
import { tap } from '@about-me/fp'

const result = compose(
  tap(x => console.log('after fn1:', x)),
  fn1,
  tap(x => console.log('after fn2:', x)),
  fn2,
  fn3
)(value)
```

### 4. 避免过度组合

保持组合函数的可读性：

```typescript
// 难以理解
const complex = compose(fn1, fn2, fn3, fn4, fn5, fn6, fn7, fn8)

// 更好: 分阶段组合
const phase1 = compose(fn3, fn2, fn1)
const phase2 = compose(fn6, fn5, fn4)
const phase3 = compose(fn8, fn7)
const result = compose(phase3, phase2, phase1)
```



[← 返回 API 文档](./README.md)
