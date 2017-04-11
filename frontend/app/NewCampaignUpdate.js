import React from 'react'
import { NewCampaignAction } from './NewCampaignAction'

const NewCampaignUpdate = (props) => (
  <NewCampaignAction actionType="CampaignUpdate" {...props} />
)

export default NewCampaignUpdate