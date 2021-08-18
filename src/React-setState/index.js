// import Counter from "./Counter";
import { NoMode, ConcurrentMode } from "./ReactTypeOfMode";
import { ClassComponent, HostRoot } from "./ReactWorkTags";

import { Component } from "./ReactBaseClasses";


/**
 *  1. 并发模式 setState 会合并 0 0 1 1， 不管在哪里更新都会合并
 * 2. 同步模式 0 0 2 3 
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
      console.log("setState1", this.state);
      this.setState({ number: this.state.number + 1 });
      console.log("setState2", this.state);
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

let counterFiber = { tag: ClassComponent, updateQueue: [], mode };

rootFiber.child = counterFiber;
counterFiber.return = rootFiber;

counterFiber.stateNode = counterInstance; // fiber 的 stateNode 指向类的实例
counterInstance._reactInternals = counterFiber; //_reactInternal 指向组件实例对应的 fiber

// 以下测试更新
document.addEventListener("click", (event) => {
  debugger;
  let syntheticEvent = { nativeEvent: event }; // 根据原生事件创建合成事件
  // 源码里是通过事件，找到事件源，再通过事件源到对应的处理函数
  counterInstance.handleClick(syntheticEvent);
});
