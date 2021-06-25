let workInProgressHook = null;
let currentlyRenderingFiber = null; // 当前正在工作的 fiber

export function renderHooks(wip) {
  currentlyRenderingFiber = wip;
  currentlyRenderingFiber.memoizedState = null; // 第 0 个 hook
  workInProgressHook = null;
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
  const dispatch = (action) => {
    console.log("useReducer");
  };
  return [initalState, dispatch];
}
