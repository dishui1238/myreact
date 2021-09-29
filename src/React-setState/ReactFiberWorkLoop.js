import { SyncLane } from "./ReactFiberLane";
import { ConcurrentMode, NoMode } from "./ReactTypeOfMode";
import { ClassComponent, HostRoot } from "./ReactWorkTags";

const SyncLanePriority = 12;
const NoLanePriority = 12;
const syncQueue = [];
let NoContext = 0; // 非批量
let BatchedContext = 1; // 批量
let excutionContext = NoContext; // 当前执行环境

export function scheduleUpdateOnFiber(fiber, lane, eventTime) {
  // 从 fiber 找到根节点
  const root = markUpdateLaneFromFiberToRoot(fiber);
  ensureRootIsScheduled(root); // 创建一个任务，从根节点开始更新
  // 如果当前的执行上下文环境是 NoMode(非批量)并且 mode 不是并发的话, 直接 flush
  if (excutionContext === NoMode && (fiber.mode & ConcurrentMode) === NoMode) {
    flushSyncCallbackQueue();
  }
}

export function batchedUpdates(fn) {
  let preExcutionContext = excutionContext; // 老的执行环境
  excutionContext |= BatchedContext; // 改成批量模式
  fn();
  excutionContext = preExcutionContext; // 改回来
}

// 开始调度根节点
function ensureRootIsScheduled(root) {
  const nextLanes = SyncLane;
  const newCallbackPriority = SyncLanePriority; // 按理说应该等于最高级别赛道的优先级
  let exitingCallbackPriority = root.callbackPriority;
  if (exitingCallbackPriority === newCallbackPriority) {
    // 这里是 --并发模式下，即使在 setState 里也是批量--的原因, 第一次更新不等，第二次更新相等直接 return
    // 如果这个新的更新和当亲根节点的已经调度的更新相等，就直接返回，复用上次的更新，不用再创建新的更新任务
    return;
  }
  scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
  queueMicrotask(flushSyncCallbackQueue); // 将更新放入微任务
  root.callbackPriority = newCallbackPriority;
}

function flushSyncCallbackQueue() {
  syncQueue.forEach((cb) => cb());
  syncQueue.length = 0;
}

// 把 performSyncWorkOnRoot 函数添加到一个队列里，等待执行
function scheduleSyncCallback(callback) {
  syncQueue.push(callback);
}
// 真正的渲染任务，比较新老节点，diff 更新 dom
function performSyncWorkOnRoot(workInProgress) {
  let root = workInProgress;
  while (workInProgress) {
    // 开始执行调和任务
    if (workInProgress.tag === ClassComponent) {
      let inst = workInProgress.stateNode; // 获取此 fiber 对应的类组件实例
      inst.state = processUpdateQueue(inst, workInProgress);
      inst.render(); // 得到新状态后就可以调用render 得到新的虚拟 dom 进行 dom diff
    }
    workInProgress = workInProgress.child;
  }
  commitRoot(root);
}

function commitRoot(root) {
  root.callbackPriority = NoLanePriority;
}

// 根据老状态和更新队列计算新状态
function processUpdateQueue(inst, fiber) {
  return fiber.updateQueue.reduce((state, { payload }) => {
    if (typeof payload === "function") {
      payload = payload(state);
    }
    return { ...state, ...payload };
  }, inst.state);
}

// 递归查找根节点
function markUpdateLaneFromFiberToRoot(fiber) {
  let parent = fiber.return;
  while (parent) {
    fiber = parent;
    parent = parent.return;
  }
  if (fiber.tag === HostRoot) {
    return fiber;
  }
  return null;
}
