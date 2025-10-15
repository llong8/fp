# pipe

**从左到右组合函数** - 最直观的数据流方式

## 函数签名

```typescript
function pipe<T>(value: T, ...fns: Array<(arg: any) => any>): any
```

## 描述

`pipe` 函数将一个初始值依次传递给一系列函数，每个函数的输出作为下一个函数的输入。执行顺序是**从左到右**，这是最符合人类阅读习惯的数据流方式。

## 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `value` | `T` | 初始值，传递给第一个函数 |
| `...fns` | `Array<(arg: any) => any>` | 要依次执行的函数列表 |

## 返回值

- **类型**: `any`
- **描述**: 最后一个函数的返回值

## 基础示例

### 示例 1: 数字处理

```typescript
import { pipe } from '@about-me/fp'

const double = (x: number) => x * 2
const addTen = (x: number) => x + 10
const square = (x: number) => x * x

const result = pipe(
  5,
  double,   // 5 * 2 = 10
  addTen,   // 10 + 10 = 20
  square    // 20 * 20 = 400
)

console.log(result) // 400
```

### 示例 2: 字符串转换

```typescript
const result = pipe(
  "  hello world  ",
  str => str.trim(),           // "hello world"
  str => str.toUpperCase(),    // "HELLO WORLD"
  str => str.split(' '),       // ["HELLO", "WORLD"]
  arr => arr.join('-')         // "HELLO-WORLD"
)

console.log(result) // "HELLO-WORLD"
```

## 实际应用

### 应用 1: 用户数据处理

```typescript
interface User {
  name: string
  email: string
  age: number
}

const processUser = (user: User) => pipe(
  user,
  // 1. 清理空格
  u => ({ ...u, name: u.name.trim(), email: u.email.trim() }),
  // 2. 转换为大写
  u => ({ ...u, name: u.name.toUpperCase() }),
  // 3. 标准化邮箱
  u => ({ ...u, email: u.email.toLowerCase() }),
  // 4. 添加验证标记
  u => ({ ...u, verified: true })
)

const user = processUser({
  name: ' Alice ',
  email: 'Alice@Example.COM',
  age: 25
})

// {
//   name: 'ALICE',
//   email: 'alice@example.com',
//   age: 25,
//   verified: true
// }
```

### 应用 2: 数组数据处理

```typescript
interface Product {
  id: number
  name: string
  price: number
  category: string
}

const products: Product[] = [
  { id: 1, name: 'Laptop', price: 1000, category: 'Electronics' },
  { id: 2, name: 'Phone', price: 500, category: 'Electronics' },
  { id: 3, name: 'Book', price: 20, category: 'Books' }
]

const total = pipe(
  products,
  // 1. 筛选电子产品
  products => products.filter(p => p.category === 'Electronics'),
  // 2. 应用 10% 折扣
  products => products.map(p => ({ ...p, price: p.price * 0.9 })),
  // 3. 按价格排序
  products => products.sort((a, b) => a.price - b.price),
  // 4. 计算总价
  products => products.reduce((sum, p) => sum + p.price, 0)
)

console.log(total) // 1350
```

### 应用 3: 表单验证

```typescript
interface FormData {
  username: string
  email: string
  password: string
}

const validateForm = (form: FormData) => pipe(
  form,
  // 1. 清理数据
  f => ({
    ...f,
    username: f.username.trim(),
    email: f.email.trim()
  }),
  // 2. 验证用户名
  f => {
    if (f.username.length < 3) {
      throw new Error('用户名至少 3 个字符')
    }
    return f
  },
  // 3. 验证邮箱
  f => {
    if (!f.email.includes('@')) {
      throw new Error('邮箱格式无效')
    }
    return f
  },
  // 4. 验证密码
  f => {
    if (f.password.length < 8) {
      throw new Error('密码至少 8 个字符')
    }
    return f
  },
  // 5. 标准化
  f => ({
    ...f,
    username: f.username.toLowerCase(),
    email: f.email.toLowerCase()
  })
)

try {
  const validForm = validateForm({
    username: ' Alice ',
    email: 'Alice@Example.COM',
    password: 'password123'
  })
  console.log('验证通过:', validForm)
} catch (error) {
  console.error('验证失败:', error.message)
}
```

## 与其他函数对比

### pipe vs compose

```typescript
import { pipe, compose } from '@about-me/fp'

const double = (x: number) => x * 2
const addTen = (x: number) => x + 10

// pipe: 从左到右执行（直观）
pipe(5, double, addTen)  // (5 * 2) + 10 = 20

// compose: 从右到左执行（数学风格）
compose(addTen, double)(5)  // (5 * 2) + 10 = 20
```

### pipe vs 直接嵌套

```typescript
// 难以阅读的嵌套调用
const result = square(addTen(double(5)))

// 清晰的 pipe 流程
const result = pipe(5, double, addTen, square)
```

## 配合其他工具使用

### 配合 tap 调试

```typescript
import { pipe, tap } from '@about-me/fp'

const result = pipe(
  [1, 2, 3, 4, 5],
  tap(arr => console.log('原始:', arr)),
  arr => arr.map(x => x * 2),
  tap(arr => console.log('翻倍:', arr)),
  arr => arr.filter(x => x > 5),
  tap(arr => console.log('过滤:', arr))
)

// Console:
// 原始: [1, 2, 3, 4, 5]
// 翻倍: [2, 4, 6, 8, 10]
// 过滤: [6, 8, 10]
```

### 配合 curry 创建专用函数

```typescript
import { pipe, curry } from '@about-me/fp'

const filterBy = curry((prop: string, value: any, arr: any[]) =>
  arr.filter(item => item[prop] === value)
)

const multiplyBy = curry((factor: number, arr: number[]) =>
  arr.map(x => x * factor)
)

const processNumbers = pipe(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  filterBy('constructor')(Number),
  multiplyBy(2)
)
```

## 注意事项

### 1. 类型安全

TypeScript 可能无法完美推断复杂 pipe 链的类型，建议为中间步骤添加类型注解：

```typescript
interface User { name: string; age: number }
interface ProcessedUser extends User { verified: boolean }

const processUser = (user: User): ProcessedUser => pipe(
  user,
  (u: User) => ({ ...u, name: u.name.toUpperCase() }),
  (u: User): ProcessedUser => ({ ...u, verified: true })
)
```

### 2. 错误处理

pipe 中的任何函数抛出错误都会中断整个流程：

```typescript
try {
  const result = pipe(
    value,
    step1,
    step2,  // 如果这里抛出错误
    step3   // 这里不会执行
  )
} catch (error) {
  console.error('Pipeline 失败:', error)
}
```

### 3. 避免过度组合

保持 pipe 链的可读性，过长的链考虑拆分：

```typescript
// 太长，难以理解
const result = pipe(data, fn1, fn2, fn3, fn4, fn5, fn6, fn7, fn8, fn9, fn10)

// 分阶段组合
const phase1 = pipe(data, fn1, fn2, fn3)
const phase2 = pipe(phase1, fn4, fn5, fn6)
const result = pipe(phase2, fn7, fn8)
```


[← 返回 API 文档](./README.md)
