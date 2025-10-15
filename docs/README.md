# API 文档

欢迎查阅 `@about-me/fp` 详细的 API 文档。

## 文档导航

### 核心组合函数

- [pipe](./pipe.md) - 从左到右组合函数，最直观的数据流方式
- [pipeAsync](./pipeAsync.md) - 异步版本的 pipe，支持 Promise
- [compose](./compose.md) - 从右到左组合函数，数学风格

### 函数转换

- [curry](./curry.md) - 柯里化，将多参数函数转换为单参数函数序列
- [partial](./partial.md) - 部分应用，固定函数的部分参数

### 调试工具

- [tap](./tap.md) - 执行副作用但不改变值，用于调试和监控

### 基础工具

- [identity](./identity.md) - 恒等函数，返回输入值本身
- [constant](./constant.md) - 常量函数，返回固定值的函数

### 性能优化

- [memoize](./memoize.md) - 记忆化，缓存函数结果
- [debounce](./debounce.md) - 防抖，延迟执行
- [throttle](./throttle.md) - 节流，限制执行频率


