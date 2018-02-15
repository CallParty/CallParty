import React, { Component } from 'react'
import { SettingsNav } from './SettingsNav'
import Loader from 'react-loader'
import API from './helpers/API'


function compareUsers(a, b) {
  if (a.override > b.override) {
    return -1
  } else if (b.override > a.override) {
    return 1
  } else {
    if (a.firstName === b.firstName) {
      if (a.lastName > b.lastName) {
        return 1
      } else if (a.lastName === b.lastName) {
        return 0
      } else {
        return -1
      }
    } else {
      if (a.firstName > b.firstName) {
        return 1
      } else if (a.firstName === b.firstName) {
        return 0
      } else {
        return -1
      }
    }
  }
}

class UsersPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      users: [],
      loaded: false
    }

    this.clickUserOverride = this.clickUserOverride.bind(this)
  }

  static get contextTypes() {
    return { notify: React.PropTypes.func.isRequired }
  }

  componentWillMount() {
    API.users(data => {
      this.setState({
        users: data,
        loaded: true
      })
    })
  }

  clickUserOverride(user) {
    let newOverrideValue = 1
    let successMessage = 'Override Set'
    if (user.override) {
      newOverrideValue = 0
      successMessage = 'Override Removed'
    }
    API.setOverride(
      user.id,
      newOverrideValue,
      (data) => {
        this.context.notify({
          message: successMessage,
          level: 'success',
          autoDismiss: 1,
          // redirect to CampaignActionDetail page for newly created CampaignAction
          onRemove: () => {}
        })
        this.setState({users: data})
      })
  }

  render() {
    const users = this.state.users.sort(compareUsers).map(user => {
      return <UserItem key={user.id} onClick={this.clickUserOverride} {...user} />
    })

    return (
      <div>
        <SettingsNav />
        <Loader loaded={this.state.loaded}>
          {this.state.users && this.state.users.length > 0
            ? <div className="table">
              <div className="table-header">
                <h1>Users</h1>
              </div>
              <table className="overrides-table">
                <tbody>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Callback Path</th>
                    <th>Override</th>
                  </tr>
                  {users}
                </tbody>
              </table>
            </div>
            : <div>There are currently no subscribed users.</div>
          }
        </Loader>
      </div>
    )
  }
}

class UserItem extends Component {
  static get propTypes() {
    return { onClick: React.PropTypes.func.isRequired }
  }

  render() {
    return <tr className="no-highlight">
      <td>{this.props.id}</td>
      <td>{this.props.firstName} {this.props.lastName}</td>
      <td>{this.props.callbackPath}</td>
      <td><input type="checkbox" checked={this.props.override} onChange={this.props.onClick.bind(this, this.props)} /></td>
    </tr>
  }
}

export {
  UsersPage,
}
