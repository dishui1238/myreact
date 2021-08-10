import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

let ReactCurrentDispatcher = { current: null };
let workInProgressHook = null; // 当前正在工作的 hook
let currentHook = null; // 当前的老 hook
let currentlyRenderingFiber = null; // 当前正在渲染的 fiber

const HooksDispatcherOnMount = {
  useReducer: mountReducer, // 不同的阶段 useReducer 有不同的实现
};
const HooksDispatcherOnUpdate = {
  useReducer: updateReducer, // 不同的阶段 useReducer 有不同的实现
};

export function renderWithHooks(current, workInProgress, Component) {
  currentlyRenderingFiber = workInProgress;
  currentlyRenderingFiber.memoizedState = null; // 清空 hook 单向链表
  if (current !== null) {
    ReactCurrentDispatcher.current = HooksDispatcherOnUpdate;
  } else {
    ReactCurrentDispatcher.current = HooksDispatcherOnMount;
  }
  let children = Component(); // 组件渲染方法
  currentlyRenderingFiber = null;
  workInProgressHook = null;
  currentHook = null;
  return children;
}

/**
 * 挂载 Reducer
 * @param {*} reducer
 * @param {*} initialArg 初始值
 */
function mountReducer(reducer, initialArg) {
  // 构建 hooks 单项链表
  let hook = mountWorkInProgressHook();
  hook.memoizedState = initialArg;
  const queue = (hook.queue = { pending: null }); // 更新队列
  // 每次绑定都会返回一份新的函数
  const dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue);
  return [hook.memoizedState, dispatch];
}

function mountWorkInProgressHook(params) {
  let hook = {
    memoizedState: null, // 自己的状态
    queue: null, // 自己的更新队列 环形链表
    next: null, // 下一个更新
  };
  // 说明这是第一个 hook
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}

/**
 * 更新 reducer
 * @param {*} reducer
 * @param {*} initialArg 初始值
 */
function updateReducer(reducer, initialArg) {
  // 构建 hooks 单项链表
  let hook = updateWorkInProgressHook();
  const queue = hook.queue; // 新 hook 的更新队列
  let current = currentHook; // 老的 hook
  const pendingQueue = queue.pending; // update 的环状链表最后一个节点
  if (pendingQueue !== null) {
    // 根据老的状态和更新队列里的更新对象计算新的状态
    let first = pendingQueue.next; // pendingQueue 指向最后一个节点，它的 next 指向第一个节点
    let newState = current.memoizedState; // 老状态
    let update = first;
    do {
      const action = update.action; // action 对象 {type: 'ADD'}
      newState = reducer(newState, action);
      update = update.next;
    } while (update !== null && update !== first);
    queue.pending = null; // 更新过了可以清空更新环形链表
    hook.memoizedState = newState; // 让新的 hook memoizedState 对象等于计算的新状态

    const dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue);
    return [hook.memoizedState, dispatch];
  }
}

function updateWorkInProgressHook() {
  let nextCurrentHook;
  if (nextCurrentHook === null) {
    // 第一个 hook
    let current = currentlyRenderingFiber.alternate; // 新 fiber 的 alternate 指向老的 fiber
    nextCurrentHook = current.memoizedState; // 老的 hook 链表的第一个节点
  } else {
    nextCurrentHook = currentHook.next;
  }
  currentHook = nextCurrentHook;

  const newHook = {
    memoizedState: currentHook.memoizedState,
    queue: currentHook.queue,
    next: null,
  };

  if (workInProgressHook === null) {
    // 第一个 hook
    currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
  } else {
    workInProgressHook = workInProgressHook.next = newHook;
    // workInProgressHook.next = newHook // 当前 hook 的 next 指针指向下一个 hook
    // workInProgressHook = newHook // workInProgressHook 指向最新的 hook
  }
  return workInProgressHook;
}

export function useReducer(reducer, initialArg) {
  return ReactCurrentDispatcher.current.useReducer(reducer, initialArg);
}

function dispatchAction(currentlyRenderingFiber, queue, action) {
  const update = { action, next: null }; // 创建一个新的 update 对象
  const pending = queue.pending;
  if (pending === null) {
    update.next = update; // 让自己和自己构建成一个循环链表
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  queue.penfing = update;
  // 调度更新
  scheduleUpdateOnFiber(currentlyRenderingFiber);
}
