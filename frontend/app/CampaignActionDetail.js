import React from 'react'
import Loader from 'react-loader'
import moment from 'moment'
import Modal from 'react-modal'
import io from 'socket.io-client'
import API from './helpers/API'
import CampaignCallPreview from './CampaignCallPreview'
import CampaignUpdatePreview from './CampaignUpdatePreview'

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
  if (a.user && !b.user) {
    return 1
  } else if (!a.user && b.user) {
    return -1
  } else if (!a.user && !b.user) {
    return 0
  } else if (a.user.firstName > b.user.firstName) {
    return 1
  } else if (a.user.lastName > b.user.lastName) {
    return 1
  } else {
    return -1
  }
}

function UserConvoItem(props) {
  let numUserCalls = null
  let numRepresentatives = null
  if (props.userConvo.user && props.userConvo.user.convoData) {
    numUserCalls = props.userConvo.user.convoData.numUserCalls
    numRepresentatives = props.userConvo.user.convoData.representatives.length
  }

  const datePrompted = props.userConvo.datePrompted

  return (
    <tr>
      <td>{props.userConvo.user ? props.userConvo.user.id : ''}</td>
      <td>{props.userConvo.user ? props.userConvo.user.firstName + ' ' + props.userConvo.user.lastName : ''}</td>
      <td>{props.userConvo.status}</td>
      <td>{datePrompted ? moment.utc(datePrompted).local().format(DATE_FORMAT) : 'N/A'}</td>
      {props.actionType === 'CampaignCall'
        ? <td>{numUserCalls !== null ? `${numUserCalls} / ${numRepresentatives}` : ''}</td>
        : null
      }
    </tr>
  )
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
    this.closeConfirmationModal = this.closeConfirmationModal.bind(this)
    this.sendAction = this.sendAction.bind(this)
  }

  static get contextTypes() {
    return { notify: React.PropTypes.func.isRequired }
  }

  componentWillMount() {
    const socket = io()
    socket.on(`campaign_action/${this.props.params.actionId}`, message => {
      const data = JSON.parse(message)
      this.setState({ action: data.campaign_action })
    })
    this.fetchCampaignAction()
  }

  fetchCampaignAction() {
    return API.campaignAction(this.props.params.actionId).then(data => {
      this.setState({ action: data, loaded: true })
    })
  }

  get breadcrumbTitle() {
    return this.state.action.title || this.props.params.actionId
  }

  get representativesCount() {
    if (this.state.action.targetedRepIds) {
      return this.state.action.targetedRepIds.length
    }
    else {
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

  closeConfirmationModal() {
    this.setState({ confirmationModalIsOpen: false })
  }

  sendAction() {
    this.closeConfirmationModal()
    const notifyCallback = () => {
      const action = this.state.action
      action.sent = true
      this.setState({ action: action })

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
        throw new Error('++ invalid campaign action type')
    }
  }

  get preview() {
    switch (this.state.action.type) {
      case 'CampaignCall':
        return  <CampaignCallPreview campaignCall={this.state.action} />
      case 'CampaignUpdate':
        return <CampaignUpdatePreview campaignUpdate={this.state.action} />
      default:
        return null
    }
  }

  get targeting() {
    if (Object.keys(this.state.action).length === 0) {
      return null
    }

    const memberTypes = this.state.action.memberTypes || []
    const memberTypeLabels = { rep: 'Representatives', sen: 'Senators' }
    let memberTypeTargeting
    if (memberTypes.length === 0 || (memberTypes.includes('rep') && memberTypes.includes('sen'))) {
      memberTypeTargeting = 'All congress members'
    } else {
      memberTypeTargeting = memberTypeLabels[memberTypes[0]]
    }

    const parties = this.state.action.parties || []
    const partyLabels = { Democrat: 'Democrats', Republican: 'Republicans', Independent: 'Independents' }
    let partyTargeting
    if (parties.length === 0 || (parties.includes('Democrat') && parties.includes('Republican') && parties.includes('Independent'))) {
      partyTargeting = ['All parties']
    } else {
      partyTargeting = parties.map(party => partyLabels[party])
    }

    const committees = this.state.action.committees || []
    const committeeTargeting = committees.length === 0 ? ['All committees'] : committees

    const districts = this.state.action.districts || []
    const districtTargeting = districts.length === 0 ? ['All districts'] : districts

    let targeting = []
    if (this.state.action.targetingType === 'segmenting') {
      targeting = [memberTypeTargeting, ...partyTargeting, ...committeeTargeting, ...districtTargeting]
    } else if (this.state.action.targetingType === 'borrowed') {
      targeting = [`action: ${this.state.action.targetAction.title} `]
    }
    return (
      <ul className="targeting">
        {targeting.map((target, i) => (
          <li key={i} className="targeting-list-item">
            <span className="pill">{target}</span>
          </li>
        ))}
      </ul>
    )
  }

  render() {
    const createdAt = moment.utc(this.state.action.createdAt).local().format(DATE_FORMAT)
    const actionTypeLabels = {
      CampaignCall: 'Call',
      CampaignUpdate: 'Update'
    }

    const userConversations = this.state.action.userConversations
    let userConvos = null
    if (userConversations) {
      const sortedUserConversations = this.state.action.userConversations.sort(compareUserConvos)
      userConvos = sortedUserConversations.map((userConvo, i) => {
        return <UserConvoItem
          key={i}
          num={i}
          userConvo={userConvo}
          actionType={this.state.action.type}
        />
      })
    }

    return (
      <Loader loaded={this.state.loaded}>
        <div className="campaign-action-detail">
          <div className="meta">
            <h1>{this.state.action.label}</h1>
            <h4>Created at {createdAt}</h4>
          </div>

          {this.state.action.sent
            ? null
            : <div className="preview-warning">This is a preview and has not been sent yet</div>}

          <div className="meta">
            <h1>{actionTypeLabels[this.state.action.type]}</h1>
            {this.statistics}
          </div>

          <div className="details-container">
            <div className="campaign-action-preview-container">
              {this.preview}
            </div>

            <div className="targeting-container">
              <h4>Targeting</h4>
              {this.targeting}
            </div>
          </div>

          <div className="sent-to">
            <h1>Sent To</h1>
            <button className="send-button" onClick={() => this.setState({ confirmationModalIsOpen: true })}>
              {this.state.action.sent ? 'Send to remaining list' : 'Send'}
            </button>
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
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Date Received</th>
                  {this.state.action.type === 'CampaignCall'
                    ? <th>Called</th>
                    : null
                  }
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
