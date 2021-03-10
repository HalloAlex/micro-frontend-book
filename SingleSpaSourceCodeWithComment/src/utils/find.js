/* the array.prototype.find polyfill on npmjs.com is ~20kb (not worth it)
 * and lodash is ~200kb (not worth it)
 */

/* 
  * polyfill es6 find
  *   function find (arr, func) {
  *     for (let i = 0, len = arr.length; i < len; i++) {
  *       if (func(arr[i])) {
  *         return arr[i]
  *       }
  *     }
  *     return null
  *   }
  */
export function find(arr, func) {
  for (let i = 0; i < arr.length; i++) {
    if (func(arr[i])) {
      return arr[i];
    }
  }

  return null;
}


