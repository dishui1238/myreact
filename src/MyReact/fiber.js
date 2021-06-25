import { Placement } from "./utils";

/**
 * ! fiber 结构
 *
 * child 第一个子节点
 * sibling 下一个兄弟
 * return 父节点
 * stateNode dom节点
 * type 节点类型 'div'、function、class
 * base 上一次的 fiber
 *
 */

/**
 * memoizedState class中指的是state值，如果是函数组件指的是第0个hook
 */
export function createFiber(vnode, returnFiber) {
  const fiber = {
    type: vnode.type,
    key: vnode.key,
    props: vnode.props,
    stateNode: null, // 原生标签时候指dom节点，类组件时候指的是实例
    child: null, // 第一个子fiber
    sibling: null, // 下一个兄弟fiber
    return: returnFiber, // 父fiber
    // 标记节点是什么类型的
    flags: Placement,
    // 老节点
    alternate: null,
  };

  return fiber;
}
