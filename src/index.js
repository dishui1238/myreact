import React, { Component } from "react";
// import ReactDOM from "react-dom";
import ReactDOM from "./MyReact/react-dom2";
import { useState, useReducer } from "./MyReact";
// import Component from "./MyReact/Component";

// import WordAdder from "./test";

import "./index.css";

class ClassComponent extends Component {
  render() {
    return (
      <div className="border">
        <p>{this.props.name}</p>
      </div>
    );
  }
}

function FunctionComponent(props) {
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useReducer((x) => x + 1, 0);
  return (
    <div className="border">
      <button
        onClick={() => {
          console.log(count);
          setCount(count + 1);
        }}
      >
        {count}
      </button>
      <button
        onClick={() => {
          console.log(count2);
          setCount2(count2 + 1);
        }}
      >
        {count2}
      </button>
      <p>{props.name}</p>
    </div>
  );
}

const jsx = (
  <div className="border">
    <p>这是一个 p 标签</p>
    <a href="https://github.com/dishui1238">Github</a>
    <FunctionComponent name="函数组件" />
    <ClassComponent name="类组件" />
    {/* <WordAdder />
    <>
      <h1>111</h1>
      <h1>222</h1>
    </> */}
  </div>
);

/**
 * 由编译器引入（禁止自己引入！）import {jsx as _jsx} from 'react/jsx-runtime';
 * {
 *  $$typeof: Symbol(react.element),
 *  key
 *  props: {children: [...], className}
 *  ref
 *  type
 *  _owner
 *  _store
 * }
 *
 */
// console.log(jsx);
// console.log(document.getElementById("root"));

ReactDOM.render(jsx, document.getElementById("root"));

// 文本标签 done
// 原生标签 done
// 函数组件 done
// 类组件 done
// Fragment
// 逻辑组件 Provider Consumer
