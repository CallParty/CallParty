import React, { Component } from 'react'
import { SettingsNav } from './SettingsNav'
import Loader from 'react-loader'
import API from './helpers/API'


class OverridePage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      users: [],
      loaded: false
    }

    this.clickUser = this.clickUser.bind(this)
  }

  static get contextTypes() {
    return { notify: React.PropTypes.func.isRequired }
  }

  componentWillMount() {
    API.overrides(data => {
      this.setState({
        users: data,
        loaded: true
      })
    })
  }

  clickUser(user) {
    API.removeOverride(
      user.id,
      (data) => {
        this.context.notify({
          message: 'Override Removed',
          level: 'success',
          autoDismiss: 1,
          // redirect to CampaignActionDetail page for newly created CampaignAction
          onRemove: () => {}
        })
        this.setState({users: data})
      })
  }

  render() {
    const users = this.state.users.sort().map(user => {
      return <UserItem key={user.id} onClick={this.clickUser} {...user} />
    })

    return (
      <div>
        <SettingsNav />
        <Loader loaded={this.state.loaded}>
          {this.state.users && this.state.users.length > 0
            ? <div className="table">
              <div className="table-header">
                <h1>Users With Overrides</h1>
              </div>
              <div className="override-explanation">
                Click on a user's row to remove them from override mode and re-connect them to the automated bot.
              </div>
              <table className="overrides-table">
                <tbody>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Callback Path</th>
                  </tr>
                  {users}
                </tbody>
              </table>
            </div>
            : <div>There are currently no users with overrides. Message a user through facebook messenger to enter override mode.</div>
          }
        </Loader>
      </div>
    )
  }

  viewCampaign(campaign) {
    this.props.router.push(`/${campaign.id}`)
  }
}

class UserItem extends Component {
  static get propTypes() {
    return { onClick: React.PropTypes.func.isRequired }
  }

  render() {
    return <tr onClick={() => this.props.onClick(this.props)}>
      <td>{this.props.id}</td>
      <td>{this.props.firstName} {this.props.lastName}</td>
      <td>{this.props.callbackPath}</td>
    </tr>
  }
}

export {
  OverridePage,
}
