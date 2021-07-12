// next 指针指向下一个 hook , workInProgressHook 指向最后一个（当前正在工作的） hook
// fiber.memoizedState --> hook0(next) -> hook1(next) --> hook2(next) --> hook3(workInProgressHook)

import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

let workInProgressHook = null; // 指向当前正在工作的hook
let currentlyRenderingFiber = null; // 当前正在工作的 fiber

export function renderHooks(wip) {
  currentlyRenderingFiber = wip;
  currentlyRenderingFiber.memoizedState = null; // 第 0 个 hook
  workInProgressHook = null;
}

function updateWorkInprogressHook() {
  let hook;
  const current = currentlyRenderingFiber.alternate; // 老的节点

  if (current) {
    // 更新 ------ 从老的 fiber 上找到 hook 更新到新的 fiber 上
    currentlyRenderingFiber.memoizedState = current.memoizedState;
    if (workInProgressHook) {
      // 不是第 0 个 hook
      hook = workInProgressHook = workInProgressHook.next;
    } else {
      // 第 0 个 hook
      hook = workInProgressHook = current.memoizedState;
    }
  } else {
    // 初次渲染 ----- memoizedState 状态值，next 指向下一个 hook
    hook = { memoizedState: null, next: null };

    // 将 hook 挂到当前工作的 fiber 上
    if (workInProgressHook) {
      // 不是第 0 个 hook
      // 1. next 指针指向该 hook
      // 2. 更新当前工作的 hook
      workInProgressHook = workInProgressHook.next = hook;
    } else {
      // 第 0 个 hook
      // 1. currentlyRenderingFiber.memoizedState 指向第 0 个 hook
      // 2. 更新当前正在工作的 hook
      workInProgressHook = currentlyRenderingFiber.memoizedState = hook;
    }
  }
  return hook;
}

export function useState(init) {
  const oldHook =
    currentlyRenderingFiber.base &&
    currentlyRenderingFiber.base.hooks[currentlyRenderingFiber.hookIndex];

  let state = init;
  const setState = (newVal) => {
    state = newVal;
  };
  return [state, setState];
}

export function useReducer(reducer, initalState) {
  const hook = updateWorkInprogressHook();

  if (!currentlyRenderingFiber.alternate) {
    // 初次渲染
    hook.memoizedState = initalState;
  }

  const dispatch = (action) => {
    console.log("useReducer", hook);
    // 计算状态值
    hook.memoizedState = reducer(hook.memoizedState, action);
    scheduleUpdateOnFiber(currentlyRenderingFiber);
  };
  return [hook.memoizedState, dispatch];
}
