### single-spa 路由系统及 Future State
思考一下微前端路由系统的解决方案：
1. 进入主应用 http://localhost:8081
2. 主应用中点击 app1，路由变为 http://localhost:8081/app1
3. 此时去加载 app1 应用的内容，app1 挂载完成之后接管 url change 事件

