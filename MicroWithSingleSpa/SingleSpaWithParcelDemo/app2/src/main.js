import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import HelloReactParcel from './HelloReactParcel'
import singleSpaVue from 'single-spa-vue'

Vue.use(VueRouter)
const router = new VueRouter({
  mode: 'history',
  base: 'app2',
  routes: [
    {
      path: '/foo',
      component: () => import(/* webpackChunkName: 'Foo' */'./Foo.vue')
    },
    {
      path: '/bar',
      component: () => import(/* webpackChunkName: 'Bar' */'./Bar.vue')
    },
    {
      path: '/HelloReactParcel',
      component: HelloReactParcel
    }
  ]
})

if (!window.singleSpaNavigate){
  new Vue({
    router,
    render: h => h(App),
  }).$mount('#app')
}

// export function bootstrap () {
//   console.log('bootstrap')
// }

// export function mount () {
//   console.log('mount')
//   new Vue({
//     router,
//     render: h => h(App),
//   }).$mount('#microBox')
// }

// export function unmount () {
//   console.log('unmount')
// }

const vueLifecycle = singleSpaVue({
  Vue,
  appOptions: {
    el: '#microBox',
    router,
    render: h => h(App),
  }
})

export let mountParcel;
export const bootstrap = props => {
  console.log('props:', props)
  mountParcel = props.mountParcel
  return vueLifecycle.bootstrap(props)
}
export const mount = vueLifecycle.mount
export const unmount = vueLifecycle.unmount