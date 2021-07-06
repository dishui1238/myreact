import {
  updateClassComponent,
  updateFragmentComponent,
  updateFunctionComponent,
  updateHostComponent,
} from "./ReactFiberReconcile";
import { shouldYield } from "./scheduler";
import { isFunction, isStringOrNumber } from "./utils";

let nextUnitOfWork = null; // 下一个 fiber 任务
let wipRoot = null; // wip  work in progress 数据结构 fiber

export function scheduleUpdateOnFiber(fiber) {
  fiber.alternate = { ...fiber }; // 保存 fiber 更新前的 fiber tree
  wipRoot = fiber;
  wipRoot.sibling = null;
  nextUnitOfWork = wipRoot;
}

function performUnitOfWork(workInProgress) {
  const { type } = workInProgress;
  // * 1. 执行当前 fiber
  if (isFunction(type)) {
    type.prototype.isReactComponent
      ? updateClassComponent(workInProgress)
      : updateFunctionComponent(workInProgress);
  } else if (isStringOrNumber(type)) {
    updateHostComponent(workInProgress);
  } else {
    updateFragmentComponent(workInProgress);
  }

  // * 2. 深度优先 返回下一个 fiber
  if (workInProgress.child) {
    // 先找子节点
    return workInProgress.child;
  }
  // 没有子节点，找兄弟节点
  let nextFiber = workInProgress;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // 继续向上查找
    nextFiber = nextFiber.return;
  }
  return null;
}

function workLoop(IdleDeadline) {
  // 有下⼀个任务，并且当前帧还没有结束
  while (nextUnitOfWork && !shouldYield()) {
    // 执行当前 fiber ，返回下一个 fiber
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  if (!nextUnitOfWork && wipRoot) {
    // 提交
    commitRoot();
  }
}

/**
 * * requestIdleCallback
 * * 将在浏览器的空闲时段内调用的函数排队
 * *
 * * 参数  callback 一个在事件循环空闲时即将被调用的函数的引用, 函数会接收到一个名为 IdleDeadline 的参数
 * * IdleDeadline 提供了一个方法, 可以让你判断用户代理(浏览器)还剩余多少闲置时间可以用来执行耗时任务timeRemaining()
 * *
 * *
 */
requestIdleCallback(workLoop);

export function commitRoot() {
  commitWorker(wipRoot.child);
  wipRoot = null;
}

export function commitWorker(workInProgress) {
  if (!workInProgress) {
    return;
  }
  // step1: commit workInProgress
  let parentNodeFiber = workInProgress.return;
  while (!parentNodeFiber.stateNode) {
    parentNodeFiber = parentNodeFiber.return;
  }

  // 父（祖先）dom节点
  const parentNode = parentNodeFiber.stateNode;
  if (workInProgress.stateNode) {
    parentNode.appendChild(workInProgress.stateNode);
  }

  // step2: commit workInProgress.child
  commitWorker(workInProgress.child);
  // step1: commit workInProgress.sibling
  commitWorker(workInProgress.sibling);
}
