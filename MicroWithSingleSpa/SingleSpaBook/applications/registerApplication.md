```
/* 
  * 传入 appName，返回该 name 对应的 app status
 */
export function getAppStatus(appName) {
  const app = find(apps, (app) => toName(app) === appName);
  return app ? app.status : null;
}

/* 
  * registerApplication 注册应用
  * appNameOrConfig： string，应用名称，唯一，不唯一抛异常
  * appOrLoadApp：function，加载应用的函数
  * activeWhen：function，激活时机函数，传入 location 返回 boolean
  * customProps：object，传入子应用的参数
  * registerApplication 做的事：
  *   1. 判断应用名称是否唯一，不唯一抛错
  *   2. 把 app 放入 apps，多维护一个字段：当前状态 status: NOT_LOADED
  *   3. 做 jquery 的兼容：jquery 的 on，off 函数，可以监听 hashchange，popstate 操作，此类需要在 single-spa 的拦截事件之后执行
  *   4. retoute 重定向
 */
export function registerApplication(
  appNameOrConfig,
  appOrLoadApp,
  activeWhen,
  customProps
) {
  const registration = sanitizeArguments(
    appNameOrConfig,
    appOrLoadApp,
    activeWhen,
    customProps
  );

  if (getAppNames().indexOf(registration.name) !== -1)
    throw Error(
      formatErrorMessage(
        21,
        __DEV__ &&
          `There is already an app registered with name ${registration.name}`,
        registration.name
      )
    );

  apps.push(
    assign(
      {
        loadErrorTime: null,
        status: NOT_LOADED,
        parcels: {},
        devtools: {
          overlays: {
            options: {},
            selectors: [],
          },
        },
      },
      registration
    )
  );

  if (isInBrowser) {
    ensureJQuerySupport();
    reroute();
  }
}
```