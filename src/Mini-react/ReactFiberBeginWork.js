import { renderWithHooks } from "./ReactFiberHooks";
import {
  FunctionComponent,
  HostComponent,
  IndeterminateComponent,
} from "./ReactWorkTags";

/**
 * @param {*} current 上一次的 fiber，初次挂载的时候为 null
 * @param {*} workInprogress 这一次正在构建中的 fiber
 */
function beginWork(current, workInProgress) {
  switch (workInProgress.tag) {
    case IndeterminateComponent:
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type
      );

    default:
      break;
  }
}

// 挂载组件
function mountIndeterminateComponent(current, workInProgress, Component) {
  let children = renderWithHooks(null, workInProgress, Component);
  console.log("children", children);
  window.counter = children;
  workInProgress.tag = FunctionComponent;
  // 处理子节点
  reconcileChildren(current, workInProgress, children);
  return null;
}

function reconcileChildren(current, workInProgress, children) {
  let childFiber = {
    tag: HostComponent,
    type: children.type,
  };
  workInProgress.child = childFiber;
}
export { beginWork };
