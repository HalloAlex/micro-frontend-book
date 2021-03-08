import { NOT_LOADED, LOADING_SOURCE_CODE, NOT_BOOTSTRAPED, BOOTSTRAPING, NOT_MOUNTED, MOUNTED, SKIP_BECAUSE_BROKEN, } from './app.healper';
import { reroute } from '../navigation/reroute';

const apps = [];

function shouldBeActive (app) {
  return app.activeWhen(location)
}

export const getAppChanges = () => {
  let appsToLoad = [],
    appsToMount = [],
    appsToUnMount = [];

  apps.forEach(app => {
    const appShouldBeActive = app.status !== SKIP_BECAUSE_BROKEN && shouldBeActive(app)
    switch (app.status) {
      case NOT_LOADED:
      case LOADING_SOURCE_CODE:
        appShouldBeActive && appsToLoad.push(app);
        break;
      case NOT_BOOTSTRAPED:
      case BOOTSTRAPING:
      case NOT_MOUNTED:
        appShouldBeActive && appsToMount.push(app);
        break;
      case MOUNTED:
        !appShouldBeActive && appsToUnMount.push(app);
        break;
    }
  })

  return {
    appsToLoad,
    appsToMount,
    appsToUnMount,
  }
}

export const registerApplication = (appName, loadApp, activeWhen, customProp) => {
  if (typeof appName === 'object') {
    apps.push({
      ...appName,
      status: NOT_LOADED
    })
  } else {
    apps.push({
      appName,
      loadApp,
      activeWhen,
      customProp,
      status: NOT_LOADED
    })
  }

  reroute()
}