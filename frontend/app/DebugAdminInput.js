import React, { Component } from 'react'
import API from './helpers/API'


class DebugAdminInput extends Component {
  constructor(props) {
    super(props)

    this.onSubmit = this.onSubmit.bind(this)
  }
  static get contextTypes() {
    return { notify: React.PropTypes.func.isRequired }
  }

  componentWillMount() {
    this.setState({
      bot: this.props.bot,
    })
  }

  async onSubmit(ev) {
    ev.preventDefault()
    API.updateDebugAdmin(
      {bot: this.state.bot},
      () => {
        this.context.notify({
          message: `Updated Bot`,
          level: 'success',
          autoDismiss: 1,
          onRemove: () => {
          }
        })
        window.location.reload()
      })
  }

  onInputChange(key, ev) {
    var update = {}
    update[key] = ev.target.value
    this.setState(update)
  }

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <input
            type="text"
            value={this.state.bot}
            onChange={this.onInputChange.bind(this, 'bot')} />
        </form>
      </div>
    )
  }
}

export {
  DebugAdminInput
}
