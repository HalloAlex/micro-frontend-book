### 使用 single-spa 搭建组件微前端

微前端分为：
1. 路由微前端：拦截路由
2. 组件微前端：应用组件化

[路由微前端DEMO](https://github.com/HalloAlex/micro-frontend-book/tree/master/MicroWithSingleSpa/SingleSpaEasiestDemo)   
[组件微前端DEMO](https://github.com/HalloAlex/micro-frontend-book/tree/master/MicroWithSingleSpa/SingleSpaWithParcelDemo)   

这里主要是讲解组件微前端的实现过程


### 创建组件应用 react-parcel
组件应用 react-parcel 其实跟 react 的子应用 app1 是一样的，使用 single-spa-react 封装 { React，ReactDOM，rootComponent } 导出协议接口（bootstrap，mount，unmount）

### 子应用中使用组件应用
1. 缓存 mountParcel 方法
2. 路由激活，调用 mountParcel 挂载 parcel

#### React子应用接入组件应用
```
// 路由
<Link to="/HelloReactParcel">HelloReactParcel</Link>
<Route path="/HelloReactParcel">
  <HelloReactParcel />
</Route>

// 定义 HelloReactParcel 组件
const HelloReactParcel = () => {
  loadParcel()
  return <div id="parcel"></div>
}

// 加载 HelloParcel 组件应用，并把它挂载到 id 为 parcel 的节点上
const loadScript = src => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}
const loadParcel = async () => {
  await loadScript('http://localhost:3002/runtime-main.js')
  await loadScript('http://localhost:3002/vendors~main.js')
  await loadScript('http://localhost:3002/main.js')
  let domElement = document.getElementById('parcel')
  mountParcel(() => Promise.resolve(window.reactParcel), { domElement })
}

// mountParcel的由来，作为子应用需要导出协议接口（bootstrap等），协议接口会接收 props
export let mountParcel
export let mountRootParcel
export const bootstrap = props => {
  mountParcel = props.mountParcel
  mountRootParel = props.singleSpa.mountRootParcel
  return lifecycle.bootstrap(props)
}
```
