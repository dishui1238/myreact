import React from "react";
import { IndeterminateComponent } from "./ReactWorkTags";
import { render } from "./ReactFiberWorkLoop";
import { useReducer } from "./ReactFiberHooks";

const reducer = (state, action) => {
  if (action.type === "add") {
    return state + 1;
  } else {
    return state;
  }
};

function Counter() {
  debugger;
  const [number, setNumber] = useReducer(reducer, 0);

  return <div onClick={() => setNumber({ type: "add" })}>{number}</div>;
}

// 正常来说我们需要从根节点一直向下构建 fiber
let workInprogress = {
  tag: IndeterminateComponent, // 函数组件在初次渲染时
  type: Counter, // 此组件的具体类型是哪个组件
  alternate: null, // 上一次渲染的 fiber
};

render(workInprogress);

// ReactDOM.render(<Counter />, document.getElementById("root"));
