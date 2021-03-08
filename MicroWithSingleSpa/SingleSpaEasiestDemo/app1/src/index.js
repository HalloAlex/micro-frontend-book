import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const App = () => {
  return <Router basename="app1">
    <Link to="/home">Home</Link>
    <Link to="/about">About</Link>
    <Route path="/home"><Home /></Route>
    <Route path="/about"><About /></Route>
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

export const bootstrap = lifecycles.bootstrap
export const mount = lifecycles.mount
export const unmount = lifecycles.unmount