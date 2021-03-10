# Micro-Frontend-Book 精读微前端 📚

这个仓库主要是系统全面地结合实际 DEMO 讲解下目前微前端的各种实现方案，优缺点，以及具体的实现原理

## 🧐 微前端是什么？
业务解耦，把巨石应用拆解为多个应用，交给多个团队维护⚙️    


**🤨 微前端有什么好处？**   

1. 💡 各个应用独立开发，独立部署
2. 🚀 因为项目拆分，所以构建速度更快了
3. 🧩 多个技术栈可以整合在一个应用中
4. 🗿 项目迭代可以分应用进行，项目中可以使用老代码

**🤨 为啥不用 iframe？**   
1. 🙁 页面中嵌入多个 iframe，会非常影响性能
2. ☹️ iframe 中 css 隔离太过彻底，有些场景无法实现，比如右下角1/4屏的 iframe 无法控制全屏居中显示的弹窗
3. 😤 多个 iframe 应用刷新页面，路由状态会丢失

## single-spa
single-spa 属于最早的实现微前端方案，目前 qiankun 也是基于 single-spa 做的二次封装   
single-spa 的 DEMO 请移步至👇 ：
[使用 single-spa 搭建微前端系统](https://github.com/HalloAlex/micro-frontend-book/tree/master/MicroWithSingleSpa)

### single-spa 做了哪些事？
1. 🧷 多应用状态管理
2. 🔨 路由劫持
3. 🎯 路由微前端 和 组件微前端

### single-spa源码解析
#### 应用注册流程 registerApplication
tips: 这里只展示核心代码，比如 appName 参数既可以传 string，也可以是 object，参数类型判断就不展示   
   
##### registerApplication 总共干三件事

1⃣️  把 app 维护进 apps   
2⃣️  支持 jquery，支持 jquery on 和 off 路由监听   
3⃣️  预加载当前路由对应子应用资源   
```
const apps = [];
function registerApplication (appName, loadApp, activeWhen, customProps) {
    // 维护所有的 app => apps
    apps.push({
        appName, loadApp, activeWhen, customProps,
        status: NOT_LOADED, parcels: {}, loadErrTime: null
    });
    ensureJquerySupport();
    reroute();
}
function reroute() {
    const { appsToLoad, appsToMount, appsToUnmount, appsToUnload } = getAppChanges();
    loadApps();
    function loadApps () {
        const loadPromises = appsToLoad.map(toLoadPromise);
        Promise.all(loadPromises)
            .catch(err => {
                throw err;
            })
    }
}

// app 几个重要属性
appName（应用名称）
loadApp（加载子应用的函数，返回 Promise）
activeWhen（判断子应用何时激活的函数）
customProps（自定义属性）
status（当前子应用所处状态，初始化为 NOT_LOADED ）
parcels（存储组件应用，暂时不用管）
loadErrTime（加载失败时间，用于加载失败多久之后可重新加载）  
```

##### 支持 jquery 些什么？
因为 jquery 的 on，off 方法也可以监听 hashchange 和 popstate，所以也需要让其走重写的 addEventListener
```
if (jQuery) {
      const originalOnFunction = jQuery.fn.on
      jQuery.fn.on = (eventName, fn) => {
            if (['hashchange, popstate'].includes(eventName)) {
                  window.addEventListener(eventName, fn)
                  return this
            }
            originalOnFunction.apply(this, arguments)
      }

      const originalOffFunction = jQuery.fn.off
      jQuery.fn.off = (eventName, fn) => {
            if (['hashchange, popstate'].includes(eventName)) {
                  window.removeEventListener(eventName, fn)
                  return this
            }
            originalOffFunction.apply(this, arguments)
      }
}
```

##### 预加载当前路由资源
调用 loadApp 方法获得 { bootstrap, mount, unmount }，把它们变为异步串行执行函数维护到 app 上
```
function toLoadPromise (app) {
      app.status = LOADING_SOURCE_CODE;
      const loadPromise = app.loadApp(app.customProps);
      return loadPromise.then(appInstance => {
            app.status = NOT_BOOTSTRAPED
            const { bootstrap, mount, unmount } = appInstance
            app.bootsrap = fltternFnArray(bootstrap)
            app.mount = fltternFnArray(mount)
            app.unmount = fltternFnArray(unmount)
            return app
      }),catch(e => {
            app.status = LOAD_ERR;
            app.loadErrTime = Date.now();
      })
}

// 把多个异步任务的数组变成异步串行执行函数
function flatternFnArray (fns) {
   fns = Array.isArray(fns) ? fns : [fns]
   return props => fns.reduce((p, fn => p.then(() => fn(props))), Promise.resolve())
}
```   

到这里注册应用流程就结束了，下面开始启动流程

#### 启动流程 start
启动函数的主要作用是：   
1. 根据 appsToUnmount 和 appsToUnload 卸载 app
2. 根据 appsToLoad 和 appsToMount 加载 app

⚠️ 注意点：
1. 所谓 卸载 和 加载，可以理解为就是改变 app 的状态 status
2. 需要注意的一点是：装载操作需要在卸载完成之后执行


```
export let started = false;
function start () {
      started = true;
      reroute();
}

function reroute () {
      const { appsToLoad, appsToMount, appsToUnmount, appsToUnload } = getAppChanges();
      if (started) {
            performAppChanges();
      }
      
      function performAppChanges () {
            const unLoadPromises = appsToUnload.map(toUnloadPromise)
            const unMountPromises = appsToUnmount.map(toUnmountPromise)
            const allUnloadPromise = Promise.all(unLoadPromises.concat(unMountPromises))
            appsToLoad.map(toLoadPromise).forEach(loadPromise => {
                  loadPromise.then(app => {
                        toBootstrapPromise(app).then(app => {
                              allUnloadPromise.then(() => {
                                    toMountPromise(app)
                              })
                        })
                  })
            })
            appsToMount
            .filter(appToMount => appsToLoad.indexOf(appToMount) < 0)
            .forEach(app => {
                  allUnloadPromise.then(() => {
                        toMountPromise(app)
                  })
            })
      }
}
```

#### 路由拦截流程
路由拦截的操作是在 navigationg-event.js 中
```
const shouldBeCaptureEvents = ['hashchange', 'popstate'];
const capturedEvenets = {
      'hashchange': [],
      'popstate': []
}
window.addEventListener('hashchange', reroute)
window.addEventListener('popstate', reroute)
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;
window.addEventListener = (...args) => {
      const [eventName, handler] = args;
      if (shouldBeCaptureEvents.includes(eventName)) {
            return capturedEvenets[eventName].push(handler)
      }
      originalAddEventListener(...args)
}
window.removeEventListener = (...args) => {
      const [eventName, handler] = args;
      if (shouldBeCaptureEvents.includes(eventName)) {
            const idx = capturedEvenets[eventName].indexOf(handler)
            return idx > -1 ? capturedEvenets[eventName].splice(idx, 1) : false
      }
      originalRemoveEventListener(...args)
}
```
这样当触发 hashchange 和 popstate 的时候，就会走 reroute 了，而在 single-spa 之后监听的事件就会全被放入 capturedEvenets 中。所以 reroute 就有了可能不是代码调用，而是浏览器事件触发导致 reroute 执行的情况了。   

想一想 🤔️ ：如果是浏览器 hash 改变导致触发的 reroute，需要做些什么呢？   
1. 有可能是监听新 hash 做某些新页面的操作，也有可能是旧业面被卸载了需求清除数据
2. 那么在 unmount 旧 app 之后，需要触发保存的事件
3. mount 新 app 之后，不要触发事件，因为会导致触发两次

那么对 performAppChanges 做下修改
```
function reroute (eventArguments) {
      function performAppChanges () {
            const unLoadPromises = appsToUnload.map(toUnloadPromise)
            const unMountPromises = appsToUnmount.map(toUnmountPromise)
            const allUnPromises = Promise.all(unLoadPromises.concat(unMountPromises))
            // ... appsToLoad appToMount should be mounted
            allUnPromises.then(() => {
                  capturedEvenets[eventArguments.type].forEach(fn => fn(eventArguments))
            })
      }
}
```

#### 卸载流程
unmount 事件流程：一般是触发了 reroute 重定向之后，getAppChanges 监测到当前 status 为 MOUNTED 且 appShouldBeActive 为 false，才会执行 unmount
unload 事件流程：getAppChanges 监测到当前 status 为 NOT_BOOTSTRAPED 或 NOT_MOUNTED 且此前已调用 unloadApplication，才会执行 unload   

##### 如何强制卸载应用
```
function unloadApplication (appName, waitForUnmount = false) {
      // 如果是等待的话，需要经历两次 reroute，才会被 unload，因为等待仅仅是把其放入了 unload.js 文件的 appsToUnload 对象中
      let app = apps.find(a => a === app)
      if (waitForUnmount) {
            const p = new Promise((resolve, reject) => {
                  appsToUnload[appName] = { app, resolve, reject }
                  Object.definePrrperty(app, 'promise', {
                        get () {
                              return p
                        }
                  })
            })
            return p;
      } else {
         return toUnmountPromise(app).then(app => {
               return toUnloadPromise(app)
         })
      }
}
```





