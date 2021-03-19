const NOT_LOADED = 'NOT_LOADED';
const NOT_MOUNTED = 'NOT_MOUNTED';
const MOUNTED = 'MOUNTED';

let apps = [];
function registerApplication (appName, loadApp, activeWhen, customProps) {
  apps.push({
    appName,
    loadApp,
    activeWhen,
    customProps,
    status: NOT_LOADED
  })
}
function start () {
  reroute()
}
function reroute (eventArguments) {
  const [ appsToLoad, appsToMount, appsUnMount ] = getAppChanges();
  appsUnMount.forEach(app => {
    app.unmount && app.unmount(app.customProps)
    app.status = NOT_MOUNTED
  })
  appsToLoad.map(app => {
    return toLoadPromise(app).then(app => {
      toMountPromise(app)
    })
  })
  appsToMount.map(app => {
    toMountPromise(app)
  })
}
function toLoadPromise (app) {
  return app.loadApp().then(module => {
    app.mount = module.mount;
    app.unmount = module.unmount;
    app.status = NOT_MOUNTED;
    return app;
  })
}
function toMountPromise (app) {
  app.mount(app.customProps)
  app.status = MOUNTED
  return app
}
const shouldBeActive = app => app.activeWhen(location)
function getAppChanges () {
  let appsToLoad = [];
  let appsToMount = [];
  let appsUnMount = [];
  apps.forEach(app => {
    switch (app.status) {
      case NOT_LOADED:
        if (shouldBeActive(app)) appsToLoad.push(app);
        break;
      case NOT_MOUNTED:
        if (shouldBeActive(app)) appsToMount.push(app);
        break;
      case MOUNTED:
        if (!shouldBeActive(app)) appsUnMount.push(app);
        break;
    }
  })
  return [ appsToLoad, appsToMount, appsUnMount ]
}

// 事件处理
// window.addEventListener('hashchange', reroute)
window.addEventListener('hashchange', reroute)