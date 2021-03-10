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
   
**registerApplication 总共干三件事🦆 ：**   
1⃣️  把 app 维护进 apps，几个主要的属性有 appName（应用名称），loadApp（加载子应用的函数，返回 Promise），activeWhen（判断子应用何时激活的函数），customProps（自定义属性），status（当前子应用所处状态，初始化为 NOT_LOADED ），parcels（存储组件应用，暂时不用管），loadErrTime（加载失败时间，用于加载失败多久之后可重新加载）   
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
```


