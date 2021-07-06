React 和 vue diff 不同：

1. React 虚拟 dom 是单链表，进行单项查找， 利用 fiber 节点切分成小任务
2. Vue 虚拟 dom 是数组，进行双向查找

Fiber

```
实际上 requestIdleCallback 功能并不稳定，不建议用于生产环境，本例仅用于模拟 React 的思路，React 本身并不是通过 requestIdleCallback 来实现让浏览器在空闲时间渲染工作单元的。
```

## TODO： 

1. React 事件委托