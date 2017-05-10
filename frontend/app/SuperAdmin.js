import React, { Component } from 'react'
import API from './helpers/API'


class SuperAdmin extends Component {
  constructor(props) {
    super(props)

    this.onSubmit = this.onSubmit.bind(this)
  }
  static get contextTypes() {
    return { notify: React.PropTypes.func.isRequired }
  }

  componentWillMount() {
    this.setState({
      username: '',
      password: '',
      bot: '',
    })
  }

  onSubmit(ev) {
    ev.preventDefault()
    API.newAdmin(this.state, () => {
      this.context.notify({
        message: `Admin created`,
        level: 'success',
        autoDismiss: 1,
        onRemove: () => {
          this.props.router.push(`/login`)
        }
      })
    })
  }

  onInputChange(key, ev) {
    var update = {}
    update[key] = ev.target.value
    this.setState(update)
  }

  render() {
    return <div>
      <form onSubmit={this.onSubmit}>
        <fieldset>
          <label>Username</label>
          <input
            type="text"
            value={this.state.username}
            onChange={this.onInputChange.bind(this, 'username')} />
        </fieldset>
        <fieldset>
          <label>Password</label>
          <input
            type="text"
            value={this.state.password}
            onChange={this.onInputChange.bind(this, 'password')} />
        </fieldset>
        <fieldset>
          <label>Bot</label>
          <input
            type="text"
            value={this.state.bot}
            onChange={this.onInputChange.bind(this, 'bot')} />
        </fieldset>
        <input type="submit" value="Create" />
      </form>
    </div>
  }
}

export {
  SuperAdmin
}
