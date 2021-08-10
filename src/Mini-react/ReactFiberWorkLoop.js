import { beginWork } from "./ReactFiberBeginWork";

let workInprogress = null;

// 执行工作单元，每个 fiber 都是一个工作单元
function perforUnitOfWork(unitOfWork) {
  return beginWork();
}

function workLoop(params) {
  while (workInprogress !== null) {
    workInprogress = perforUnitOfWork(workInprogress);
  }
}

function render(fiber) {
  workInprogress = fiber;
  workLoop();
}

export { render };
