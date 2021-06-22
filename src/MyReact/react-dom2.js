function render(vnode, container) {
  wipRoot = {
    stateNode: container,
    props: { children: vnode },
  };
  nextUnitOfWork = wipRoot;
}

// 返回一个真实的 dom 节点
function createNode(workInProgress) {
  const { type, props } = workInProgress;
  let node = null;
  if (typeof type === "string") {
    // 原生标签
    node = document.createElement(type);
  }
  updateNode(node, props);
  return node;
}

// 原生标签节点处理
function updateHostComponent(workInProgress) {
  if (!workInProgress.stateNode) {
    workInProgress.stateNode = createNode(workInProgress);
  }
  reconcileChildren(workInProgress, workInProgress.props.children);
}

// 处理函数组件
function updateFunctionComponent(workInProgress) {
  const { type, props } = workInProgress;
  const children = type(props);
  return reconcileChildren(workInProgress, children);
}

// 类组件处理
function updateClassComponent(workInProgress) {
  const { type, props } = workInProgress;
  const instance = new type(props);
  const children = instance.render();
  return reconcileChildren(workInProgress, children);

}

// 处理 children， 构建fiber结构
function reconcileChildren(workInProgress, children) {
  // 文本节点
  if (
    workInProgress.props &&
    typeof workInProgress.props.children === "string"
  ) {
    return;
  }
  let newChildren = Array.isArray(children) ? children : [children];

  let previousNewFiber = null;
  // 数组，遍历
  for (let i = 0; i < newChildren.length; i++) {
    const child = newChildren[i];

    let newFiber = null; // 生成的 fiber 节点
    newFiber = {
      type: child.type,
      props: child.props,
      child: null,
      sibling: null,
      return: workInProgress,
      stateNode: null,
    };
    if (i === 0) {
      // 第一个子节点
      workInProgress.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
  }
}

// 处理属性
function updateNode(node, props) {
  // const { children, ...resetProps } = props;
  for (const key in props) {
    // 文本处理
    if (key === "children") {
      if (typeof props.children === "string") {
        node.appendChild(document.createTextNode(props.children));
      }
    } else {
      node[key] = props[key];
    }
    // node.setAttribute(key, resetProps[key])
  }
}

// ================================== fiber ================================================

/**
 * ! fiber 结构
 *
 * child 第一个子节点
 * sibling 下一个兄弟
 * return 父节点
 * stateNode dom节点
 * type 节点类型 'div'、function、class
 *
 */

function performUnitOfWork(workInProgress) {
  const { type } = workInProgress;
  // * 1. 执行当前 fiber
  if (typeof type === "function") {
    type.prototype.isReactComponent
      ? updateClassComponent(workInProgress)
      : updateFunctionComponent(workInProgress);
  } else {
    updateHostComponent(workInProgress);
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
}

let nextUnitOfWork = null; // 下一个 fiber 任务
let wipRoot = null; // wip  work in progress 数据结构 fiber

function workLoop(IdleDeadline) {
  // 有下⼀个任务，并且当前帧还没有结束
  while (nextUnitOfWork && IdleDeadline.timeRemaining() > 1) {
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

function commitRoot(params) {
  commitWorker(wipRoot.child);
  wipRoot = null;
}

function commitWorker(workInProgress) {
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

const ReactDOM = { render };
export default ReactDOM;
