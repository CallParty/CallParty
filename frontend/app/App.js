import React, {Component} from 'react';
import {Campaigns, Campaign, NewCampaign} from './Campaign';
import {NewUpdate, NewAction} from './Conversation';
import {Router, Route, Link, IndexRoute, browserHistory} from 'react-router';

// TODO nav?
const Container = (props) => {
  return <div>
    {props.children}
  </div>;
};

const NotFound = () => <h1>404.. This page is not found!</h1>;

class App extends Component {
  render() {
    return (
      <Router history={browserHistory}>
        <Route path='/' component={Container}>
          <IndexRoute component={Campaigns} />
          <Route path='new' component={NewCampaign} />
          <Route path=':id' component={Campaign} />
          <Route path=':id/action/new' component={NewAction} />
          <Route path=':id/update/new' component={NewUpdate} />
        </Route>
        <Route path='*' component={NotFound} />
      </Router>
    )
  }
}

export default App;
