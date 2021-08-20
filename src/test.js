import React from "react";

/**
 * 1. PureComponent使用浅比较
 * const a = []; a.push(3) 地址没变
 * Object.is(a, a)
 * ! 浅比较就是只比较第一级，对于基本数据类型，只比较值；对于引用数据类型值，直接比较地址是否相同，不管里面内容变不变，只要地址一样，我们就认为没变
 *
 * 2. Component
 * Component不会比较当前和下个状态的props和state。每当shouldComponentUpdate被调用时，组件默认的会重新渲染。
 */
class ListOfWords extends React.PureComponent {
  render() {
    return <div>{this.props.words.join(",")}</div>;
  }
}

export default class WordAdder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      words: ["marklar"],
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    // 这部分代码很糟，而且还有 bug
    const words = this.state.words;
    words.push("marklar");
    this.setState({ words: words });
  }

  render() {
    return (
      <div>
        <button onClick={this.handleClick}>点击</button>
        <ListOfWords words={this.state.words} />
      </div>
    );
  }
}

function shallowEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }
  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (let key in keys1) {
    if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }
  return true;
}
class PureComponent extends React.Component {
  shouldComponentUpdate(newProps, newState) {
    return (
      !shallowEqual(this.props, newProps) && !shallowEqual(this.state, newState)
    );
  }
}
