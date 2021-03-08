import { UNMOUNTING, NOT_LOADED } from '../application/app.healper'

export const toUnMountPromise = app => {
  return new Promise(resolve => {
    app.status = UNMOUNTING;
    app.unmount().then(() => {
      app.status = NOT_LOADED;
      resolve();
    })
  })
}