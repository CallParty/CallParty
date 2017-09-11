import React, { Component } from 'react'
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router'
import Loader from 'react-loader'
import NotificationSystem from 'react-notification-system'
import classNames from 'classnames'
import { Campaigns, Campaign, NewCampaign } from './Campaign'
import { SettingsPage } from './SettingsPage'
import NewCampaignUpdate from './NewCampaignUpdate'
import NewCampaignCall from './NewCampaignCall'
import { DebugAdminInput } from './DebugAdminInput'
import CampaignActionDetail from './CampaignActionDetail'
import RequireAuthenticationContainer from './RequireAuthenticationContainer'
import Login from './Login'
import API from './helpers/API'


class Container extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentAdmin: null,
      loaded: false,
    }
    this.refreshReps = this.refreshReps.bind(this)
    this.fetchCurrentAdmin = this.fetchCurrentAdmin.bind(this)
  }

  static get contextTypes() {
    return { notify: React.PropTypes.func.isRequired }
  }

  componentWillMount() {
    this.fetchCurrentAdmin()
  }

  fetchCurrentAdmin() {
    return API.getCurrentAdmin().then(data => {
      this.setState({ currentAdmin: data, loaded: true })
    })
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

  get breadcrumbTitle() {
    if (this.state.currentAdmin) {
      // TODO: this line of the code is never reached
      this.state.currentAdmin.bot
    } else {
      return 'CallParty'
    }
  }

  get breadcrumbs() {
    const routes = this.props.routes.filter(route => !!route.path)
    const depth = routes.length
    const currentLocation = this.props.location.pathname

    const breadcrumbs = routes.map((route, index) => {
      const Component = route.indexRoute ? route.indexRoute.component : route.component
      const component = new Component(this.props)
      const title = component.breadcrumbTitle
      const absolutePath = routes.slice(0, index + 1).map((r, i) => r.path.endsWith('/') || i === index ? r.path : `${r.path}/`).join('')
      const paramValues = Object.values(this.props.params)
      const absolutePathWithParams = absolutePath
        .split('/')
        .map(segment => segment.startsWith(':') ? paramValues.shift() : segment)
        .join('/')
      const isActive = currentLocation === absolutePathWithParams
      const linkClassName = classNames({
        'breadcrumb-link': true,
        'breadcrumb-link--active': isActive
      })

      return (
        <li className="breadcrumb" key={index}>
          <Link className={linkClassName} to={absolutePathWithParams || '/'}>
            {title}
          </Link>
          {(index + 1) < depth && ' > '}
        </li>
      )
    })

    return (
      <ul className="breadcrumbs">
        {breadcrumbs}
      </ul>
    )
  }

  render() {
    const isNotLogin = this.props.location.pathname !== '/login'
    const hasBreadcrumbs = isNotLogin && this.props.location.pathname !== '/settings'
    const logoutButton = isNotLogin ? <a onClick={this.logout} href=""><button>Sign Out</button></a> : null
    const refreshButton = isNotLogin ? <a onClick={this.refreshReps} href=""><button className="warn">Refresh Rep Data</button></a> : null
    const settingsButton = isNotLogin ? <Link to="/settings"><button className="warn">Settings</button></Link> : null
    const breadcrumbs = hasBreadcrumbs ? this.breadcrumbs : null
    const loggedInAs = isNotLogin && this.state.currentAdmin ? <a className="logged-in-as">Logged in as {this.state.currentAdmin.username}</a> : null
    const isDebugAdmin = this.state.currentAdmin && this.state.currentAdmin.isDebugAdmin

    return (
      <Loader loaded={this.state.loaded}>
        <div className="body-container">
          <header className="main-header">
            <div className="main-header-logo">
              <Link to="/"><img src="http://callparty.org/assets/images/callparty.png" alt="Call Party Logo" /></Link>
              {isDebugAdmin && <DebugAdminInput bot={this.state.currentAdmin.bot} />}
            </div>
            <div className="main-header-nav">
              {loggedInAs}
              {settingsButton}
              {refreshButton}
              {logoutButton}
            </div>
          </header>
          <div className="breadcrumbs-container">
            {breadcrumbs}
          </div>
          {React.cloneElement(this.props.children, { fetchCurrentAdmin: this.fetchCurrentAdmin })}
        </div>
      </Loader>
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
              <Route path="settings" component={SettingsPage} />
              <Route path=":id">
                <IndexRoute component={Campaign} />
                <Route path="actions/:actionId" component={CampaignActionDetail} />
              </Route>
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
