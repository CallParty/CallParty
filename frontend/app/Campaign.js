import React, { Component } from 'react'
import { Link } from 'react-router'
import moment from 'moment'
import API from './API'

class Campaigns extends Component {
  constructor(props) {
    super(props)
    this.state = {
      campaigns: []
    }
  }

  componentWillMount() {
    API.campaigns(data => {
      this.setState({
        campaigns: data
      })
    })
  }

  render() {
    return (
      <div className="table">
        <header>
          <h1>Campaigns</h1>
          <Link to="/new"><button className="new-campaign">New Campaign</button></Link>
        </header>
        <table>
          <tbody>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Description</th>
            <th>Date Created</th>
          </tr>
          {this.state.campaigns.map(campaign =>
            <CampaignItem key={campaign.id} onClick={this.viewCampaign.bind(this)} {...campaign} />)}
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
    const createdAt = moment.utc(this.props.createdAt).local().format('h:mma on M/DD/YYYY')
    return <tr onClick={() => this.props.onClick(this.props)}>
      <td>{this.props.id}</td>
      <td>{this.props.title}</td>
      <td>{this.props.description}</td>
      <td>{createdAt}</td>
    </tr>
  }
}

class Campaign extends Component {
  constructor(props) {
    super(props)
    this.state = {
      actions: []
    }
  }
  componentWillMount() {
    API.campaign(this.props.params.id, data => {
      this.setState(data)
    })
  }

  render() {
    const createdAt = moment.utc(this.state.createdAt).local().format('h:mma on M/DD/YYYY')
    return (
      <div className="campaign">
        <div className="meta">
          <h1>{this.state.title}</h1>
          <h2>{this.state.description}</h2>
          <h4>Created at {createdAt}</h4>
        </div>
        <div className="table">
          <header>
            <h1>Conversations</h1>
            <Link to={`/${this.props.params.id}/call/new`}><button className="new-action">New Action</button></Link>
            <Link to={`/${this.props.params.id}/update/new`}><button className="new-update">New Update</button></Link>
          </header>
          <table>
            <tbody>
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Subject</th>
              <th>Date Created</th>
              <th>Clone</th>
            </tr>
            {this.state.actions.map((convo, i) =>
              <ConversationItem
                key={i}
                num={i}
                campaignId={this.props.params.id}
                campaignActionId={convo.id}
                {...convo}
              />)}
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

class ConversationItem extends Component {

  getCreateDuplicateUrl() {

    return `/${this.props.campaignId}/${ACTION_TYPES[this.props.type]}/new?cloneId=${this.props.campaignActionId}`
  }

  render() {
    const createdAt = moment.utc(this.props.createdAt).local().format('h:mma on M/DD/YYYY')

    return <tr>
      <td>{this.props.num}</td>
      <td>{ACTION_TYPES[this.props.type]}</td>
      <td>{this.props.subject}</td>
      <td>{createdAt}</td>
      {this.props.type === 'CampaignCall'
        ? <td><Link to={this.getCreateDuplicateUrl()}>Clone</Link></td>
        : <td></td>}
    </tr>
  }
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
            type="text"
            value={this.state.title}
            onChange={this.onInputChange.bind(this, 'title')} />
        </fieldset>
        <fieldset>
          <label>Description</label>
          <input
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
