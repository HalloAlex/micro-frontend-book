import { LOADING_SOURCE_CODE, NOT_BOOTSTRAPED, LOAD_ERR } from '../application/app.healper'

export const flattenFnArray = fns => {
  fns = Array.isArray(fns) ? fns : [fns]
  return () => fns.reduce((p, fn) => p.then(fn), Promise.resolve())
}

export const toLoadPromise = app => {
  app.status = LOADING_SOURCE_CODE;
  const loadPromise = app.loadApp();
  return loadPromise.then(module => {
    app.bootstrap = flattenFnArray(module.bootstrap)
    app.mount = flattenFnArray(module.mount)
    app.unmount = flattenFnArray(module.unmount)
    app.status = NOT_BOOTSTRAPED
    return app
  }).catch(e => {
    app.status = LOAD_ERR
  })
}