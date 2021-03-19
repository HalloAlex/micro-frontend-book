import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

export async function bootstrap(props) {
  console.log('app2 bootstrap', props)
}
export async function mount(props) {
  console.log('app2 mount:', props.container)
  new Vue({
    render: h => h(App),
  }).$mount('#app')
}
export async function unmount(props) {
  console.log('app2 unmount', props)
}
export async function update(props) {
  console.log('app2 update props', props);
}
