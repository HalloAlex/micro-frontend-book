import { MOUNTING, MOUNTED } from '../application/app.healper'

export const toMountPromise = app => {
  return new Promise(resolve => {
    app.status = MOUNTING;
    app.mount().then(() => {
      app.status = MOUNTED;
      resolve();
    })
  })
}