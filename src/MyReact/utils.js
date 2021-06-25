// ! flags
export const NoFlags = /*                      */ 0b00000000000000000000;

export const Placement = /*                    */ 0b0000000000000000000010; // 2
export const Update = /*                       */ 0b0000000000000000000100; // 4
export const Deletion = /*                     */ 0b0000000000000000001000; // 8

export function isStringOrNumber(s) {
  return typeof s === "string" || typeof s === "number";
}
export function isFunction(fn) {
  return typeof fn === "function";
}

// 处理原生标签属性， 如 className，href，id (style 未做处理)
export function updateNode(node, prevVal, nextVal) {
  Object.keys(prevVal).forEach((k) => {
    if (k === "children") {
      // 有可能是文本
      if (isStringOrNumber(prevVal[k])) {
        node.textContent = "";
      }
    } else if (k.slice(0, 2) === "on") {
      const eventName = k.slice(2).toLocaleLowerCase();
      node.removeEventListener(eventName, prevVal[k]);
    } else {
      if (!(k in nextVal)) {
        node[k] = "";
      }
    }
  });

  for (const key in nextVal) {
    // 文本处理
    if (key === "children") {
      // node.appendChild(document.createTextNode(nextVal.children));
      // 有可能是文本
      if (isStringOrNumber(nextVal[key])) {
        node.textContent = nextVal[key] + "";
      }
    } else {
      //事件处理
      // 源码当中事件是合成事件，利用了事件委托，react17 之前是把事件添加到 document 上，之后是添加到 container 上
      // 此处简单处理
      if (key.slice(0, 2) === "on") {
        const eventName = key.slice(2).toLocaleLowerCase();
        node.addEventListener(eventName, nextVal[key]); // todo:需要考虑移除时间监听
      } else {
        node[key] = nextVal[key];
      }
    }
    // node.setAttribute(key, resetProps[key])
  }
}
