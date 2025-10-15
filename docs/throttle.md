# throttle

**节流** - 限制函数执行频率，固定时间间隔内最多执行一次

## 函数签名

```typescript
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void
```

## 描述

`throttle` 函数创建一个节流版本的函数。在固定时间间隔内，无论调用多少次，函数最多只执行一次。第一次调用会立即执行，后续调用在间隔期内会被忽略。

## 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `fn` | `T extends (...args: any[]) => any` | 要节流的函数 |
| `delayMs` | `number` | 时间间隔（毫秒） |

## 返回值

- **类型**: `(...args: Parameters<T>) => void`
- **描述**: 节流后的函数

## 基础示例

### 示例 1: 滚动事件处理

```typescript
import { throttle } from '@about-me/fp'

const handleScroll = () => {
  console.log('滚动位置:', window.scrollY)
  // 更新UI、检查是否到底等
}

const throttledScroll = throttle(handleScroll, 1000)

window.addEventListener('scroll', throttledScroll)
// 无论滚动多快，每秒最多执行一次
```

### 示例 2: 鼠标移动追踪

```typescript
const trackPosition = (e: MouseEvent) => {
  console.log('鼠标位置:', e.clientX, e.clientY)
  // 记录位置、更新坐标显示等
}

const throttledTrack = throttle(trackPosition, 100)

document.addEventListener('mousemove', throttledTrack)
// 每 100ms 最多记录一次位置
```

## 实际应用

### 应用 1: 窗口调整大小

```typescript
const updateLayout = () => {
  console.log('窗口大小:', window.innerWidth, 'x', window.innerHeight)
  // 重新计算布局
  // 重绘图表
  // 调整响应式元素
}

const throttledResize = throttle(updateLayout, 250)

window.addEventListener('resize', throttledResize)
// 调整窗口时，每 250ms 最多更新一次布局
```

### 应用 2: 实时数据更新

```typescript
interface DataPoint {
  value: number
  timestamp: number
}

const updateChart = (data: DataPoint) => {
  console.log('更新图表:', data)
  // 更新图表显示
  // 重绘数据点
}

const throttledUpdate = throttle(updateChart, 1000)

// WebSocket 接收实时数据
socket.on('data', (data: DataPoint) => {
  throttledUpdate(data)
  // 数据流再快，每秒最多更新一次图表
})
```

### 应用 3: API 请求限流

```typescript
const fetchSearchResults = (query: string) => {
  console.log('搜索:', query)
  fetch(`/api/search?q=${query}`)
    .then(response => response.json())
    .then(results => displayResults(results))
}

const throttledSearch = throttle(fetchSearchResults, 500)

searchInput.addEventListener('input', (e) => {
  throttledSearch(e.target.value)
  // 每 500ms 最多发送一次请求
})
```

## 何时使用

### 适合的场景

- **滚动事件** - 检查滚动位置、无限滚动
- **鼠标移动** - 追踪坐标、拖拽操作
- **窗口调整** - 响应式布局更新
- **实时数据** - 图表更新、数据流处理
- **游戏输入** - 技能冷却、连击限制
- **性能监控** - 定期上报指标

### 可视化说明

```
用户操作: ||||||||||||||||||||||||||||||||

throttle(fn, 1000):
执行时机: ↓       ↓       ↓       ↓
         0s      1s      2s      3s

(每秒执行一次，立即开始)
```

## 与 debounce 的区别

```typescript
// throttle: 固定间隔执行
const throttledScroll = throttle(handleScroll, 1000)
// 滚动开始立即执行，之后每秒执行一次

// debounce: 等待不活动后执行
const debouncedScroll = debounce(handleScroll, 1000)
// 停止滚动 1 秒后才执行
```

### 选择建议

- **throttle**: 需要定期反馈（滚动进度、鼠标位置、实时数据）
- **debounce**: 等待操作完成（搜索、自动保存、输入验证）

### 对比表格

| 特性 | throttle | debounce |
|------|----------|----------|
| 执行时机 | 开始时立即执行 | 结束后延迟执行 |
| 执行频率 | 固定间隔执行 | 只执行最后一次 |
| 适用场景 | 滚动、移动、实时更新 | 搜索、保存、验证 |
| 用户体验 | 即时反馈 | 等待完成 |

## 注意事项

### 1. 立即执行

throttle 在第一次调用时会立即执行：

```typescript
const fn = throttle(() => console.log('执行'), 1000)

fn()  // 立即输出 "执行"
fn()  // 被忽略
fn()  // 被忽略
// 1 秒后才能再次执行
```

### 2. 参数使用

throttle 使用第一次调用的参数：

```typescript
const fn = throttle((x: number) => console.log(x), 1000)

fn(1)  // 输出 1
fn(2)  // 被忽略
fn(3)  // 被忽略
// 使用的是第一次的参数 1
```

### 3. 返回值丢失

节流函数不返回原函数的返回值：

```typescript
const add = (a: number, b: number) => a + b
const throttledAdd = throttle(add, 1000)

const result = throttledAdd(1, 2)  // undefined
// 原函数的返回值丢失
```

### 4. 间隔时间选择

根据不同场景选择合适的间隔：

```typescript
// 滚动/鼠标移动: 100-250ms
const throttledMove = throttle(handleMove, 100)

// 窗口调整: 150-250ms
const throttledResize = throttle(handleResize, 200)

// API 请求: 300-500ms
const throttledFetch = throttle(fetchData, 500)

// 实时数据: 1000-2000ms
const throttledUpdate = throttle(updateChart, 1000)

// 按钮保护: 2000-3000ms
const throttledSubmit = throttle(handleSubmit, 2000)
```


[← 返回 API 文档](./README.md)
