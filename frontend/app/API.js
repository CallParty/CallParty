import { browserHistory } from 'react-router'

const parse = {
  action: function(a) {
    return {
      id: a._id,
      subject: a.title,
      message: a.message,
      cta: a.cta,
      userActions: (a.userActions || []).map(parse.userAction),
      active: a.active,
      type: a.type,
      memberTypes: a.memberTypes,
      parties: a.parties,
      committees: a.committees,
      createdAt: a.createdAt
    }
  },

  userAction: function(a) {
    // TODO
    return a
  },

  campaign: function(c) {
    return {
      id: c._id,
      actions: (c.campaignActions || []).map(parse.action),
      description: c.description,
      title: c.title,
      createdAt: c.createdAt
    }
  },

  committee: c => c
}

function redirectToLogin() {
  window.localStorage.removeItem('callparty_session_token')
  browserHistory.push({
    pathname: '/login',
    state: {
      unauthorized: true
    }
  })
}

function get(endpoint, cb = () => {}, onErr = () => {}) {
  const sessionToken = window.localStorage.getItem('callparty_session_token')

  fetch(endpoint, {
    headers: { Authorization: `Bearer ${sessionToken}` }
  })
  .then(resp => {
    if (resp.status === 401) {
      throw new Error('unauthorized')
    }
    return resp
  })
  .then(resp => resp.json())
  .then(cb)
  .catch(err => {
    if (err.message === 'unauthorized') {
      redirectToLogin()
      return
    }
    onErr(err)
  })
}

function post(endpoint, data = {}, cb = () => {}, onErr = () => {}) {
  const sessionToken = window.localStorage.getItem('callparty_session_token')

  fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'post',
    body: JSON.stringify(data)
  })
  .then(resp => {
    if (resp.status === 401) {
      throw new Error('unauthorized')
    }
    return resp
  })
  .then(resp => resp.json())
  .then(cb)
  .catch(err => {
    if (err.message === 'unauthorized') {
      redirectToLogin()
      return
    }
    onErr(err)
  })
}

export default {
  campaigns: function(cb) {
    get('/api/campaigns', data => {
      cb(data.map(parse.campaign))
    })
  },

  campaign: function(id, cb) {
    get(`/api/campaigns/${id}`, data => {
      cb(parse.campaign(data))
    })
  },

  newCampaign: function(data, cb) {
    post('/api/campaigns', data, data => {
      cb(parse.campaign(data))
    })
  },

  newCampaignAction: function(id, data, cb) {
    post(`/api/campaigns/${id}/action/new`, data, data => {
      cb(parse.campaign(data))
    })
  },

  newCampaignUpdate: function(id, data, cb) {
    post(`/api/campaigns/${id}/update/new`, data, data => {
      cb(parse.campaign(data))
    })
  },

  committees: function(cb) {
    get('/api/committees', data => {
      cb(parse.committee(data))
    })
  },

  login: function(username, password, cb, onErr) {
    const encodedCredentials = btoa(`${username}:${password}`)
    fetch('/api/token', {
      headers: { Authorization: `Basic ${encodedCredentials}` }
    })
    .then(resp => resp.json())
    .then(({ token }) => window.localStorage.setItem('callparty_session_token', token))
    .then(cb)
    .catch(onErr)
  },

  updateReps: function(cb) {
    console.log(`update reps`)
    post(`/api/representatives/refresh`)
  },
}
