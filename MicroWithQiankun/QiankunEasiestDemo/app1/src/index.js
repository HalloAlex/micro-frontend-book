import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const Foo = () => <h3>Foo</h3>;
const Bar = () => <h3>Bar</h3>;
const App = () => {
  return <Router basename="/app1">
    <Link to="/foo">Foo</Link>
    <Link to="/bar">Bar</Link>
    <Switch>
      <Route exact path="/foo">
        <Foo />
      </Route>
      <Route exact path="/bar">
        <Bar />
      </Route>
    </Switch>
  </Router>
}

// if (!window.singleSpaNavigate) {
//   ReactDOM.render(
//     <App />,
//     document.getElementById('root')
//   );
// }

export async function bootstrap(props) {
  console.log('app1 bootstrap')
}
export async function mount(props) {
  console.log('app1 mount:', props.container)
  ReactDOM.render(
    <App />,
    props.container
  );
}
export async function unmount(props) {
  ReactDOM.unmountComponentAtNode(props.container)
}
export async function update(props) {
  console.log('app1 update props', props);
}
