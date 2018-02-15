import React from 'react'

function CampaignCallForm(props) {
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
          onChange={onInputChange.bind(this, 'message')}
        />
      </fieldset>
      <fieldset>
        <label>Issue Link &mdash; You can find out more about the issue here</label>
        <input
          maxLength="640"
          type="text"
          value={campaignAction.issueLink}
          onChange={onInputChange.bind(this, 'issueLink')}
        />
      </fieldset>
      <fieldset>
        <label>Subject &mdash; You're a constituent calling about</label>
        <input
          maxLength="640"
          type="text"
          value={campaignAction.subject}
          onChange={onInputChange.bind(this, 'subject')}
        />
      </fieldset>
      <fieldset>
        <label>Task &mdash; I’d like [repType] [repName] to...</label>
        <input
          maxLength="640"
          type="text"
          value={campaignAction.task}
          onChange={onInputChange.bind(this, 'task')}
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
    </div>
  )
}

export default CampaignCallForm
