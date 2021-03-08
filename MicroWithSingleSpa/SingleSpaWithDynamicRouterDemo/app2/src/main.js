import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
// import Bar from './Bar.vue'
// import Foo from './Foo.vue'
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

export const bootstrap = vueLifecycle.bootstrap
export const mount = vueLifecycle.mount
export const unmount = vueLifecycle.unmount