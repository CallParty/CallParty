import React, { Component } from 'react'
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router'
import NotificationSystem from 'react-notification-system'
import { Campaigns, Campaign, NewCampaign } from './Campaign'
import { NewCampaignUpdate, NewCampaignCall } from './NewCampaignAction'
import RequireAuthenticationContainer from './RequireAuthenticationContainer'
import Login from './Login'
import API from './API'


class Container extends Component {
  constructor(props) {
    super(props)
    this.refreshReps = this.refreshReps.bind(this)
  }

  static get contextTypes() {
    return { notify: React.PropTypes.func.isRequired }
  }

  logout() {
    window.localStorage.removeItem('callparty_session_token')
    browserHistory.push('/login')
  }

  refreshReps(e) {
    e.preventDefault()
    API.updateReps(() => {
      this.context.notify({
        message: `Representative and Committee data refreshed.`,
        level: 'success'
      })
    })
  }

  render() {
    const logoutButton = this.props.location.pathname !== '/login' ? <a onClick={this.logout} href=""><button>Sign Out</button></a> : null

    const refreshButton = this.props.location.pathname !== '/login' ? <a onClick={this.refreshReps} href=""><button className="warn">Refresh Rep Data</button></a> : null

    return (
      <div>
        <header className="main-header">
          <Link to="/">CallParty</Link>
          <div className="main-header-nav">
            {refreshButton}
            {logoutButton}
          </div>
        </header>
        {this.props.children}
      </div>
    )
  }
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

  render() {
    return (
      <main>
        <NotificationSystem ref={notifications => { this.notifications = notifications }} style={false} />
        <Router history={browserHistory}>
          <Route path="/" component={Container}>
            <Route path="login" component={Login} />
            <Route component={RequireAuthenticationContainer}>
              <IndexRoute component={Campaigns} />
              <Route path="new" component={NewCampaign} />
              <Route path=":id" component={Campaign} />
              <Route path=":id/call/new" component={NewCampaignCall} />
              <Route path=":id/update/new" component={NewCampaignUpdate} />
            </Route>
          </Route>
          <Route path="*" component={NotFound} />
        </Router>
      </main>
    )
  }
}

export default App
