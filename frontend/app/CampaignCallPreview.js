import React from 'react'

function CampaignCallPreview(props) {
  const { campaignCall, focusInput } = props
  return (
    <div className="campaign-call-preview">
      <h4>Preview</h4>
      <div className="preview-message">
        <div>
          <p>Hi <span className="user-var">[firstName]</span>! We’ve got an issue to call about.</p>
          <p><span className="action-var" onClick={() => focusInput('message')}>{campaignCall.message}</span>. You can find out more about the issue here: <span className="action-var" onClick={() => focusInput('issueLink')}>{campaignCall.issueLink}</span>.</p>
          <p>You’ll be calling <span className="user-var">[repType]</span> <span className="user-var">[repName]</span>. When you call you’ll talk to a staff member, or you’ll leave a voicemail. Let them know:</p>
          <p>* You’re a constituent calling about <span className="action-var" onClick={() => focusInput('subject')}>{campaignCall.subject}</span>.</p>
          <p>* The call to action: “I’d like <span className="user-var">[repType]</span> <span className="user-var">[repName]</span> to <span className="action-var" onClick={() => focusInput('task')}>{campaignCall.task}</span>.”</p>
          <p>* Share any personal feelings or stories</p>
          <p>* If taking the wrong stance on this issue would endanger your vote, let them know.</p>
          <p>* Answer any questions the staffer has, and be friendly!</p>
        </div>
      </div>
    </div>
  )
}

CampaignCallPreview.defaultProps = { focusInput: () => {} }

export default CampaignCallPreview
