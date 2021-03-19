### single-spa 路由系统及 Future State
思考一下微前端路由系统的解决方案：
1. 进入主应用 http://localhost:8081
2. 主应用中点击 app1，路由变为 http://localhost:8081/app1
3. 此时去加载 app1 应用的内容，app1 挂载完成之后接管 url change 事件

### 拦截 hashchange，popstate 事件
拦截 hashchange，popstate 事件，使这两个事件都走 reroute 方法，reroute执行完成之后，再遍历 capturedEventListener 去执行绑定事件
```
function urlReroute (...args) {
  reroute(...args)
}
window.addEventListener('hashchange', urlReroute)
window.addEventListener('popstate', urlReroute)

const capturedEventListener = {
  hashchange: [],
  popstate: [],
}
const originalAddEventListener = window.addEventListener
const originalRemoveEventListener = window.removeEventListener
window.addEventListener = (eventName, handler) => {
  if (['hashchange', 'popstate'].includes(eventName)) {
    capturedEventListener[eventName].push(handler)
    return
  }
  return originalAddEventListener(eventName, handler)
}
window.addEventListener = (eventName, handler) => {
  if (['hashchange', 'popstate'].includes(eventName)) {
    capturedEventListener[eventName] = capturedEventListener[eventName].filter(h => h !== handler)
    return
  }
  return originalRemoveEventListener(eventName, handler)
}
```

### 拦截 pushState，replaceState
拦截 pushState， replaceState 的操作：
1. 执行 pushState 前后记录 url
2. 如果 url 发生了变化，触发 popstate 事件

🤔️ 问题：popstate事件是什么时候触发的？
只有 浏览器点击左上角回退 或者 js 中 手动调用 history.back() 才会触发 popstate 事件

```
function patchedUpdateState (originalMethod) {
  return (...args) => {
    const urlBefore = window.location.href;
    originalMethod(...args);
    const urlAfter = window.location.href;
    
    if (urlBefore !== urlAfter) {
      const evt = new PopStateEvent('popstate', { state: { idx: 0 } })
      window.dispatchEvent(evt)
    }
  }
}
window.history.pushState = patchedUpdateState(window.history.pushState);
window.history.replaceState = patchedUpdateState(window.history.replaceState);
```

### Future State
Future State指：当在主应用中触发子应用路由时，异步开始加载子应用资源，可是此时在路由系统中找不到 app1/foo 指向的组件

在single-spa的路由拦截中，把 popstate 和 hashchange 的事件保存到了 capturedEventListener 中，只需要在资源加载完成之后遍历执行 capturedEventListener 即可

