# @about-me/fp

<div align="center">

**轻量级 TypeScript 函数式编程工具库**

[![npm version](https://img.shields.io/npm/v/@about-me/fp.svg)](https://www.npmjs.com/package/@about-me/fp)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/badge/gzipped-~2KB-green.svg)](https://bundlephobia.com/)
[![Tests](https://img.shields.io/badge/tests-97%20passing-brightgreen.svg)](./test)

提供 `pipe`、`compose`、`curry` 等 11 个核心函数式编程工具

[快速开始](#快速开始) · [API 文档](#api-文档) · [完整文档](./docs/README.md)
</div>

---


## 安装

```bash
npm install @about-me/fp
# 或
pnpm add @about-me/fp
```

## 快速开始

```typescript
import { pipe, curry, tap, debounce } from '@about-me/fp'

// 1. 使用 pipe 创建数据处理管道
const result = pipe(
  [1, 2, 3, 4, 5],
  arr => arr.map(x => x * 2),
  tap(x => console.log('Doubled:', x)),  // 调试不影响数据流
  arr => arr.filter(x => x > 5),
  arr => arr.reduce((sum, x) => sum + x, 0)
)
// 输出: 24

// 2. 使用 curry 创建专用函数
const filterBy = curry((prop, value, arr) =>
  arr.filter(item => item[prop] === value)
)

const users = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'user' }
]

const getAdmins = filterBy('role')('admin')
getAdmins(users)  // [{ name: 'Alice', role: 'admin' }]

// 3. 使用 debounce 优化搜索
const searchAPI = debounce((query: string) => {
  fetch(`/api/search?q=${query}`)
}, 300)

input.addEventListener('input', e => searchAPI(e.target.value))
// 输入停止 300ms 后才发送请求
```

## API 文档
> 完整 API 文档请访问 [文档](./docs/README.md) 目录。
### 核心组合函数

| 函数 | 描述 | 使用场景 |
|------|------|---------|
| **[pipe](./docs/pipe.md)** | 从左到右组合函数 | 数据转换管道、流程编排 |
| **[pipeAsync](./docs/pipeAsync.md)** | 异步版本的 pipe | API 调用、异步流程 |
| **[compose](./docs/compose.md)** | 从右到左组合函数 | 数学风格组合、高阶函数 |

### 函数转换

| 函数 | 描述 | 使用场景 |
|------|------|---------|
| **[curry](./docs/curry.md)** | 柯里化 | 创建专用函数、参数复用 |
| **[partial](./docs/partial.md)** | 部分应用 | 固定部分参数 |

### 调试工具

| 函数 | 描述 | 使用场景 |
|------|------|---------|
| **[tap](./docs/tap.md)** | 执行副作用但不改变值 | 调试、日志、监控 |

### 基础工具

| 函数 | 描述 | 使用场景 |
|------|------|---------|
| **[identity](./docs/identity.md)** | 返回输入值本身 | 过滤假值、默认函数、类型保护 |
| **[constant](./docs/constant.md)** | 返回常量函数 | 默认值、数组填充、事件处理 |

### 性能优化

| 函数 | 描述 | 使用场景 |
|------|------|---------|
| **[memoize](./docs/memoize.md)** | 缓存函数结果 | 昂贵计算、递归优化 |
| **[debounce](./docs/debounce.md)** | 防抖 | 搜索输入、自动保存 |
| **[throttle](./docs/throttle.md)** | 节流 | 滚动事件、鼠标移动 |



---

