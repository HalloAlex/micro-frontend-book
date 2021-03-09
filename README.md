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
#### 应用注册流程
调用 registerApplication 注册应用，registerApplication 传入 appName，loadApp，activeWhen，customProps
1. appName：字符串，作为唯一键标识应用
2. loadApp：函数，返回一个 promise 实例，如果不是 function，single-spa 内部会 () => Promise.resolve(loadApp) 把其封装为一个函数
3. activeWhen：函数或者字符串，函数接收 location
4. customProps：object，自定义属性

##### appName可不可以不要呢❓
不可以。从咱们使用来看确实没什么用，可是 single-spa 内部把 appName 作为唯一键，注销应用之类的都靠 appName 完成，所以这里必须要 appName

##### registerApplication
流程在 single-spa/src/applications/apps.js 文件中，总共两步骤：1. 把新 app 维护进 apps， 2. 重定向   
1. 此文件中有个变量 apps，存储了全部的应用，当调用 registerApplication 时，就会把当前传入的参数封装为一个 app，存放入 apps 中。app 总共有几个较为重要的属性：name，loadApp，activeWhen，customProps，status（当前 app 所处状态），loadErrTime（加载失败时间点），parcels（组件应用）
2. 调用 reroute（重定向）   

#### 重定向流程
流程在 single-spa/src/navigation/reroute.js 文件中

##### getAppChanges 遍历 apps 把状态分为四类
1. 判断当前应用状态是否为需要被激活：const appShouldBeActive = app.activeWhen(location) && app.status !== SKIP_BECAUSE_BROKEN
2. appShouldBeActive 为 true，NOT_LOAD｜LOADING_SOURCE_CODE 两个状态被列入 appsToLoad
3. appShouldBeActive 为 true，NOT_BOOTSTRAPED｜NOT_MOUNTED 两个状态被列入 appsToMount
4. appShouldBeActive 为 false，NOT_BOOTSTRAPED｜NOT_MOUNTED 两个状态被列入 appsToUnload
5. appSHouldBeActive 为 false，MOUNTED 状态被列入 appsToUnmount
6. return { appsToLoad, appsToMount, appsToUnmount, appsToUnload }

###### 为什么 appsToMount 不包括 BOOTSTRAPING 状态❓
因为根据状态机为 app 分类，只有在 reroute 之初调用，可是之后改变 app.status 之后，却没有重新划分，比如 appsToUnload 数组中的 app 状态变为了 MOUNTED，应该去到 appsToMount 数组中，可是 appsToMount 并没有重新获取，所以在代码中的操作是 toLoadPromise.then => toBootstrapPromise.then => toMountPromise.then，toLoad 和 toBootstrap 都会走 toMount 的链路，所以当处于 BOOTSTRAPING 状态时，并不需要把它列入 appsToMount 中，因为它还有 toMountPromise 还未执行

重定向流程有两个分支：
1. 注册完应用，还未启动：loadApps
2. 已启动应用：performAppChanges

#### loadApps 注册完应用，预先加载


