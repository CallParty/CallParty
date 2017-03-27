import React, { Component } from 'react'
import Loader from 'react-loader'
import moment from 'moment'
import Modal from 'react-modal'
import API from './API'
import CampaignCallPreview from './CampaignCallPreview'

const DATE_FORMAT = 'h:mma on M/DD/YYYY'

// used in both the NewCampaignUpdate and NewAction components
const CONFIRMATION_MODAL_STYLE = {
  content: {
    top: '50%',
    left: '50%',
    right: '',
    bottom: '',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    maxWidth: '300px',
    height: '100%',
    maxHeight: '135px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
}

function compareUserConvos(a, b) {
  if (a.user.firstName < b.user.firstName) {
    return 1
  } else if (a.user.lastName < b.user.lastName) {
    return 1
  } else {
    return -1
  }
}

class UserConvoItem extends Component {
  render() {

    let numUserCalls = null
    if (this.props.userConvo.convoData) {
      numUserCalls = this.props.userConvo.convoData.numUserCalls
    }

    // TODO: calculate X as number of reps
    return <tr>
      <td>{this.props.userConvo.user.id}</td>
      <td>{this.props.userConvo.user.firstName} {this.props.userConvo.user.lastName}</td>
      <td>{this.props.userConvo.status}</td>
      <td>{this.props.userConvo.datePrompted}</td>
      <td>{numUserCalls ? numUserCalls + '/ X' : ''}</td>
    </tr>
  }
}

export default class CampaignActionDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      action: {},
      loaded: false,
      confirmationModalIsOpen: false,
    }
    this.fetchCampaignAction = this.fetchCampaignAction.bind(this)
  }

  static get contextTypes() {
    return { notify: React.PropTypes.func.isRequired }
  }

  componentWillMount() {
    this.fetchCampaignAction()
    var intervalId = setInterval(() => {
      console.log('++ updating campaign action')
      this.fetchCampaignAction()
    }, 1000)
    this.setState({intervalId: intervalId})
  }

  componentWillUnmount() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId)
    }
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
      { label: 'Constituents targeted', value: userConversationsCount }
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

  closeConfirmationModal = () => {
    this.setState({ confirmationModalIsOpen: false })
  }

  get preview() {
    switch (this.state.action.type) {
      case 'CampaignCall':
        return  <CampaignCallPreview campaignCall={this.state.action} />
      case 'CampaignUpdate':
        return this.state.action.message
      default:
        return null
    }
  }

  sendAction = () => {
    this.closeConfirmationModal()
    const notifyCallback = () => {
      this.context.notify({
        message: 'Sent',
        level: 'success',
        autoDismiss: 1,
        onRemove: () => {}
      })
    }
    switch (this.state.action.type) {
      case 'CampaignCall':
          return API.sendCampaignCall(this.state.action.id).then(notifyCallback)
      case 'CampaignUpdate':
          return API.sendCampaignUpdate(this.state.action.id).then(notifyCallback)
      default:
          console.log('++ invalid campaign action type')
          return null
    }
  }

  render = () => {
    const createdAt = moment.utc(this.state.action.createdAt).local().format(DATE_FORMAT)
    const actionTypeLabels = {
      CampaignCall: 'Call',
      CampaignUpdate: 'Update'
    }

    const userConversations = this.state.action.userConversations
    let userConvos = null
    if (userConversations) {
      userConvos = this.state.action.userConversations.sort(compareUserConvos).map((userConvo, i) => {
        return <UserConvoItem
          key={i}
          num={i}
          userConvo={userConvo}
        />
      })
    }

    return (
      <Loader loaded={this.state.loaded}>
        <div className="campaign-action-detail">
          <div className="meta">
            <h1>{this.state.action.title}</h1>
            <h4>Created at {createdAt}</h4>
          </div>

          {this.state.action.sent
            ? null
            : <div className="preview-warning">This is a preview and has not been sent yet</div>}

          <div className="meta">
            <h1>{actionTypeLabels[this.state.action.type]}</h1>
            {this.statistics}
          </div>

          <div className="campaign-action-preview-container">
            {this.preview}
          </div>

          <div className="sent-to">
            <h1>Sent To</h1>
            <button className="send-button" onClick={() => this.setState({ confirmationModalIsOpen: true })}>Send</button>
          </div>

          <Modal
            isOpen={this.state.confirmationModalIsOpen}
            style={CONFIRMATION_MODAL_STYLE}
            contentLabel="Confirm"
          >
            <p style={{ marginBottom: '10px' }}>Are you sure?</p>
            <div>
              <button onClick={this.sendAction} style={{ marginRight: '10px' }}>Yes</button>
              <button onClick={this.closeConfirmationModal}>No</button>
            </div>
          </Modal>

          <div className="userconvo-table table">
            <table>
              <tbody>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Date Received</th>
                  <th>NumCalls</th>
                </tr>
                {userConvos}
              </tbody>
            </table>
          </div>
        </div>
      </Loader>
    )
  }
}
