/**
 * !此文件测试 React-setState setState批量更新
 */

// import Counter from "./Counter";
import { NoMode, ConcurrentMode } from "./React-setState/ReactTypeOfMode";
import { ClassComponent, HostRoot } from "./React-setState/ReactWorkTags";

import { Component } from "./React-setState/ReactBaseClasses";
import { batchedUpdates } from "./React-setState/ReactFiberWorkLoop";

/**
 *  1. 并发模式 setState 会合并 0 0 1 1， 不管在哪里更新都会合并，通过更新优先级合并的
 * 2. 同步模式 0 0 2 3 ，如果用了 batchedUpdates 就会批量更新，不用就同步更新
 *
 * 为什么在react 事件系统中和生命周期函数中是批量的呢？
 * 因为 batchedUpdates 函数
 */

export default class Counter extends Component {
  state = { number: 0 };

  handleClick = (e) => {
    this.setState({ number: this.state.number + 1 });
    console.log("setState1", this.state);
    this.setState({ number: this.state.number + 1 });
    console.log("setState2", this.state);

    setTimeout(() => {
      this.setState({ number: this.state.number + 1 });
      console.log("setTimeout setState1", this.state);
      this.setState({ number: this.state.number + 1 });
      console.log("setTimeout setState2", this.state);
    });
  };

  render() {
    console.log("render", this.state);
    return (
      <div>
        <p>{this.state.number}</p>
        <button onClick={this.handleClick}>+</button>
      </div>
    );
  }
}
let mode = ConcurrentMode;
// 构建 fiber 树
let counterInstance = new Counter();
// 每个 fiber 有一个更新队列 updateQueue， 源码里是一个链表，这里用数组表示
let rootFiber = {
  tag: HostRoot,
  updateQueue: [],
  mode,
};
debugger;

let counterFiber = { tag: ClassComponent, updateQueue: [], mode };

rootFiber.child = counterFiber;
counterFiber.return = rootFiber;

counterFiber.stateNode = counterInstance; // fiber 的 stateNode 指向类的实例
counterInstance._reactInternals = counterFiber; //_reactInternal 指向组件实例对应的 fiber

/**
 * 注意：该 demo 用于测试 setState 更新过程，不设计初始化
 * 以下测试更新
 */
document.addEventListener("click", (event) => {
  debugger;
  let syntheticEvent = { nativeEvent: event }; // 根据原生事件创建合成事件
  // 源码里是通过事件，找到事件源，再通过事件源到对应的处理函数
  // counterInstance.handleClick(syntheticEvent); // 测试并发
  batchedUpdates(() => counterInstance.handleClick(syntheticEvent)); // 测试 NoMode 下
});
