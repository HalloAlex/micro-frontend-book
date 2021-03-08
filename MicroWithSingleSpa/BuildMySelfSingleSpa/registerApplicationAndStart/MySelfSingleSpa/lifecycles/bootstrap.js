import { BOOTSTRAPING, NOT_MOUNTED } from '../application/app.healper'

export const toBootstrapPromise = app => {
  return new Promise(resolve => {
    app.status = BOOTSTRAPING;
    app.bootstrap().then(() => {
      app.status = NOT_MOUNTED;
      resolve();
    })
  })
}