# @about-me/fp

<div align="center">

**轻量级 TypeScript 函数式编程工具库**

[![npm version](https://img.shields.io/npm/v/@about-me/fp.svg)](https://www.npmjs.com/package/@about-me/fp)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/badge/gzipped-~2KB-green.svg)](https://bundlephobia.com/)
[![Tests](https://img.shields.io/badge/tests-97%20passing-brightgreen.svg)](./test)

提供 `pipe`、`compose`、`curry` 等 11 个核心函数式编程工具

[快速开始](#快速开始) · [API 参考](#api-参考) · [完整文档](https://github.com/llong8/fp/tree/main/docs) · [LLMS-txt](#llm-辅助编程文档)
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

## 文档

完整的 API 参考文档请访问 [GitHub 文档](https://github.com/llong8/fp/tree/main/docs) 

## API 参考

### 核心组合函数

| 函数 | 描述 | 使用场景 |
|------|------|---------|
| **[pipe](https://github.com/llong8/fp/blob/main/docs/pipe.md)** | 从左到右组合函数，支持同步和异步 | 数据转换管道、流程编排、异步操作 |
| **[compose](https://github.com/llong8/fp/blob/main/docs/compose.md)** | 从右到左组合函数 | 数学风格组合、高阶函数 |

### 函数转换

| 函数 | 描述 | 使用场景 |
|------|------|---------|
| **[curry](https://github.com/llong8/fp/blob/main/docs/curry.md)** | 柯里化 | 创建专用函数、参数复用 |
| **[partial](https://github.com/llong8/fp/blob/main/docs/partial.md)** | 部分应用 | 固定部分参数 |

### 副作用和调试

| 函数 | 描述 | 使用场景 |
|------|------|---------|
| **[tap](https://github.com/llong8/fp/blob/main/docs/tap.md)** | 执行副作用但不改变值，支持同步和异步 | 调试、日志、监控、异步日志 |

### 基础工具

| 函数 | 描述 | 使用场景 |
|------|------|---------|
| **[identity](https://github.com/llong8/fp/blob/main/docs/identity.md)** | 返回输入值本身 | 过滤假值、默认函数、类型保护 |
| **[constant](https://github.com/llong8/fp/blob/main/docs/constant.md)** | 返回常量函数 | 默认值、数组填充、事件处理 |

### 性能优化

| 函数 | 描述 | 使用场景 |
|------|------|---------|
| **[memoize](https://github.com/llong8/fp/blob/main/docs/memoize.md)** | 缓存函数结果 | 昂贵计算、递归优化 |
| **[debounce](https://github.com/llong8/fp/blob/main/docs/debounce.md)** | 防抖 | 搜索输入、自动保存 |
| **[throttle](https://github.com/llong8/fp/blob/main/docs/throttle.md)** | 节流 | 滚动事件、鼠标移动 |

## LLM 辅助编程文档

以下是 txt 格式的文档文件列表，包括 `llms.txt` 和 `llms-full.txt`。这些文件供大型语言模型（LLM）访问本库的编程文档及 API。

| 文件类型 | 链接 | 说明 |
|---------|------|------|
| **llms.txt** | https://github.com/llong8/fp/blob/main/llms/llms.txt | 索引文件，包含 API 列表和简短描述 |
| **llms-full.txt** | https://github.com/llong8/fp/blob/main/llms/llms-full.txt | 完整文档，包含详细说明和代码示例 |

### 使用方式

在 AI 编程助手（Claude、Copilot、Cursor 等）中引用文档：

```
@llms/llms.txt

请帮我使用 `@about-me/fp` 创建一个数据处理管道：
1. 过滤活跃用户
2. 按评分排序
3. 添加元数据
4. 在每一步记录日志
```


### llms.txt 和 llms-full.txt 的区别

- **llms.txt**：索引文件，包含 API 链接和简要描述，LLM 需点击链接获取详细内容
- **llms-full.txt**：完整文档，所有内容在单个文件中，无需额外访问

注意：`llms-full.txt` 文件较大，可能超出部分 LLM 的上下文窗口限制。


---

