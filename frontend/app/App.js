import React, { Component } from 'react'
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router'
import NotificationSystem from 'react-notification-system'
import { Campaigns, Campaign, NewCampaign } from './Campaign'
import { NewUpdate, NewAction } from './Conversation'
import RequireAuthenticationContainer from './RequireAuthenticationContainer'
import Login from './Login'

const Container = (props) => {
  return <div>
    <header className="main-header">
      <Link to="/">CallParty</Link>
    </header>
    {props.children}
  </div>
}

const NotFound = () => <h1>404.. This page is not found!</h1>

class App extends Component {
  static get childContextTypes() {
    return { notify: React.PropTypes.func }
  }

  getChildContext() {
    return {
      notify: this.notify.bind(this),
    }
  }

  notify(notification) {
    this.notifications.addNotification(notification)
  }

  componentDidMount() {
    this.notifications = this.refs.notifications
  }

  render() {
    return (
      <main>
        <Router history={browserHistory}>
          <Route path="/" component={Container}>
            <Route path="login" component={Login} />
            <Route component={RequireAuthenticationContainer}>
              <IndexRoute component={Campaigns} />
              <Route path="new" component={NewCampaign} />
              <Route path=":id" component={Campaign} />
              <Route path=":id/action/new" component={NewAction} />
              <Route path=":id/update/new" component={NewUpdate} />
            </Route>
          </Route>
          <Route path="*" component={NotFound} />
        </Router>
        <NotificationSystem ref="notifications" style={false} />
      </main>
    )
  }
}

export default App
