import React from 'react'

function CampaignCallForm(props) {
  const { campaignAction, onInputChange } = props
  return (
    <div>
      <fieldset>
        <label>Message</label>
        <textarea
          maxLength="640"
          value={campaignAction.message}
          onChange={onInputChange.bind(this, 'message')}
        />
      </fieldset>
      <fieldset>
        <label>Issue Link</label>
        <input
          maxLength="640"
          type="text"
          value={campaignAction.issueLink}
          onChange={onInputChange.bind(this, 'issueLink')}
        />
      </fieldset>
      <fieldset>
        <label>Share Link</label>
        <input
          maxLength="640"
          type="text"
          value={campaignAction.shareLink}
          onChange={onInputChange.bind(this, 'shareLink')}
         />
      </fieldset>
      <fieldset>
        <label>Subject</label>
        <input
          maxLength="640"
          type="text"
          value={campaignAction.title}
          onChange={onInputChange.bind(this, 'title')}
        />
      </fieldset>
      <fieldset>
        <label>Task</label>
        <input
          maxLength="640"
          type="text"
          value={campaignAction.task}
          onChange={onInputChange.bind(this, 'task')}
        />
      </fieldset>
    </div>
  )
}

export default CampaignCallForm
