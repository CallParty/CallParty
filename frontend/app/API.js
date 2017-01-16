const API_URL = 'http://localhost:8081';
const parse = {
  action: function(a) {
    return {
      id: a._id,
      subject: a.campaignaction_title,
      message: a.campaignaction_message,
      cta: a.campaignaction_cta,
      users: a.campaignaction_users,
      active: a.active,
      type: a.campaignaction_type
    };
  },

  userAction: function(a) {
    // TODO
    return a;
  },

  campaign: function(c) {
    var c = {
      id: c._id,
      actions: c.campaignActions.map(parse.action),
      description: c.campaign_description,
      title: c.campaign_title,
      userActions: c.userActions.map(parse.userAction)
    };
    return c;
  }
}

function get(endpoint, cb, onErr) {
  fetch(`${API_URL}${endpoint}`)
    .then(resp => resp.json())
    .then(cb)
    .catch(onErr);
}

function post(endpoint, data, cb, onErr) {
  fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify(data)
    })
    .then(resp => resp.json())
    .then(cb)
    .catch(onErr);
}

export default {
  campaigns: function(cb) {
    get('/campaigns', data => {
      cb(data.map(parse.campaign));
    });
  },

  campaign: function(id, cb) {
    get(`/campaigns/${id}`, data => {
      cb(parse.campaign(data));
    });
  },

  newCampaign: function(data, cb) {
    post('/campaigns', data, data => {
      cb(parse.campaign(data));
    });
  },

  newCampaignAction: function(id, data, cb) {
    post(`/campaigns/${id}/action/new`, data, data => {
      cb(parse.campaign(data));
    });
  }
};
