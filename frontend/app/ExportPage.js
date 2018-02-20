import React, { Component } from 'react'
import API from './helpers/API'
import { SettingsNav } from './SettingsNav'


class ExportPage extends Component {
  constructor(props) {
    super(props)

    this.onSubmit = this.onSubmit.bind(this)
  }
  static get contextTypes() {
    return { notify: React.PropTypes.func.isRequired }
  }

  componentWillMount() {
    this.setState({
      email: '',
      status: ''
    })
  }

  onInputChange(key, ev) {
    var update = {}
    update[key] = ev.target.value
    this.setState(update)
  }

  onSubmit(ev) {
    ev.preventDefault()
    this.setState({
      status: 'exporting'
    })
    API.exportData(this.state.email)
  }

  render() {
    return (
      <div>
        <SettingsNav />
        <div>
          <h2> Export Data </h2>
          <br />
          {this.state.status !== 'exporting'
            ? <div>
              <div className="settings-explanation">
                Clicking the export button below will export your data to .json and email a link
                to the given email address.
              </div>
              <form onSubmit={this.onSubmit} className="export-form">
                <fieldset>
                  <label>Email Address</label>
                  <input
                    type="text"
                    value={this.state.email}
                    onChange={this.onInputChange.bind(this, 'email')} />
                </fieldset>
                <input type="submit" value="Begin Export" />
              </form>
            </div>
            : <div className="settings-explanation">Your data is exporting. You will receive an email at {this.state.email} with the export when it is complete.</div>
          }
        </div>
      </div>
    )
  }
}

export {
  ExportPage
}
