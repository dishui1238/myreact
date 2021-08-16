import Counter from "./Counter";
import { NoMode } from "./ReactTypeOfMode";
import { ClassComponent, HostRoot } from "./ReactWorkTags";

// 构建 fiber 树
let counterInstance = new Counter();
// 每个 fiber 有一个更新队列 updateQueue， 源码里是一个链表，这里用数组表示
let rootFiber = { tag: HostRoot, updateQueue: [], mode: NoMode };

let counterFiber = { tag: ClassComponent, updateQueue: [], mode: NoMode };

rootFiber.child = counterFiber;
counterFiber.return = rootFiber;

counterFiber.stateNode = counterInstance; // fiber 的 stateNode 指向类的实例
counterInstance._reactInternal = counterFiber; //_reactInternal 指向组件实例对应的 fiber
