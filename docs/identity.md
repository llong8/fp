# identity

**恒等函数** - 返回输入值本身

## 函数签名

```typescript
function identity<T>(value: T): T
```

## 描述

`identity` 函数是最简单的函数式编程工具，它接受一个值并原样返回该值。虽然看起来简单，但在函数式编程中有很多重要用途，特别是作为默认函数、占位符，或在高阶函数中使用。

## 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `value` | `T` | 任意值 |

## 返回值

- **类型**: `T`
- **描述**: 返回输入值本身，类型不变

## 基础示例

### 示例 1: 基本使用

```typescript
import { identity } from '@about-me/fp'

identity(5)           // 5
identity('hello')     // 'hello'
identity([1, 2, 3])   // [1, 2, 3]
identity({ a: 1 })    // { a: 1 }
identity(null)        // null
identity(undefined)   // undefined
```

### 示例 2: 数组过滤

```typescript
// 过滤掉 falsy 值
const numbers = [0, 1, 2, null, 3, undefined, 4, false, 5]
const filtered = numbers.filter(identity)
// [1, 2, 3, 4, 5]

// 过滤空字符串
const strings = ['hello', '', 'world', '', 'foo']
const nonEmpty = strings.filter(identity)
// ['hello', 'world', 'foo']

// 过滤 null/undefined
const values = [1, null, 2, undefined, 3]
const defined = values.filter(identity)
// [1, 2, 3]
```

## 实际应用

### 应用 1: 作为默认函数

```typescript
function map<T, R>(
  arr: T[],
  fn: (item: T) => R = identity as any
): R[] {
  return arr.map(fn)
}

// 不提供转换函数时，返回原数组的副本
map([1, 2, 3])  // [1, 2, 3]

// 提供转换函数时，应用转换
map([1, 2, 3], x => x * 2)  // [2, 4, 6]
```

### 应用 2: 扁平化数组

```typescript
const nestedArrays = [[1, 2], [3, 4], [5, 6]]

// 使用 flatMap 和 identity 扁平化
const flattened = nestedArrays.flatMap(identity)
// [1, 2, 3, 4, 5, 6]

// 多层嵌套
const deepNested = [[[1, 2]], [[3, 4]], [[5, 6]]]
const oneLevelFlat = deepNested.flatMap(identity)
// [[1, 2], [3, 4], [5, 6]]
```

### 应用 3: 提取 Promise 值

```typescript
const promises = [
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]

// 等待所有 Promise 并提取值
Promise.all(promises).then(values => {
  console.log(values.map(identity))  // [1, 2, 3]
})
```

### 应用 4: 类型守卫

```typescript
interface User {
  name: string
  age?: number
}

const users: User[] = [
  { name: 'Alice', age: 25 },
  { name: 'Bob' },
  { name: 'Charlie', age: 30 }
]

// 过滤有年龄的用户
const usersWithAge = users.filter(u => identity(u.age))
// [{ name: 'Alice', age: 25 }, { name: 'Charlie', age: 30 }]
```

### 应用 5: 条件执行

```typescript
function processData<T>(
  data: T,
  shouldTransform: boolean,
  transform: (data: T) => T
): T {
  // 根据条件决定是否转换
  const fn = shouldTransform ? transform : identity
  return fn(data)
}

const data = { value: 10 }
processData(data, false, d => ({ ...d, value: d.value * 2 }))
// { value: 10 } - 未转换

processData(data, true, d => ({ ...d, value: d.value * 2 }))
// { value: 20 } - 已转换
```

### 应用 6: 管道中的占位符

```typescript
import { pipe } from '@about-me/fp'

const DEBUG = process.env.NODE_ENV !== 'production'

const processUser = (user: User) =>
  pipe(
    user,
    u => ({ ...u, name: u.name.toUpperCase() }),
    DEBUG ? (u => { console.log('Debug:', u); return u }) : identity,
    u => ({ ...u, verified: true })
  )

// 生产环境: 跳过 console.log
// 开发环境: 执行 console.log
```

### 应用 7: 对象转换

```typescript
interface APIResponse {
  data: any
  meta?: object
}

// 提取数据，如果没有 meta 则返回整个响应
const extractData = (response: APIResponse) => {
  return response.meta ? response.data : identity(response)
}

extractData({ data: [1, 2, 3], meta: {} })
// [1, 2, 3]

extractData({ data: [1, 2, 3] })
// { data: [1, 2, 3] }
```

### 应用 8: 测试辅助

```typescript
// 模拟外部依赖
function fetchData(
  url: string,
  transform: (data: any) => any = identity
) {
  return fetch(url)
    .then(r => r.json())
    .then(transform)
}

// 测试时不需要转换
await fetchData('/api/users')  // 原始数据

// 生产环境中应用转换
await fetchData('/api/users', users => users.map(u => u.name))
// 只获取名字
```

## 使用场景

### 适合的场景

- **默认参数** - 作为函数参数的默认值
- **过滤数组** - 过滤 falsy 值
- **扁平化** - 配合 flatMap 使用
- **条件转换** - 根据条件决定是否转换
- **占位符** - 在函数组合中作为无操作占位符
- **类型保持** - 需要函数但不需要转换时

### 可视化说明

```
输入 ──→ identity ──→ 输出
 5          │           5
            │
         原样返回
```

## 注意事项

### 1. 引用传递

identity 返回原对象引用，不是副本：

```typescript
const obj = { a: 1 }
const result = identity(obj)

result.a = 2
console.log(obj.a)  // 2 - 原对象也被修改
```

### 2. 类型安全

TypeScript 会保持类型：

```typescript
const num: number = identity(5)       // number
const str: string = identity('hello') // string
const arr: number[] = identity([1,2]) // number[]
```

### 3. 不是深拷贝

identity 不创建副本：

```typescript
// 需要副本时，使用其他方法
const obj = { a: 1, b: { c: 2 } }
const copy = { ...obj }              // 浅拷贝
const deepCopy = JSON.parse(JSON.stringify(obj))  // 深拷贝

// identity 不创建副本
const same = identity(obj)
same === obj  // true
```


[← 返回 API 文档](./README.md)
