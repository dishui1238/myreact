// 过期时间
let deadline = 0;

export const shouldYield = (params) => {
  return getCurrentTime() >= deadline;
};

export function getCurrentTime() {
  // TODO: performance 是什么？？
  return performance.now();
}
