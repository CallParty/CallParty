import React, { Component } from 'react'
import { Link } from 'react-router'

class SettingsNav extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="settings-nav-wrapper">
        <h1 className="settings-header">Settings</h1>
        <div className="settings-nav">
          <Link className="settings-link" to="/settings/password">Password</Link>
          <Link className="settings-link" to="/settings/users">Users</Link>
          <Link className="settings-link" to="/settings/export">Export</Link>
        </div>
      </div>
    )
  }
}

export {
  SettingsNav
}
