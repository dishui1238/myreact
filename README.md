React 和 vue diff 不同：

1. React 虚拟 dom 是单链表，进行单项查找， 利用 fiber 节点切分成小任务
2. Vue 虚拟 dom 是数组，进行双向查找

## TODO： 

1. React 事件委托