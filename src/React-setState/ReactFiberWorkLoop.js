import { SyncLane } from "./ReactFiberLane";
import { ClassComponent, HostRoot } from "./ReactWorkTags";

const SyncLanePriority = 12;
const syncQueue = [];

export function scheduleUpdateOnFiber(fiber, lane, eventTime) {
  // 从 fiber 找到根节点
  const root = markUpdateLaneFromFiberToRoot(fiber);
  ensureRootIsScheduled(root); // 创建一个任务，从根节点开始更新
}

// 开始调度根节点
function ensureRootIsScheduled(root) {
  const nextLanes = SyncLane;
  const newCallbackPriority = SyncLanePriority; // 按理说应该等于最高级别赛道的优先级
  let exitingCallbackPriority = root.callbackPriority;
  if (exitingCallbackPriority === newCallbackPriority) {
    // 这里是 --并发模式下，即使在 setState 里也是批量--的原因
    // 如果这个新的更新和当亲根节点的已经调度的更新想到，就直接返回，服用上次的更新，不用再创建新的更新任务
    return;
  }
  scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
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
    }
  }
}

// 根据老状态和更新队列计算新状态
function processUpdateQueue(inst, fiber) {

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
