let ReactCurrentDispatcher = { current: null };
let workInProgressHook = null; // 当前正在工作的 hook
let currentlyRenderingFiber = null; // 当前正在渲染的 fiber

const HooksDispatcherOnMount = {
  useReducer: mountReducer, // 不同的阶段 useReducer 有不同的实现
};

export function useReducer(reducer, initialArg) {
  return ReactCurrentDispatcher.current.useReducer(reducer, initialArg);
}

export function renderWithHooks(current, workInProgress, Component) {
  currentlyRenderingFiber = workInProgress;
  ReactCurrentDispatcher.current = HooksDispatcherOnMount;
  let children = Component(); // 组件渲染方法
  currentlyRenderingFiber = null;
  workInProgressHook = null;
  return children;
}

/**
 * @param {*} reducer
 * @param {*} initialArg 初始值
 */
function mountReducer(reducer, initialArg) {
  // 构建 hooks 单项链表
  let hook = mountWorkInProgressHook();
  hook.memoizedState = initialArg;
  const queue = (hook.queue = { pending: null }); // 更新队列
  const dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue);
  return [hook.memoizedState, dispatch];
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
