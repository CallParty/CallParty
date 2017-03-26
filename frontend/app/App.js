import React, { Component } from 'react'
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router'
import NotificationSystem from 'react-notification-system'
import classNames from 'classnames'
import { Campaigns, Campaign, NewCampaign } from './Campaign'
import { NewCampaignUpdate, NewCampaignCall } from './NewCampaignAction'
import CampaignActionDetail from './CampaignActionDetail'
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

  get breadcrumbTitle() {
    return 'CallParty'
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
    const logoutButton = isNotLogin ? <a onClick={this.logout} href=""><button>Sign Out</button></a> : null
    const refreshButton = isNotLogin ? <a onClick={this.refreshReps} href=""><button className="warn">Refresh Rep Data</button></a> : null
    const breadcrumbs = isNotLogin ? this.breadcrumbs : null

    return (
      <div>
        <header className="main-header">
          {breadcrumbs}
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
