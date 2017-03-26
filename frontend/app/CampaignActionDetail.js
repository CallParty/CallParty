import React from 'react'
import Loader from 'react-loader'
import moment from 'moment'
import API from './API'

const DATE_FORMAT = 'h:mma on M/DD/YYYY'

export default class CampaignActionDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      action: {
        subject: ''
      },
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

  get breadcrumbTitle () {
    return this.state.action.subject || this.props.params.actionId
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
            <h1>{this.state.action.subject}</h1>
            <h4>Created at {createdAt}</h4>
          </div>

          <div className="meta">
            <h1>{actionTypeLabels[this.state.action.type]}</h1>
          </div>
        </div>
      </Loader>
    )
  }
}
