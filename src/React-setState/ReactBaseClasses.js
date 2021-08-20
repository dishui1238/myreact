import { SyncLane } from "./ReactFiberLane";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

const classComponentUpdater = {
  // 1. 第一个参数是组件实例，第二个参数是新状态
  enqueueSetState(inst, payload, callback) {
    const fiber = get(inst);
    const eventTime = requestEventTime(); // 获取事件执行时间
    const lane = requestUpdateLane(fiber); // 计算本次更新的优先级，开启一个赛道 lane-赛道
    const update = createUpdate(eventTime, lane); // 创建新的更新对象
    update.payload = payload;
    // 有回调加上回调函数
    if (callback !== undefined && callback !== null) {
      update.callback = callback;
    }
    enqueueUpdate(fiber, update, lane);
    scheduleUpdateOnFiber(fiber); // 开始调度
  },
};

function enqueueUpdate(fiber, update) {
  // 源码里面是构建一个环形 链表
  // 更新队列为空 - 初始化时
  const updateQueue = fiber.updateQueue;
  if (updateQueue === null) {
    return;
  }
  fiber.updateQueue.push(update);
}

function get(inst) {
  return inst._reactInternals;
}

/**
 * 任务是有优先级的，优先级高的任务会打断优先级低的任务
 * 优先级低的任务可以加一个超时时间，超过该时间不能被打断，防止低优先级任务饿死
 */
function requestEventTime() {
  // 程序从启动到现在的时间，是用来计算任务的过期时间的
  return performance.now();
}

/**
 * react 里面有 31 个赛道  reactFiberLane 文件
 */
function requestUpdateLane(fiber) {
  // 这个地方应该按当前时间的优先级计算应该分配哪个赛道
  return SyncLane;
}

function createUpdate(eventTime, lane) {
  return { eventTime, lane };
}

export function Component(props, context) {
  this.props = props;
  this.context = context;
  this.updater = classComponentUpdater;
}

// 标记 isReactComponent
Component.prototype.isReactComponent = {};

Component.prototype.setState = function (partialState, callback) {
  // 将 state 放入队列中
  this.updater.enqueueSetState(this, partialState, callback);
};
