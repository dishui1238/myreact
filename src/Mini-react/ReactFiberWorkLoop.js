import { beginWork } from "./ReactFiberBeginWork";

let workInprogress = null;

// 执行工作单元，每个 fiber 都是一个工作单元
function perforUnitOfWork(unitOfWork) {
  let current = unitOfWork.alternate; // 更新时是有值得
  return beginWork(current, unitOfWork);
}

function workLoop(params) {
  while (workInprogress !== null) {
    workInprogress = perforUnitOfWork(workInprogress);
  }
}

/**
 * 在源码里此处要从当前 fiber，向上找到根节点再进行更新
 * 此处简化逻辑,直接构建新的 fiber
 */
export function scheduleUpdateOnFiber(oldFiber) {
  let newFiber = {
    ...oldFiber,
    alternate: oldFiber, // 老 fiber
  };
  workInprogress = newFiber;
  workLoop();
}

function render(fiber) {
  workInprogress = fiber;
  workLoop();
}

export { render };
