import React from 'react'
import { browserHistory } from 'react-router'

export default class RequireAuthenticationContainer extends React.Component {
  static get propTypes() {
    return {
      location: React.PropTypes.shape({ pathname: React.PropTypes.string }),
      children: React.PropTypes.oneOfType([
        React.PropTypes.arrayOf(React.PropTypes.node),
        React.PropTypes.node
      ])
    }
  }

  componentWillMount() {
    const sessionToken = window.localStorage.getItem('callparty_session_token')

    if (!sessionToken) {
      browserHistory.push({
        pathname: '/login',
        state: {
          redirectPath: this.props.location.pathname,
          unauthorized: true
        }
      })
    }
  }

  render() {
    return this.props.children
  }
}
