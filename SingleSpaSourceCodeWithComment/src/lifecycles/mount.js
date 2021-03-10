import {
  NOT_MOUNTED,
  MOUNTED,
  SKIP_BECAUSE_BROKEN,
} from "../applications/app.helpers.js";
import { handleAppError, transformErr } from "../applications/app-errors.js";
import { reasonableTime } from "../applications/timeouts.js";
import CustomEvent from "custom-event";
import { toUnmountPromise } from "./unmount.js";

let beforeFirstMountFired = false;
let firstMountFired = false;

/* 
  * toMountePromise 的主要作用：
  *   1.判断 app.status 非 NOT_MOUNTED，直接返回 app.status
  *   2.如果 一个应用都没 mount 过：beforeFirstMountFired 为 false，dispatch 自定义事件 single-spa:before-first-mount
  *   3.reasonableTime 执行 mount
  *   4.成功则把 app.status 置为 MOUNTED，为第一次 mount 的话 dispatch：single-spa:first-mount
  *   5.失败则把 app.status 先置为 MOUNTED，然后执行 toUnmountPromise，卸载成功后把 status 置为 SKIP_BECAUSE_BROKEN
  * function toMountPromise (app) {
  *   if (app.status !== NOT_MOUNTED) return;
  *   if (!beforeFirstMountFired) {
  *     window.dispatchEvent(new CustomEvent('single-spa:before-first-mount'))
  *     beforeFirstMountFired = true
  *   }
  *   reasonableTime(app, 'mount').then(res => {
  *     app.status = MOUNTED
  *     if (!firstMountFired) {
  *       window.dispatchEvent(new CustomEvent('single-spa:first-mount'))
  *       firstMountFired = true
  *     }
  *   }).catch(e => {
  *     app.status = MOUNTED
  *     return toUnmountPromise(app).then(res => {
  *       app.status = SKIP_BECAUSE_BROKEN
  *     })
  *   })
  * }
 */
export function toMountPromise(appOrParcel, hardFail) {
  return Promise.resolve().then(() => {
    if (appOrParcel.status !== NOT_MOUNTED) {
      return appOrParcel;
    }

    if (!beforeFirstMountFired) {
      window.dispatchEvent(new CustomEvent("single-spa:before-first-mount"));
      beforeFirstMountFired = true;
    }

    return reasonableTime(appOrParcel, "mount")
      .then(() => {
        appOrParcel.status = MOUNTED;

        if (!firstMountFired) {
          window.dispatchEvent(new CustomEvent("single-spa:first-mount"));
          firstMountFired = true;
        }

        return appOrParcel;
      })
      .catch((err) => {
        // If we fail to mount the appOrParcel, we should attempt to unmount it before putting in SKIP_BECAUSE_BROKEN
        // We temporarily put the appOrParcel into MOUNTED status so that toUnmountPromise actually attempts to unmount it
        // instead of just doing a no-op.
        appOrParcel.status = MOUNTED;
        return toUnmountPromise(appOrParcel, true).then(
          setSkipBecauseBroken,
          setSkipBecauseBroken
        );

        function setSkipBecauseBroken() {
          if (!hardFail) {
            handleAppError(err, appOrParcel, SKIP_BECAUSE_BROKEN);
            return appOrParcel;
          } else {
            throw transformErr(err, appOrParcel, SKIP_BECAUSE_BROKEN);
          }
        }
      });
  });
}
