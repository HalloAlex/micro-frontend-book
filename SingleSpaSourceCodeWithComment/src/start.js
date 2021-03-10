import { reroute } from "./navigation/reroute.js";
import { formatErrorMessage } from "./applications/app-errors.js";
import { setUrlRerouteOnly } from "./navigation/navigation-events.js";
import { isInBrowser } from "./utils/runtime-environment.js";

let started = false;

/* 
  * 启动 single-spa
  * opt 下有配置字段 urlRerouteOnly，表示：是否只通过 url 来路由，像操作 history 的 pushState, replaceState 方法更新路由会失效
  * start 函数的作用：
  *   1. 标记 started 为 true，因为 registerApplication 和 start 都会走 reroute，reroute 需要知道目前是什么进度
  *   2. 通过 setUrlRerouteOnly 设置 urlRerouteOnly
  *   3. reroute：把所有处于 
 */
export function start(opts) {
  started = true;
  if (opts && opts.urlRerouteOnly) {
    setUrlRerouteOnly(opts.urlRerouteOnly);
  }
  if (isInBrowser) {
    reroute();
  }
}

/* 
  * 当前项目是否启动，已调用 start 函数
 */
export function isStarted() {
  return started;
}

/* 
  * 项目启动 5s 钟之后，还未调用 start 方法，会给出警告
 */
if (isInBrowser) {
  setTimeout(() => {
    if (!started) {
      console.warn(
        formatErrorMessage(
          1,
          __DEV__ &&
            `singleSpa.start() has not been called, 5000ms after single-spa was loaded. Before start() is called, apps can be declared and loaded, but not bootstrapped or mounted.`
        )
      );
    }
  }, 5000);
}
