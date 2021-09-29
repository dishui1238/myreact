/**
 * !此文件测试 mini-react  关于 hooks 的更新顺序
 */

/*
 * @Author: your name
 * @Date: 2021-08-11 06:09:05
 * @LastEditTime: 2021-09-29 11:06:08
 * @LastEditors: Please set LastEditors
 * @Description: 此文件测试 mini-react
 * @FilePath: /myreact/src/index1.js
 */

// import React from "react";
import { IndeterminateComponent } from "./Mini-react/ReactWorkTags";
import { render } from "./Mini-react/ReactFiberWorkLoop";
import { useReducer } from "./Mini-react/ReactFiberHooks";

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

