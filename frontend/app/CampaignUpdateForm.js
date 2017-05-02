import React from 'react'

function CampaignUpdateForm(props) {
  const { campaignAction, onInputChange } = props
  return (
    <div>
      <fieldset>
        <label>Label</label>
        <input
          maxLength="640"
          type="text"
          value={campaignAction.label}
          onChange={onInputChange.bind(this, 'label')}
        />
      </fieldset>
      <fieldset>
        <label>Message</label>
        <textarea
          maxLength="640"
          value={campaignAction.message}
          placeholder="Hello this is an update!"
          onChange={onInputChange.bind(this, 'message')}
        />
      </fieldset>
    </div>
  )
}

export default CampaignUpdateForm
