import React from 'react'
import Loader from 'react-loader'
import moment from 'moment'
import API from './API'
import CampaignCallPreview from './CampaignCallPreview'

const DATE_FORMAT = 'h:mma on M/DD/YYYY'

export default class CampaignActionDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      action: {},
      loaded: false
    }
    this.fetchCampaignAction = this.fetchCampaignAction.bind(this)
  }

  componentWillMount() {
    this.fetchCampaignAction()
  }

  fetchCampaignAction() {
    return API.campaignAction(this.props.params.actionId).then(data => this.setState({ action: data, loaded: true }))
  }

  get breadcrumbTitle() {
    return this.state.action.title || this.props.params.actionId
  }

  get representativesCount() {
    switch (this.state.action.type) {
      case 'CampaignCall':
        return this.state.action.matchingRepresentatives.length
      case 'CampaignUpdate':
        return this.state.action.campaignCall.matchingRepresentatives.length
      default:
        return 0
    }
  }

  get statistics() {
    const userConversationsCount  = this.state.action.userConversations ? this.state.action.userConversations.length : 0
    const stats = [
      { label: 'Members targeted', value: this.representativesCount },
      { label: 'Constituents sent', value: userConversationsCount }
    ]

    if (this.state.action.type === 'CampaignCall') {
      const callCount = this.state.action.userActions.filter(ua => ['staffer', 'voicemail'].includes(ua.actionType)).length
      stats.push({ label: 'Calls made', value: callCount })
    }

    return (
      <div className="campaign-action-statistics">
        {stats.map(({ label, value }, index) => (
          <div key={index} className="campaign-action-statistic">
            <div className="campaign-action-statistic-label">{label}</div>
            <span className="pill">{value}</span>
          </div>
        ))}
      </div>
    )
  }

  get preview() {
    switch (this.state.action.type) {
      case 'CampaignCall':
        return  <CampaignCallPreview campaignCall={this.state.action} />
      case 'CampaignUpdate':
        return null
      default:
        return null
    }
  }

  render() {
    const createdAt = moment.utc(this.state.action.createdAt).local().format(DATE_FORMAT)
    const actionTypeLabels = {
      CampaignCall: 'Call',
      CampaignUpdate: 'Update'
    }

    return (
      <Loader loaded={this.state.loaded}>
        <div className="campaign-action-detail">
          <div className="meta">
            <h1>{this.state.action.title}</h1>
            <h4>Created at {createdAt}</h4>
          </div>

          <div className="meta">
            <h1>{actionTypeLabels[this.state.action.type]}</h1>
            {this.statistics}
          </div>

          <div className="campaign-action-preview-container">
            {this.preview}
          </div>

        </div>
      </Loader>
    )
  }
}
