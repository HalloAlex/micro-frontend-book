import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";


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
const HelloReactParcel = () => {
  loadParcel()
  return <div id="parcel"></div>
}
const App = () => {
  return <Router basename="app1">
    <Link to="/home">Home</Link>
    <Link to="/about">About</Link>
    <Link to="/HelloReactParcel">HelloReactParcel</Link>
    <Route path="/home"><Home /></Route>
    <Route path="/about"><About /></Route>
    <Route path="/HelloReactParcel">
      <HelloReactParcel />
    </Route>
  </Router>
}

const Home = () => <div>Home</div>
const About = () => <div>About</div>

if (!window.singleSpaNavigate) {
  ReactDOM.render(
    <App />,
    document.getElementById('root')
  );
}

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  domElementGetter: () => document.getElementById('microBox')
})

let mountParcel
export const bootstrap = props => {
  mountParcel = props.mountParcel
  return lifecycles.bootstrap(props)
}
export const mount = lifecycles.mount
export const unmount = lifecycles.unmount