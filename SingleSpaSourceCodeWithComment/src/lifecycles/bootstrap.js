import {
  NOT_BOOTSTRAPPED,
  BOOTSTRAPPING,
  NOT_MOUNTED,
  SKIP_BECAUSE_BROKEN,
} from "../applications/app.helpers.js";
import { reasonableTime } from "../applications/timeouts.js";
import { handleAppError, transformErr } from "../applications/app-errors.js";

/* 
  * toBootstrapPromise 的主要作用：
  *   1. 判断是否为 NOT_BOOTSTRAPED 状态，不是：直接返回 app
  *   2. 把 app.status 置为 BOOTSTRAPPING
  *   3. 判断 app.bootstrap 是否存在，不存在直接把 app.status 置为 NOT_MOUNTED，返回 app
  *   4. 使用 reasonableTime （有超时机制的Promise）执行 bootstrap 钩子
  *   5. 执行成功把状态置为 NOT_MOUNTED，执行失败把状态置为 SKIP_BECAUSE_BROKEN
  * function toBootstrapPromise (app) {
  *   if (app.status !== NOT_BOOTSTRAPPED) {
  *     return app
  *   }
  *   app.status = BOOTSTRAPPING
  *   if (!app.bootstrap) {
  *     app.status = NOT_MOUNTED
  *     return app
  *   }
  *   reasonableTime(app, 'bootstrap').then(res => {
  *     app.status = NOT_MOUNTED
  *   }).catch(e => {
  *     app.status = SKIP_BECAUSE_BROKEN
  *   })
  * }
  */
export function toBootstrapPromise(appOrParcel, hardFail) {
  return Promise.resolve().then(() => {
    if (appOrParcel.status !== NOT_BOOTSTRAPPED) {
      return appOrParcel;
    }

    appOrParcel.status = BOOTSTRAPPING;

    if (!appOrParcel.bootstrap) {
      // Default implementation of bootstrap
      return Promise.resolve().then(successfulBootstrap);
    }

    return reasonableTime(appOrParcel, "bootstrap")
      .then(successfulBootstrap)
      .catch((err) => {
        if (hardFail) {
          throw transformErr(err, appOrParcel, SKIP_BECAUSE_BROKEN);
        } else {
          handleAppError(err, appOrParcel, SKIP_BECAUSE_BROKEN);
          return appOrParcel;
        }
      });
  });

  function successfulBootstrap() {
    appOrParcel.status = NOT_MOUNTED;
    return appOrParcel;
  }
}
