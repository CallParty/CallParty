import React from 'react'
import { browserHistory } from 'react-router'
import API from './helpers/API'

export default class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: ''
    }

    this.onUsernameChange = this.onInputChange.bind(this, 'username')
    this.onPasswordChange = this.onInputChange.bind(this, 'password')
    this.onSubmit = this.onSubmit.bind(this)
    this.onLoginSuccess = this.onLoginSuccess.bind(this)
    this.onLoginFailure = this.onLoginFailure.bind(this)
  }

  static get propTypes() {
    return {
      location: React.PropTypes.shape({
        state: React.PropTypes.shape({
          redirectPath: React.PropTypes.string,
          unauthorized: React.PropTypes.bool
        })
      }),
      fetchCurrentAdmin: React.PropTypes.func
    }
  }

  static get contextTypes() {
    return { notify: React.PropTypes.func.isRequired }
  }

  componentDidMount() {
    if (this.props.location.state && this.props.location.state.unauthorized) {
      this.context.notify({
        message: 'Please log in to access the CallParty admin tools.',
        level: 'warning',
        autoDismiss: 3
      })
    }
  }

  onInputChange(key, ev) {
    this.setState({ [key]: ev.target.value })
  }

  onSubmit(ev) {
    ev.preventDefault()

    const validationLabels = {
      username: 'Username',
      password: 'Password'
    }

    for (let k of ['username', 'password']) {
      if (this.state[k] === undefined || this.state[k] === null || this.state[k] === '') {
        this.context.notify({
          message: `${validationLabels[k]} can't be blank.`,
          level: 'error'
        })
        return
      }
    }

    API.login(this.state.username, this.state.password, this.onLoginSuccess, this.onLoginFailure)
  }

  onLoginSuccess() {
    const redirectPath = this.props.location.state && this.props.location.state.redirectPath
    const path = redirectPath || '/'
    browserHistory.push(path)
    this.props.fetchCurrentAdmin()
  }

  onLoginFailure() {
    this.context.notify({
      message: 'Invalid username or password.',
      level: 'error'
    })
  }

  render() {
    const pageStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }
    const formStyle = {
      width: '100%',
      maxWidth: '450px'
    }

    return (
      <div style={pageStyle}>
        <form onSubmit={this.onSubmit} style={formStyle}>
          <fieldset>
            <label>Username</label>
            <input
              type="text"
              value={this.state.username}
              onChange={this.onUsernameChange}
            />
          </fieldset>
          <fieldset>
            <label>Password</label>
            <input
              type="password"
              value={this.state.password}
              onChange={this.onPasswordChange}
            />
          </fieldset>
          <input type="submit" value="Login" />
        </form>
      </div>
    )
  }
}
