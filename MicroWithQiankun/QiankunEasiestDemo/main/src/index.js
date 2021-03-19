import React from 'react';
import ReactDOM from 'react-dom';
import { registerMicroApps, start } from 'qiankun';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

registerMicroApps([
  {
    name: 'react app', // app name registered
    entry: '//localhost:3002',
    container: '#app1',
    activeRule: '/app1',
  },
  {
    name: 'vue app',
    // entry: { scripts: ['//localhost:8080/main.js'] },
    entry: '//localhost:8081',
    container: '#app2',
    activeRule: '/app2',
  },
]);

start();

const App = () => {
  return <Router>
    <Link to="/app1">App1</Link>
    <Link to="/app2">App2</Link>
    <Switch>
      <Route path="/app1">
        <div id="app1" />
      </Route>
      <Route path="/app2">
        <div id="app2" />
      </Route>
    </Switch>
  </Router>
}

ReactDOM.render(<App />, document.getElementById('root'))