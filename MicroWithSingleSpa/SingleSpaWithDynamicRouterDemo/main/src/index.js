import React from 'react';
import ReactDOM from 'react-dom';
import { registerApplication, start } from 'single-spa'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

ReactDOM.render(
  <div>
    This is Main App
    <Router>
      <Link to="/app1">app1</Link>
      <Link to="/app2">app2</Link>
    </Router>
    <div id="microBox"></div>
  </div>,
  document.getElementById('root')
);

const createScript = url => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}
const loadScript = async (appName, scriptUrls) => {
  for (let scriptUrl of scriptUrls) {
    await createScript(scriptUrl)
  }
  return window[appName]
}
registerApplication('app1', () => loadScript('app1', [
  'http://localhost:3001/runtime-main.js',
  'http://localhost:3001/vendors~main.js',
  'http://localhost:3001/main.js',
]), location => location.pathname.startsWith('/app1'))
registerApplication('app2', () => loadScript('app2', [
  'http://localhost:8081/js/chunk-vendors.js',
  'http://localhost:8081/js/app.js'
]), location => location.pathname.startsWith('/app2'))
start()