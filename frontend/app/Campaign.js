import React, { Component } from 'react'
import { Link, browserHistory } from 'react-router'
import moment from 'moment'
import API from './helpers/API'

const DATE_FORMAT = 'h:mma on M/DD/YYYY'

function compareCampaigns(a, b) {
  if (a.lastCampaignActionSentAt < b.lastCampaignActionSentAt || !a.lastCampaignActionSentAt) {
    return 1
  } else if (a.lastCampaignActionSentAt > b.lastCampaignActionSentAt) {
    return -1
  } else {
    return 0
  }
}

class Campaigns extends Component {
  constructor(props) {
    super(props)
    this.state = {
      campaigns: []
    }

    this.viewCampaign = this.viewCampaign.bind(this)
  }

  componentWillMount() {
    API.campaigns(data => {
      this.setState({
        campaigns: data
      })
    })
  }

  render() {
    const campaigns = this.state.campaigns.sort(compareCampaigns).map(campaign => {
      return <CampaignItem key={campaign.id} onClick={this.viewCampaign} {...campaign} />
    })

    return (
      <div className="table">
        <div className="table-header">
          <h1>Campaigns</h1>
          <div className="table-header-buttons">
            <Link className="button" to="/new">New Campaign</Link>
          </div>
        </div>
        <table>
          <tbody>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Description</th>
              <th>Date Created</th>
              <th>Last Conversation Sent</th>
            </tr>
            {campaigns}
          </tbody>
        </table>
      </div>
    )
  }

  viewCampaign(campaign) {
    this.props.router.push(`/${campaign.id}`)
  }
}

class CampaignItem extends Component {
  static get propTypes() {
    return { onClick: React.PropTypes.func.isRequired }
  }

  render() {
    const createdAt = moment.utc(this.props.createdAt).local().format(DATE_FORMAT)

    let lastCampaignActionSentAt = 'N/A'
    if (this.props.lastCampaignActionSentAt) {
      lastCampaignActionSentAt = moment.utc(this.props.lastCampaignActionSentAt).local().format(DATE_FORMAT)
    }

    return <tr onClick={() => this.props.onClick(this.props)}>
      <td>{this.props.id}</td>
      <td>{this.props.title}</td>
      <td>{this.props.description}</td>
      <td>{createdAt}</td>
      <td>{lastCampaignActionSentAt}</td>
    </tr>
  }
}

function compareCampaignActions(a, b) {
  if (a.createdAt < b.createdAt) {
    return 1
  } else if (a.createdAt > b.createdAt) {
    return -1
  } else {
    return 0
  }
}

class Campaign extends Component {
  constructor(props) {
    super(props)
    this.state = {
      campaignActions: [],
      title: '',
    }
  }

  componentWillMount() {
    API.campaign(this.props.params.id, data => {
      this.setState(data)
    })
  }

  get breadcrumbTitle () {
    return this.state.title || this.props.params.id
  }

  render() {
    const createdAt = moment.utc(this.state.createdAt).local().format(DATE_FORMAT)
    const campaignActions = this.state.campaignActions.sort(compareCampaignActions).map((campaignAction, i) => {
      return <CampaignAction
        key={i}
        num={i}
        campaignId={this.props.params.id}
        campaignActionId={campaignAction.id}
        {...campaignAction}
      />
    })

    return (
      <div className="campaign">
        <div className="meta">
          <h1>Campaign: <span>{this.state.title}</span></h1>
          <p>Description: {this.state.description}</p>
          <p>Created at {createdAt}</p>
        </div>
        <div className="table">
          <div className="table-header">
            <h2>Conversations</h2>
            <div className="table-header-buttons">
              <Link className="button" to={`/${this.props.params.id}/call/new`}>New Action</Link>
              <Link className="button" to={`/${this.props.params.id}/update/new`}>New Update</Link>
            </div>
          </div>
          <table>
            <tbody>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Label</th>
                <th>Date Created</th>
                <th>Clone?</th>
              </tr>
              {campaignActions}
            </tbody>
          </table>
        </div>
      </div>)
  }
}

const ACTION_TYPES = {
  CampaignCall: 'call',
  CampaignUpdate: 'update'
}

function CampaignAction(props) {
  const createdAt = moment.utc(props.createdAt).local().format(DATE_FORMAT)
  const createDuplicateUrl = `/${props.campaignId}/${ACTION_TYPES[props.type]}/new?cloneId=${props.campaignActionId}`
  const redirectToCampaignActionPage = () => browserHistory.push(`/${props.campaignId}/actions/${props.campaignActionId}`)

  return (
    <tr onClick={redirectToCampaignActionPage}>
      <td>{props.num}</td>
      <td>{ACTION_TYPES[props.type]}</td>
      <td>{props.label}</td>
      <td>{createdAt}</td>
      <td><Link to={createDuplicateUrl} onClick={e => e.stopPropagation()}>Clone</Link></td>
    </tr>
  )
}

class NewCampaign extends Component {
  constructor(props) {
    super(props)

    this.onSubmit = this.onSubmit.bind(this)
  }
  static get contextTypes() {
    return { notify: React.PropTypes.func.isRequired }
  }

  componentWillMount() {
    this.setState({
      title: '',
      description: ''
    })
  }

  onSubmit(ev) {
    ev.preventDefault()
    API.newCampaign(this.state, campaign => {
      this.context.notify({
        message: `Campaign created`,
        level: 'success',
        autoDismiss: 1,
        onRemove: () => {
          this.props.router.push(`/${campaign.id}`)
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
          <label>Title</label>
          <input
            maxLength="640"
            type="text"
            value={this.state.title}
            onChange={this.onInputChange.bind(this, 'title')} />
        </fieldset>
        <fieldset>
          <label>Description</label>
          <input
            maxLength="640"
            type="text"
            value={this.state.description}
            onChange={this.onInputChange.bind(this, 'description')} />
        </fieldset>
        <input type="submit" value="Create" />
      </form>
    </div>
  }
}

export {
  Campaigns,
  Campaign,
  NewCampaign
}
