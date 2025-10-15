# debounce

**防抖** - 延迟执行，只执行最后一次调用

## 函数签名

```typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void
```

## 描述

`debounce` 函数创建一个防抖版本的函数。在连续调用时，会取消之前的调用，只在停止调用后等待指定延迟时间后执行最后一次调用。

## 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `fn` | `T extends (...args: any[]) => any` | 要防抖的函数 |
| `delayMs` | `number` | 延迟时间（毫秒） |

## 返回值

- **类型**: `(...args: Parameters<T>) => void`
- **描述**: 防抖后的函数

## 基础示例

### 示例 1: 搜索输入优化

```typescript
import { debounce } from '@about-me/fp'

const searchAPI = (query: string) => {
  console.log('搜索:', query)
  fetch(`/api/search?q=${query}`)
}

const debouncedSearch = debounce(searchAPI, 300)

// 用户快速输入 "hello"
debouncedSearch('h')      // 取消
debouncedSearch('he')     // 取消
debouncedSearch('hel')    // 取消
debouncedSearch('hell')   // 取消
debouncedSearch('hello')  // 等待 300ms 后执行

// 只会执行一次搜索，查询 "hello"
```

### 示例 2: 窗口大小调整

```typescript
const handleResize = debounce(() => {
  console.log('窗口大小:', window.innerWidth, 'x', window.innerHeight)
  // 重新布局、重新计算等
}, 250)

window.addEventListener('resize', handleResize)
// 调整窗口大小时，停止调整 250ms 后才执行
```

## 实际应用

### 应用 1: 表单自动保存

```typescript
interface FormData {
  title: string
  content: string
}

const saveForm = async (data: FormData) => {
  console.log('保存表单...')
  await fetch('/api/save', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

const debouncedSave = debounce(saveForm, 1000)

// 用户输入时自动保存
inputElement.addEventListener('input', (e) => {
  const formData = getFormData()
  debouncedSave(formData)
  // 停止输入 1 秒后才保存
})
```

### 应用 2: 输入验证

```typescript
const validateUsername = async (username: string) => {
  console.log('验证用户名:', username)
  const response = await fetch(`/api/validate?username=${username}`)
  const { available } = await response.json()

  if (available) {
    showMessage('用户名可用', 'success')
  } else {
    showMessage('用户名已被使用', 'error')
  }
}

const debouncedValidate = debounce(validateUsername, 500)

usernameInput.addEventListener('input', (e) => {
  debouncedValidate(e.target.value)
  // 停止输入 500ms 后才验证
})
```

### 应用 3: 滚动加载更多

```typescript
const loadMoreContent = async () => {
  console.log('加载更多内容...')
  const response = await fetch('/api/content?page=' + currentPage)
  const data = await response.json()
  appendContent(data)
  currentPage++
}

const debouncedLoadMore = debounce(loadMoreContent, 300)

window.addEventListener('scroll', () => {
  const scrollBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100

  if (scrollBottom) {
    debouncedLoadMore()
    // 停止滚动 300ms 后才加载
  }
})
```

## 何时使用

### 适合的场景

- **搜索输入** - 等用户输入完成后再搜索
- **表单自动保存** - 停止编辑后才保存
- **窗口 resize** - 调整完成后才重新布局
- **输入验证** - 输入完成后才验证
- **API 请求减少** - 避免频繁请求

### 可视化说明

```
用户操作: ||||||||||||||||||||||||||||||||

debounce(fn, 1000):
执行时机:                                   ↓
                                           1秒
(等待 1 秒不活动后执行最后一次)
```

## 与 throttle 的区别

```typescript
// debounce: 等待不活动后执行
const debouncedSearch = debounce(searchAPI, 300)
// 用户停止输入 300ms 后才执行

// throttle: 固定时间间隔执行
const throttledSearch = throttle(searchAPI, 300)
// 每 300ms 最多执行一次
```

### 选择建议

- **debounce**: 等待用户完成操作（搜索、输入、编辑）
- **throttle**: 需要定期执行（滚动位置、鼠标移动）

## 注意事项

### 1. 最后一次调用的参数

debounce 会使用最后一次调用的参数：

```typescript
const fn = debounce((x: number) => console.log(x), 1000)

fn(1)
fn(2)
fn(3)  // 只会输出 3
```

### 2. 返回值丢失

防抖函数不返回原函数的返回值：

```typescript
const add = (a: number, b: number) => a + b
const debouncedAdd = debounce(add, 1000)

const result = debouncedAdd(1, 2)  // undefined
// 原函数的返回值丢失
```

### 3. 异步函数

对于异步函数，无法直接获取 Promise：

```typescript
const asyncFn = async (x: number) => x * 2
const debouncedAsync = debounce(asyncFn, 1000)

// 无法 await
// await debouncedAsync(5)  // 不会按预期工作
```



[← 返回 API 文档](./README.md)
