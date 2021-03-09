### 使用single-spa搭建微前端系统
总共分为三步：
1. 创建 REACT 子应用 app1
2. 创建 VUE 子应用 app2
3. 创建基应用，注册子应用

[DEMO地址](https://github.com/HalloAlex/micro-frontend-book/tree/master/MicroWithSingleSpa/SingleSpaEasiestDemo)

#### 子应用搭建步骤
1. 协议导出（bootstrap，mount，unmount）
2. 把子应用作为类库导出，配置 webpack/output/library && libraryTarget

#### 搭建 REACT 子应用 app1
第一步：创建项目
```
npx create-react-app app1
```

第二步：修改 webpack 配置
```
npm run eject
找到 config/webpack.config.js, 修改 output
output: {
  library: 'app1',
  libraryTarget: 'umd'
}
```

第三步：修改入口文件
```
import singleSpaReact from 'single-spa-react'
if (!window.singleSpaNavigate) {
  reactDOM.render(<App />, document.getElementById('root'))
}
const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  domElementGetter: () => document.getElementById('microBox')
})
const bootstrap = lifecycles.bootstrap
const mount = lifecycles.mount
const unmount = lifecycles.unmount
```

启动 app1 之后，可以访问 app1 项目 http://localhost:3001，在控制台输出 window.app1，可以看到输出 app1 被打包成了类库

#### 搭建 VUE 子应用 app2
第一步：创建项目
```
vue create app2
```

第二步：修改 webpack 配置
```
// vue.config.js
module.exports = {
  configureWebpack: {
    output: {
      library: 'app2',
      libraryTarget: 'umd'
    }
  }
}
```

第三步：导出协议接口
```
import singleSpaVue from 'single-spa-vue'
if (!window.singleSpaNavigate) {
  new Vue({
    router,
    render: h => h(App)
  }).$mount('#app')
}
const lifecycle = singleSpaVue({
  Vue,
  appOptions: {
    el: '#microBox',
    router,
    render: h => h(App)
  }
})

export function bootstrap = lifecycle.bootstrap
export function mount = lifecycle.mount
export function unmount = lifecycle.unmount
```

#### 搭建基座应用
```
import { registerApplication, start } from 'single-spa'

const createScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = scriptUrl
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const loadScript = async (scriptUrls) => {
  for (let scriptUrl of scriptUrls) {
    await createScript(scriptUrl)
  }
}

registerApplication({
  appName: 'app1',
  loadApp: async () => {
    await loadScript([
      'http://localhost:3002/static/js/bundle.js',
      'http://localhost:3002/static/js/vendors~main.chunk.js',
      'http://localhost:3002/static/js/main.chunk.js',
    ])
    return window.app1
  },
  activeWhen: location => location.pathname.startWith('react')
})
registerApplication({
  appName: 'app2',
  loadApp: async () => {
    await loadScript([
      'http://localhost:8081/js/chunk-vendors.js',
      'http://localhost:8081/js/app.js',
    ])
    return window.app1
  },
  activeWhen: location => location.pathname.startWith('react')
})
start()

ReactDOM.render(<App/>, document.getElementById('root'))
```

**基应用需要注意的是：**   
有时获取 window.app1 或 window.app2 是 undefined   
这是因为 registerApplication 时 loadApp 加载 js 的顺序问题，比如此 demo 中的 app2，chunk-vendors.js 需要先于 app.js加载，非则会出此问题


### 其他问题
#### 动态路由问题
比如vue中使用动态路由：Component: () => import('./Foo')，那么在基座应用中动态加载时，域名就是基座应用的域名，这时动态加载就有找不到 js 了。    
**解决方案：配置 publicPath**   
1. 配置 webpack 的 puclicPath，比如 vue.config.js 中配置 publicPath: '//localhost:8081'
2. 代码中修改 webpack 路径变量 __webpack_public_path__

```
if (window.singleSpaNavigate) {
  __webpack_public_path__ = '//localhost:8081'
}
```
