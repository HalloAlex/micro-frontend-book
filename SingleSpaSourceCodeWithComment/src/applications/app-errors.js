import { objectType, toName } from "./app.helpers";

let errorHandlers = [];

/* 
  * 处理 app 异常
  * 如果 errorHandlers 有异常处理函数，就遍历并调用，没有则直接 throw Error
 */
export function handleAppError(err, app, newStatus) {
  const transformedErr = transformErr(err, app, newStatus);

  if (errorHandlers.length) {
    errorHandlers.forEach((handler) => handler(transformedErr));
  } else {
    setTimeout(() => {
      throw transformedErr;
    });
  }
}

/* 
  * 增加异常处理函数 errorHandlers.push(handler)
  * handler 不是函数抛错： if (typeof handler !== 'function') { throw new Error(`addErrorHandler's first argument: handler should be a function`) }
 */
export function addErrorHandler(handler) {
  if (typeof handler !== "function") {
    throw Error(
      formatErrorMessage(
        28,
        __DEV__ && "a single-spa error handler must be a function"
      )
    );
  }

  errorHandlers.push(handler);
}

/* 
  * 移除异常处理函数
  * const index = errorHandlers.indexOf(handler)
  * if (index !== -1) {
  *   errorHandlers.splice(index, 1)
  *   return true
  * }
  * return false
 */
export function removeErrorHandler(handler) {
  if (typeof handler !== "function") {
    throw Error(
      formatErrorMessage(
        29,
        __DEV__ && "a single-spa error handler must be a function"
      )
    );
  }

  let removedSomething = false;
  errorHandlers = errorHandlers.filter((h) => {
    const isHandler = h === handler;
    removedSomething = removedSomething || isHandler;
    return !isHandler;
  });

  return removedSomething;
}

/* 
  * formatErrorMessage 格式化错误信息
  * code：错误编号
  * msg：错误提示
  * args：错误参数
  * msg 主要是提示给开发者看的，code 和 args 可以定位到错误文档
 */
export function formatErrorMessage(code, msg, ...args) {
  return `single-spa minified message #${code}: ${
    msg ? msg + " " : ""
  }See https://single-spa.js.org/error/?code=${code}${
    args.length ? `&arg=${args.join("&arg=")}` : ""
  }`;
}

export function transformErr(ogErr, appOrParcel, newStatus) {
  const errPrefix = `${objectType(appOrParcel)} '${toName(
    appOrParcel
  )}' died in status ${appOrParcel.status}: `;

  let result;

  if (ogErr instanceof Error) {
    try {
      ogErr.message = errPrefix + ogErr.message;
    } catch (err) {
      /* Some errors have read-only message properties, in which case there is nothing
       * that we can do.
       */
    }
    result = ogErr;
  } else {
    console.warn(
      formatErrorMessage(
        30,
        __DEV__ &&
          `While ${appOrParcel.status}, '${toName(
            appOrParcel
          )}' rejected its lifecycle function promise with a non-Error. This will cause stack traces to not be accurate.`,
        appOrParcel.status,
        toName(appOrParcel)
      )
    );
    try {
      result = Error(errPrefix + JSON.stringify(ogErr));
    } catch (err) {
      // If it's not an Error and you can't stringify it, then what else can you even do to it?
      result = ogErr;
    }
  }

  result.appOrParcelName = toName(appOrParcel);

  // We set the status after transforming the error so that the error message
  // references the state the application was in before the status change.
  appOrParcel.status = newStatus;

  return result;
}
