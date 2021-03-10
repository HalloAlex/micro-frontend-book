import { find } from "../utils/find.js";
import { objectType, toName } from "../applications/app.helpers.js";
import { formatErrorMessage } from "../applications/app-errors.js";

export function validLifecycleFn(fn) {
  return fn && (typeof fn === "function" || isArrayOfFns(fn));

  function isArrayOfFns(arr) {
    return (
      Array.isArray(arr) && !find(arr, (item) => typeof item !== "function")
    );
  }
}

/* 
  * 异步串行加载，一个 Promise 执行成功之后执行下一个 Promise
  * function fltternFnArray (app, lifecycle) {
  *   let fns = app[lifecycle] || [];
  *   fns = Array.isArray(fns) ? fns : [fns]
  *   return () => fns.reduce((p, fn) => p.then(() => fn()), Promise.resolve())
  * }
 */
export function flattenFnArray(appOrParcel, lifecycle) {
  let fns = appOrParcel[lifecycle] || [];
  fns = Array.isArray(fns) ? fns : [fns];
  if (fns.length === 0) {
    fns = [() => Promise.resolve()];
  }

  const type = objectType(appOrParcel);
  const name = toName(appOrParcel);

  return function (props) {
    return fns.reduce((resultPromise, fn, index) => {
      return resultPromise.then(() => {
        const thisPromise = fn(props);
        return smellsLikeAPromise(thisPromise)
          ? thisPromise
          : Promise.reject(
              formatErrorMessage(
                15,
                __DEV__ &&
                  `Within ${type} ${name}, the lifecycle function ${lifecycle} at array index ${index} did not return a promise`,
                type,
                name,
                lifecycle,
                index
              )
            );
      });
    }, Promise.resolve());
  };
}

/* 
  * 看着像个 Promise
    return promise && typeof promise.then === 'function' && typeof promise.catch === 'function'
 */
export function smellsLikeAPromise(promise) {
  return (
    promise &&
    typeof promise.then === "function" &&
    typeof promise.catch === "function"
  );
}

/* 
  * Promise.all
 */
// Promise.myAll = function (promises) {
//   let len = 0;
//   const allLen = promises.length;
//   promises.forEach(promise => {
//     promise.finally(() => {
//       len++
//       if (len === allLen) {
//         console.log('all done')
//       }
//     })
//   })
// }
// Promise.myAll([
//   new Promise((resovle, reject) => {
//     setTimeout(() => {
//       console.log('promise 1 resolve')
//       resovle()
//     }, 1000)
//   }),
//   new Promise((resovle, reject) => {
//     setTimeout(() => {
//       console.log('promise 2 reject')
//       reject()
//     }, 2000)
//   }),
//   new Promise((resovle, reject) => {
//     setTimeout(() => {
//       console.log('promise 3 resolve')
//       resovle()
//     }, 3000)
//   })
// ])