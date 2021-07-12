import { createFiber } from "./fiber";
import { renderHooks } from "./hooks";
import { updateNode, isStringOrNumber, Update } from "./utils";

// 原生标签节点处理
export function updateHostComponent(workInProgress) {
  if (!workInProgress.stateNode) {
    workInProgress.stateNode = document.createElement(workInProgress.type);
    updateNode(workInProgress.stateNode, {}, workInProgress.props);
  }
  reconcileChildren(workInProgress, workInProgress.props.children);
}

// 处理函数组件
export function updateFunctionComponent(workInProgress) {
  renderHooks(workInProgress);

  const { type, props } = workInProgress;
  const children = type(props);
  return reconcileChildren(workInProgress, children);
}

// 类组件处理
export function updateClassComponent(workInProgress) {
  const { type, props } = workInProgress;
  const instance = new type(props);
  const children = instance.render();
  return reconcileChildren(workInProgress, children);
}

export function updateFragmentComponent(workInProgress) {
  // 协调子节点
  reconcileChildren(workInProgress, workInProgress.props.children);
}

// 处理 children， 构建fiber结构
export function reconcileChildren(workInProgress, children) {
  // 文本节点
  if (isStringOrNumber(children)) {
    return;
  }
  let newChildren = Array.isArray(children) ? children : [children];

  let previousNewFiber = null;
  // 老节点的头结点
  let oldFiber = workInProgress.alternate && workInProgress.alternate.child;
  // 数组，遍历
  for (let i = 0; i < newChildren.length; i++) {
    const child = newChildren[i];
    if (child === null) {
      continue;
    }

    const newFiber = createFiber(child, workInProgress);
    const same = sameNode(oldFiber, newFiber);

    // 更新
    if (same) {
      Object.assign(newFiber, {
        alternate: oldFiber, // 老节点
        stateNode: oldFiber.stateNode, // dom节点
        flags: Update, // fiber标记更新
      });
    }

    // 下一个需要比较的节点
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (previousNewFiber === null) {
      // 第一个子节点
      workInProgress.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
  }
}

// 同一个节点， 调用前提是同一个层级下
// className='red blue'
// className='red green'
function sameNode(a, b) {
  return !!(a && b && a.key === b.key && a.type === b.type);
}
