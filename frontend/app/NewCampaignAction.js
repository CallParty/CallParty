import API from './helpers/API'
import React, { Component } from 'react'
import Select from 'react-select'
import { Link } from 'react-router'
import Modal from 'react-modal'
import CampaignCallPreview from './CampaignCallPreview'
import CampaignUpdatePreview from './CampaignUpdatePreview'
import CampaignCallForm from './CampaignCallForm'
import CampaignUpdateForm from './CampaignUpdateForm'
import { CONFIRMATION_MODAL_STYLE, PARTIES, MEMBERS } from './helpers/constants'


class NewCampaignAction extends Component {
  constructor(props) {
    super(props)
    this.state = {
      campaign: {},
      committees: [], // list of all possible committees that can be targeted
      districts: [],  // list of all possible districts that can be targeted
      campaignAction: {
        type: this.props.actionType,
        // targeting
        targetingType: 'segmenting',
        memberTypes: [],
        parties: [],
        committees: [],
        districts: [],
      },
      confirmationModalIsOpen: false,
      loading: true,
    }
    if (this.props.actionType === 'CampaignCall') {
        Object.assign(this.state.campaignAction, {
          message: '',
          issueLink: '',
          shareLink: '',
          title: '',
          task: '',
        })
    }
    else if (this.props.actionType === 'CampaignUpdate') {
      Object.assign(this.state.campaignAction, {
        message: '',
      })
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
      API.campaignAction(this.props.location.query.cloneId, data => {
        this.setState({
          campaignAction: data
        })
      })
    }
  }

  onSelectChange = (key, val) => {
    const campaignAction = this.state.campaignAction
    if (Array.isArray(val)) {
      campaignAction[key] = val.map(v => v.value)
    } else {
      campaignAction[key] = val.value
    }
    this.setState({ campaignAction: campaignAction })
  }

  onInputChange = (key, ev) => {
    var campaignAction = this.state.campaignAction
    campaignAction[key] = ev.target.value
    this.setState({ campaignAction: campaignAction })
  }

  onSubmit = (ev) => {
    ev.preventDefault()

    const campaignAction = this.state.campaignAction
    let fieldsToValidate = []
    if (this.props.actionType === 'CampaignCall') {
      fieldsToValidate = ['title', 'message', 'task', 'issueLink', 'shareLink']
    }
    else if (this.props.actionType=== 'CampaignUpdate') {
      fieldsToValidate = ['message']
    }
    else {
      throw new Error('Invalid action type')
    }
    for (let k of fieldsToValidate) {
      if (campaignAction[k] === undefined || campaignAction[k] === null || campaignAction[k] === '') {
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

  createCampaignAction = () => {
    this.closeConfirmationModal()

    API.newCampaignAction(
      this.state.campaign.id,
      this.state.campaignAction,
      (campaignAction) => {
        this.context.notify({
          message: 'Action created',
          level: 'success',
          autoDismiss: 1,
          // redirect to CampaignActionDetail page for newly created CampaignAction
          onRemove: () => {
            this.props.router.push(`/${this.state.campaign.id}/actions/${campaignAction.id}`)
          }
        })
      })
  }

  focusInput = (input) => {
    this.inputs[input].focus()
  }

  getActionPreview = () => {
    if (this.props.actionType === 'CampaignCall') {
      return <CampaignCallPreview campaignCall={this.state.campaignAction} focusInput={this.focusInput.bind(this)} />
    }
    else if (this.props.actionType === 'CampaignUpdate') {
      return <CampaignUpdatePreview campaignUpdate={this.state.campaignAction} />
    }
    else {
      return null
    }
  }

  getActionForm = () => {
    if (this.props.actionType === 'CampaignCall') {
      return <CampaignCallForm
        campaignAction={this.state.campaignAction}
        onInputChange={this.onInputChange}
      />
    }
    else if (this.props.actionType === 'CampaignUpdate') {
      return <CampaignUpdateForm campaignAction={this.state.campaignAction} onInputChange={this.onInputChange} />
    }
    else {
      return null
    }
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
                value={this.state.campaignAction.memberTypes}
                options={MEMBERS}
                onChange={this.onSelectChange.bind(this, 'memberTypes')}
                clearable={false}
                multi
              />
              <Select
                name="parties"
                placeholder="Party"
                value={this.state.campaignAction.parties}
                options={PARTIES}
                onChange={this.onSelectChange.bind(this, 'parties')}
                clearable={false}
                multi
              />
              <Select
                name="committees"
                placeholder="Committee"
                value={this.state.campaignAction.committees}
                options={committeeOptions}
                onChange={this.onSelectChange.bind(this, 'committees')}
                clearable={false}
                multi
              />
              <Select
                name="districts"
                placeholder="District"
                value={this.state.campaignAction.districts}
                options={districtOptions}
                onChange={this.onSelectChange.bind(this, 'districts')}
                clearable={false}
                multi
              />
            </div>
          </fieldset>

          <div>
            { this.getActionForm() }
          </div>

          <input type="submit" value="Create" />
        </form>
        <div className="preview">
          { this.getActionPreview() }
        </div>
        <Modal
          isOpen={this.state.confirmationModalIsOpen}
          style={CONFIRMATION_MODAL_STYLE}
          contentLabel="Confirm"
        >
          <p style={{ marginBottom: '10px' }}>Are you sure?</p>
          <div>
            <button onClick={this.createCampaignAction} style={{ marginRight: '10px' }}>Yes</button>
            <button onClick={this.closeConfirmationModal}>No</button>
          </div>
        </Modal>
      </div>
    )
  }
}

export { NewCampaignAction }