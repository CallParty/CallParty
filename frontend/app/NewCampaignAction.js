import API from './API'
import React, { Component } from 'react'
import Select from 'react-select'
import { Link } from 'react-router'
import Modal from 'react-modal'
import CampaignCallPreview from './CampaignCallPreview'

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


class NewCampaignUpdate extends Component {
  constructor(props) {
    super(props)
    this.state = {
      campaign: { actions: [] },
      update: {
        message: 'Hello! This is an update.',
        campaignCall: null
      },
      confirmationModalIsOpen: false
    }

    this.onSubmit = this.onSubmit.bind(this)
    this.onSelectChange = this.onSelectChange.bind(this)
    this.onMessageChange = this.onMessageChange.bind(this)
    this.createCampaignUpdate = this.createCampaignUpdate.bind(this)
    this.closeConfirmationModal = this.closeConfirmationModal.bind(this)
  }

  static get contextTypes() {
    return { notify: React.PropTypes.func.isRequired }
  }

  componentWillMount() {
    API.campaign(this.props.params.id, data => {
      this.setState({
        campaign: data
      })
    })
  }

  onSubmit = (ev) => {
    ev.preventDefault()

    const update = this.state.update
    const validationLabels = {
      message: 'Message',
      campaignCall: 'Call to Action Reference'
    }

    const fieldsToValidate = ['campaignCall', 'message']
    for (let k of fieldsToValidate) {
      if (update[k] === undefined || update[k] === null || update[k] === '') {
        this.context.notify({
          message: `${validationLabels[k]} can't be blank`,
          level: 'error'
        })
        return
      }
    }

    this.setState({ confirmationModalIsOpen: true })
  }

  createCampaignUpdate = () => {
    this.closeConfirmationModal()

    API.newCampaignUpdate(
      this.state.campaign.id,
      this.state.update,
      (campaignUpdate) => {
        API.sendCampaignUpdate(campaignUpdate.id)
        this.context.notify({
          message: 'Update created',
          level: 'success',
          autoDismiss: 1,
          onRemove: () => {
            this.props.router.push(`/${this.state.campaign.id}`)
          }
        })
      }
    )
  }

  closeConfirmationModal() {
    this.setState({ confirmationModalIsOpen: false })
  }

  onSelectChange = (val) => {
    const update = this.state.update
    update.campaignCall = val
    this.setState({
      update: update
    })
  }

  onMessageChange = (ev) => {
    const update = this.state.update
    update.message = ev.target.value
    this.setState({
      update: update
    })
  }

  render = () => {
    const notUpdates = this.state.campaign.actions.filter(a => a.type !== 'CampaignUpdate')
    const options = notUpdates.map(a => ({
      value: a.id,
      label: a.subject
    }))

    return (
      <div>
        <div className="meta">
          <h1>New Update</h1>
          <h3>Campaign: <Link to={`/${this.state.campaign.id}`}>{this.state.campaign.title}</Link></h3>
        </div>
        <form onSubmit={this.onSubmit}>
          <fieldset>
            <label htmlFor="callToActionReference">Call to Action Reference</label>
            <Select
              name="callToActionReference"
              value={this.state.update.campaignCall}
              options={options}
              onChange={this.onSelectChange}
            />
          </fieldset>
          <fieldset>
            <label htmlFor="message">Message</label>
            <textarea id="message" value={this.state.update.message} onChange={this.onMessageChange} />
          </fieldset>
          <input type="submit" value="Send" />
        </form>
        <div className="preview">
          <h4>Preview</h4>
          <div className="preview-message">{this.state.update.message}</div>
        </div>
        <Modal
          isOpen={this.state.confirmationModalIsOpen}
          style={CONFIRMATION_MODAL_STYLE}
          contentLabel="Confirm"
        >
          <p style={{ marginBottom: '10px' }}>Are you sure?</p>
          <div>
            <button onClick={this.createCampaignUpdate} style={{ marginRight: '10px' }}>Yes</button>
            <button onClick={this.closeConfirmationModal}>No</button>
          </div>
        </Modal>
      </div>
    )
  }
}


const PARTIES = [{
  value: 'Democrat',
  label: 'Democratic'
}, {
  value: 'Republican',
  label: 'Republican'
}, {
  value: 'Independent',
  label: 'Independent'
}]

const MEMBERS = [{
  value: 'rep',
  label: 'Representative'
}, {
  value: 'sen',
  label: 'Senator'
}]

class NewCampaignCall extends Component {
  constructor(props) {
    super(props)
    this.state = {
      campaign: {},
      committees: [],
      districts: [],
      campaignCall: {
        message: '',
        issueLink: '',
        shareLink: '',
        subject: '',
        task: '',
        memberTypes: [],
        parties: [],
        committees: [],
        districts: [],
      },
      confirmationModalIsOpen: false
    }
  }

  static get contextTypes() {
    return { notify: React.PropTypes.func.isRequired }
  }

  componentWillMount = () => {
    API.campaign(this.props.params.id, data => {
      this.setState({
        campaign: data
      })
    })
    API.committees(data => this.setState({ committees: data }))
    API.districts(data => this.setState({ districts: data }))
    this.inputs = {}

    // if a cloneId param was passed, then pre-populate fields based on that campaignAction
    if (this.props.location && this.props.location.query && this.props.location.query.cloneId) {
      API.campaignCall(this.props.location.query.cloneId, data => {
        this.setState({
          campaignCall: data
        })
      })
    }
  }

  onSelectChange = (key, val) => {
    const campaignCall = this.state.campaignCall
    if (Array.isArray(val)) {
      campaignCall[key] = val.map(v => v.value)
    } else {
      campaignCall[key] = val.value
    }
    this.setState({ campaignCall: campaignCall })
  }

  onInputChange = (key, ev) => {
    var campaignCall = this.state.campaignCall
    campaignCall[key] = ev.target.value
    this.setState({ campaignCall: campaignCall })
  }

  onSubmit = (ev) => {
    ev.preventDefault()

    const campaignCall = this.state.campaignCall
    const fieldsToValidate = ['subject', 'message', 'task', 'issueLink', 'shareLink']
    for (let k of fieldsToValidate) {
      if (campaignCall[k] === undefined || campaignCall[k] === null || campaignCall[k] === '') {
        this.context.notify({
          message: `${k} can't be blank`,
          level: 'error'
        })
        return
      }
    }

    this.setState({ confirmationModalIsOpen: true })
  }

  closeConfirmationModal = () => {
    this.setState({ confirmationModalIsOpen: false })
  }

  createCampaignCall = () => {
    this.closeConfirmationModal()

    API.newCampaignCall(
      this.state.campaign.id,
      this.state.campaignCall,
      (campaignCall) => {
        // start the CampaignCall after it has been created (this can be async, we don't need to wait for response)
        API.sendCampaignCall(campaignCall.id)
        this.context.notify({
          message: 'Action created',
          level: 'success',
          autoDismiss: 1,
          // TODO: redirect to CampaignActionDetail page for newly created CampaignAction
          onRemove: () => {
            this.props.router.push(`/${this.state.campaign.id}`)
          }
        })
      })
  }

  focusInput = (input) => {
    this.inputs[input].focus()
  }

  render = () => {
    const committeeOptions = this.state.committees.map(c => ({ value: c._id, label: c.name }))
    const districtOptions = this.state.districts.map(c => ({ value: c, label: c }))

    return (
      <div>
        <div className="meta">
          <h1>New Action</h1>
          <h3>Campaign: <Link to={`/${this.state.campaign.id}`}>{this.state.campaign.title}</Link></h3>
        </div>
        <form onSubmit={this.onSubmit.bind(this)}>
          <fieldset>
            <label>Targeting</label>
            <div>
              <Select
                name="memberTypes"
                placeholder="Member Type"
                value={this.state.campaignCall.memberTypes}
                options={MEMBERS}
                onChange={this.onSelectChange.bind(this, 'memberTypes')}
                clearable={false}
                multi
              />
              <Select
                name="parties"
                placeholder="Party"
                value={this.state.campaignCall.parties}
                options={PARTIES}
                onChange={this.onSelectChange.bind(this, 'parties')}
                clearable={false}
                multi
              />
              <Select
                name="committees"
                placeholder="Committee"
                value={this.state.campaignCall.committees}
                options={committeeOptions}
                onChange={this.onSelectChange.bind(this, 'committees')}
                clearable={false}
                multi
              />
              <Select
                name="districts"
                placeholder="District"
                value={this.state.campaignCall.districts}
                options={districtOptions}
                onChange={this.onSelectChange.bind(this, 'districts')}
                clearable={false}
                multi
              />
            </div>
          </fieldset>
          <fieldset>
            <label>Message</label>
            <textarea
              maxLength="640"
              value={this.state.campaignCall.message}
              onChange={this.onInputChange.bind(this, 'message')}
              ref={(input) => { this.inputs.message = input }} />
          </fieldset>
          <fieldset>
            <label>Issue Link</label>
            <input
              maxLength="640"
              type="text"
              value={this.state.campaignCall.issueLink}
              onChange={this.onInputChange.bind(this, 'issueLink')}
              ref={(input) => { this.inputs.issueLink = input }} />
          </fieldset>
          <fieldset>
            <label>Share Link</label>
            <input
              maxLength="640"
              type="text"
              value={this.state.campaignCall.shareLink}
              onChange={this.onInputChange.bind(this, 'shareLink')}
              ref={(input) => { this.inputs.shareLink = input }} />
          </fieldset>
          <fieldset>
            <label>Subject</label>
            <input
              maxLength="640"
              type="text"
              value={this.state.campaignCall.subject}
              onChange={this.onInputChange.bind(this, 'subject')}
              ref={(input) => { this.inputs.subject = input }} />
          </fieldset>
          <fieldset>
            <label>Task</label>
            <input
              maxLength="640"
              type="text"
              value={this.state.campaignCall.task}
              onChange={this.onInputChange.bind(this, 'task')}
              ref={(input) => { this.inputs.task = input }} />
          </fieldset>
          <input type="submit" value="Send" />
        </form>
        <div className="preview">
          <CampaignCallPreview campaignCall={this.state.campaignCall} focusInput={this.focusInput.bind(this)} />
        </div>
        <Modal
          isOpen={this.state.confirmationModalIsOpen}
          style={CONFIRMATION_MODAL_STYLE}
          contentLabel="Confirm"
        >
          <p style={{ marginBottom: '10px' }}>Are you sure?</p>
          <div>
            <button onClick={this.createCampaignCall} style={{ marginRight: '10px' }}>Yes</button>
            <button onClick={this.closeConfirmationModal}>No</button>
          </div>
        </Modal>
      </div>
    )
  }
}

export { NewCampaignUpdate, NewCampaignCall }
