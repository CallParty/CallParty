function parseAction(a) {
  // TODO
  return a;
}

function parseUserAction(a) {
  // TODO
  return a;
}

function parseCampaign(c) {
  return {
    id: c._id,
    actions: c.campaignActions.map(parseAction),
    description: c.campaign_description,
    title: c.campaign_title,
    userActions: c.userActions.map(parseUserAction)
  };
}

export default {
  action: parseAction,
  userAction: parseUserAction,
  campaign: parseCampaign
};
