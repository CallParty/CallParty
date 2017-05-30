import { browserHistory } from 'react-router'
import Raven from 'raven-js'

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
    return get('/api/campaigns').then(data => cb(data))
  },

  campaign: function(id, cb = response => response) {
    return get(`/api/campaigns/${id}`).then(data => cb(data))
  },

  newCampaign: function(data, cb = response => response) {
    return post('/api/campaigns', data).then(data => cb(data))
  },

  updatePassword: function(data, cb = response => response) {
    return post('/api/updatePassword', data).then(data => cb(data))
  },

  newCampaignCall: function(id, data, cb = response => response) {
    return post(`/api/campaigns/${id}/call/new`, data).then(data => cb(data))
  },

  sendCampaignCall: function(id) {
    return post(`/api/send/campaignCall/${id}/`)
  },

  sendCampaignUpdate: function(id) {
    return post(`/api/send/campaignUpdate/${id}/`)
  },

  newCampaignAction: function(id, data, cb = response => response) {
    return post(`/api/campaigns/${id}/action/new`, data).then(data => cb(data))
  },

  newCampaignUpdate: function(id, data, cb = response => response) {
    return post(`/api/campaigns/${id}/update/new`, data).then(data => cb(data))
  },

  campaignAction: function(id, cb = response => response) {
    return get(`/api/campaign_actions/${id}`).then(data => cb(data))
  },

  getClonedAction: function(id, cb = response => response) {
    return get(`/api/clone_action/${id}`).then(data => cb(data))
  },

  committees: function(cb = response => response) {
    return get('/api/committees').then(data => cb(data))
  },

  getCurrentAdmin: function(cb = response => response) {
    return get('/api/currentAdmin').then(data => cb(data))
  },

  districts: function(cb = response => response) {
    return get('/api/districts').then(data => cb(data))
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
