function render(vnode, container) {
  // 1. vnode -> node
  const node = createNode(vnode);
  // 2. 挂载到 container
  node && container.appendChild(node);
}

// 返回一个真实的 dom 节点
function createNode(vnode) {
  const { type } = vnode;
  let node = null;

  if (typeof type === "string") {
    node = updateHostComponent(vnode);
  } else if (typeof type === "function") {
    // 函数组件 or 类组件
    node = type.prototype.isReactComponent
      ? updateClassComponent(vnode)
      : updateFunctionComponent(vnode);
  } else {
    // 处理 fragment
    node = createFragmentComponent(vnode);
  }
  return node;
}

// 原生标签节点处理
function updateHostComponent(vnode) {
  const { type, props } = vnode;
  const node = document.createElement(type);

  // 子节点是文本节点
  if (typeof props.children === "string") {
    const textNode = document.createTextNode(props.children);
    node.appendChild(textNode);
  } else {
    reconcileChildren(props.children, node);
  }

  // 处理属性
  updateNode(node, props);
  return node;
}

// 处理函数组件
function updateFunctionComponent(vnode) {
  const { type, props } = vnode;
  const cvnode = type(props);
  console.log("updateFunctionComponent", cvnode);
  return createNode(cvnode);
}

// 类组件处理
function updateClassComponent(vnode) {
  const { type, props } = vnode;
  const instance = new type(props);
  const cvnode = instance.render();
  console.log("updateClassComponent", cvnode);
  return createNode(cvnode);
}

// 处理 fragment
function createFragmentComponent(vnode) {
  const { props } = vnode;
  const node = document.createDocumentFragment();
  reconcileChildren(props.children, node);
  return node;
}

// 处理 children
function reconcileChildren(children, node) {
  // 数组，遍历
  if (Array.isArray(children)) {
    for (let index = 0; index < children.length; index++) {
      const vnode = children[index];
      render(vnode, node);
    }
  } else {
    render(children, node);
  }
}

// 处理属性
function updateNode(node, props) {
  const { children, ...resetProps } = props;
  for (const key in resetProps) {
    if (Object.hasOwnProperty.call(resetProps, key)) {
      node[key] = resetProps[key];
      // node.setAttribute(key, resetProps[key])
    }
  }
}

const ReactDOM = { render };
export default ReactDOM;
