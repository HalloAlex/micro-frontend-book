/* 
  * 模拟实现 es6 的 assign
  * function assign (...args) {
  *   return args.reduce((prev, cur) => {
  *     for (let prop in cur) {
  *       prev[prop] = cur[prop]
  *     }
  *     return prev
  *   }, {})
  * }
 */
export function assign() {
  for (let i = arguments.length - 1; i > 0; i--) {
    for (let key in arguments[i]) {
      if (key === "__proto__") {
        continue;
      }
      arguments[i - 1][key] = arguments[i][key];
    }
  }

  return arguments[0];
}


// function assign (...args) {
//   return args.reduce((prev, cur) => {
//     for (let prop in cur) {
//       prev[prop] = cur[prop]
//     }
//     return prev
//   }, {})
// }

// var result = assign({ name: 'xq' }, { age: 30 }, { name: 'xq1', sex: 'male' })
// console.log(result)