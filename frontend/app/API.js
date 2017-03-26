import { browserHistory } from 'react-router'
import Raven from 'raven-js'

const parse = {
  call: function(c) {
    return {
      id: c._id,
      subject: c.title,
      message: c.message,
      task: c.task,
      issueLink: c.issueLink,
      shareLink: c.shareLink,
      userConversations: (c.userConversations || []).map(parse.userConversation),
      active: c.active,
      type: c.type,
      memberTypes: c.memberTypes,
      parties: c.parties,
      committees: c.committees,
      districts: c.districts,
      createdAt: c.createdAt,
      sentAt: c.sentAt
    }
  },

  update: function(u) {
    return {
      id: u._id,
      message: u.message,
      subject: u.title,
      active: u.active,
      type: u.type,
      createdAt: u.createdAt,
      sentAt: u.sentAt
    }
  },

  action: function(a) {
    return a.type === 'CampaignCall' ? parse.call(a) : parse.update(a)
  },

  userConversation: function(c) {
    // TODO
    return c
  },

  campaign: function(c) {
    return {
      id: c._id,
      actions: (c.campaignActions || []).map(parse.action),
      description: c.description,
      title: c.title,
      createdAt: c.createdAt,
      lastCampaignActionSentAt: c.lastCampaignActionSentAt
    }
  },

  committee: c => c,
  districts: d => d,
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

function get(endpoint, cb = data => data, onErr = Raven.captureException.bind(Raven)) {
  const sessionToken = window.localStorage.getItem('callparty_session_token')

  return fetch(endpoint, {
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

function post(endpoint, data = {}, cb = data => data, onErr = Raven.captureException.bind(Raven)) {
  const sessionToken = window.localStorage.getItem('callparty_session_token')

  return fetch(endpoint, {
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
  campaigns: function(cb = response => response) {
    return get('/api/campaigns').then(data => cb(data.map(parse.campaign)))
  },

  campaign: function(id, cb = response => response) {
    return get(`/api/campaigns/${id}`).then(data => cb(parse.campaign(data)))
  },

  newCampaign: function(data, cb = response => response) {
    return post('/api/campaigns', data).then(data => cb(parse.campaign(data)))
  },

  newCampaignCall: function(id, data, cb = response => response) {
    return post(`/api/campaigns/${id}/call/new`, data).then(data => cb(parse.call(data)))
  },

  sendCampaignCall: function(id) {
    return post(`/api/send/campaignCall/${id}/`)
  },

  sendCampaignUpdate: function(id) {
    return post(`/api/send/campaignUpdate/${id}/`)
  },

  newCampaignUpdate: function(id, data, cb = response => response) {
    return post(`/api/campaigns/${id}/update/new`, data).then(data => cb(parse.update(data)))
  },

  campaignCall: function(id, cb = response => response) {
    return get(`/api/campaign_calls/${id}`).then(data => cb(parse.call(data)))
  },

  campaignAction: function(id, cb = response => response) {
    return get(`/api/campaign_actions/${id}`).then(data => cb(parse.action(data)))
  },

  committees: function(cb = response => response) {
    return get('/api/committees').then(data => cb(parse.committee(data)))
  },

  districts: function(cb = response => response) {
    return get('/api/districts').then(data => cb(parse.districts(data)))
  },

  login: function(username, password, cb, onErr) {
    const encodedCredentials = btoa(`${username}:${password}`)
    return fetch('/api/token', {
      headers: { Authorization: `Basic ${encodedCredentials}` }
    })
    .then(resp => resp.json())
    .then(({ token }) => window.localStorage.setItem('callparty_session_token', token))
    .then(cb)
    .catch(onErr)
  },

  updateReps: function(cb = response => response) {
    return post('/api/representatives/refresh', {}).then(cb)
  },
}
