import React, { Component } from 'react'
import API from './helpers/API'
import { SettingsNav } from './SettingsNav'


class PasswordPage extends Component {
  constructor(props) {
    super(props)

    this.onSubmit = this.onSubmit.bind(this)
  }
  static get contextTypes() {
    return { notify: React.PropTypes.func.isRequired }
  }

  componentWillMount() {
    this.setState({
      password1: '',
      password2: '',
    })
  }

  onSubmit(ev) {
    ev.preventDefault()
    if (this.state.password1 !== this.state.password2) {
      this.context.notify({
        message: `Passwords Must Match`,
        level: 'error',
        autoDismiss: 1,
        onRemove: () => {
        }
      })
    }
    else {
      API.updatePassword({password: this.state.password1}, () => {
        this.setState({
          password1: '',
          password2: '',
        })
        this.context.notify({
          message: `Updated Password`,
          level: 'success',
          autoDismiss: 1,
          onRemove: () => {
          }
        })
      })
    }
  }

  onInputChange(key, ev) {
    var update = {}
    update[key] = ev.target.value
    this.setState(update)
  }

  render() {
    return (
      <div>
        <SettingsNav />
        <div>
          <h2> Change Password </h2>
          <br />
          <form onSubmit={this.onSubmit}>
            <fieldset>
              <label>New Password</label>
              <input
                type="password"
                value={this.state.password1}
                onChange={this.onInputChange.bind(this, 'password1')} />
            </fieldset>
            <fieldset>
              <label>Confirm Password</label>
              <input
                type="password"
                value={this.state.password2}
                onChange={this.onInputChange.bind(this, 'password2')} />
            </fieldset>
            <input type="submit" value="Reset Password" />
          </form>
        </div>
    </div>
    )
  }
}

export {
  PasswordPage
}
