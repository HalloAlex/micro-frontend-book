import { started } from '../start'
import { getAppChanges } from '../application/app'
import { toLoadPromise } from '../lifecycles/load'
import { toUnMountPromise } from '../lifecycles/unmount'
import { toMountPromise } from '../lifecycles/mount'
import { toBootstrapPromise } from '../lifecycles/bootstrap'

export const reroute = () => {
  const { appsToLoad, appsToUnMount, appsToMount } = getAppChanges();
  if (started) {
    console.log(appsToLoad, appsToUnMount, appsToMount)
    performAppChanges();
  } else {
    loadApps();
  }

  function loadApps () {
    let loadPromises = appsToLoad.map(toLoadPromise)
    Promise.all(loadPromises).then(() => {
      // callAllEventListeners();
    })
  }

  function performAppChanges () {
    const ummountPromises = appsToUnMount.map(toUnMountPromise)
    const bootstrapPromises = appsToLoad.map(app => {
      toLoadPromise(app).then(app => {
        toBootstrapPromise(app).then(() => {
          Promise.all(ummountPromises).then(() => {
            toMountPromise(app)
          })
        })
      })
    })
  }
}