import React from 'react'

function CampaignUpdatePreview(props) {
  const { campaignUpdate } = props
  return (
    <div className="preview">
     <h4>Preview</h4>
     <div className="preview-message">{campaignUpdate.message}</div>
    </div>
  )
}

export default CampaignUpdatePreview
