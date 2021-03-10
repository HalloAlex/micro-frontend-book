import { handleAppError } from "./app-errors.js";

/* 
  * single-spa 作为状态机管理多应用
  * 12个状态
  * 两个加载：NOT_LOADED，LOADING_SOURCE_CODE
  * 两个启动：NOT_BOOTSTRAPED，BOOTSTRAPING
  * 两个错误：LOAD_ERR，SKIP_BECAUSE_BROKEN
  * 三个装载：NOT_MOUNTED，MOUNTING，MOUNTED
  * 三个更新：UPDATING，UNMOUNTING，UNLOADING
 */
export const NOT_LOADED = "NOT_LOADED";
export const LOADING_SOURCE_CODE = "LOADING_SOURCE_CODE";
export const NOT_BOOTSTRAPPED = "NOT_BOOTSTRAPPED";
export const BOOTSTRAPPING = "BOOTSTRAPPING";
export const NOT_MOUNTED = "NOT_MOUNTED";
export const MOUNTING = "MOUNTING";
export const MOUNTED = "MOUNTED";
export const UPDATING = "UPDATING";
export const UNMOUNTING = "UNMOUNTING";
export const UNLOADING = "UNLOADING";
export const LOAD_ERROR = "LOAD_ERROR";
export const SKIP_BECAUSE_BROKEN = "SKIP_BECAUSE_BROKEN";

/* 
  * 判断是否为激活状态，装载完成即为激活
 */
export function isActive(app) {
  return app.status === MOUNTED;
}

/* 
  * 判断此 app 是否需要被激活，调用 app.activeWhen 传入 location，返回 true 即该被激活
 */
export function shouldBeActive(app) {
  try {
    return app.activeWhen(window.location);
  } catch (err) {
    handleAppError(err, app, SKIP_BECAUSE_BROKEN);
    return false;
  }
}

/* 
  * 获取 apps 数组的名称
  * apps.map(app => app.appName)
 */
export function toName(app) {
  return app.name;
}

/* 
  * 是否是包裹，暂不清楚包裹是啥玩意
 */
export function isParcel(appOrParcel) {
  return Boolean(appOrParcel.unmountThisParcel);
}

export function objectType(appOrParcel) {
  return isParcel(appOrParcel) ? "parcel" : "application";
}
