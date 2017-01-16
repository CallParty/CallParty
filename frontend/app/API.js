import Parse from './Parse';

const API_URL = 'http://localhost:8081';

function get(endpoint, cb, onErr) {
  fetch(`${API_URL}${endpoint}`)
    .then(cb)
    .catch(onErr);
}

function post(endpoint, data, cb, onErr) {
  fetch(`${API_URL}/${endpoint}`, {
      method: 'post',
      body: JSON.stringify(data)
    })
    .then(cb)
    .catch(onErr);
}

export default {
  campaigns: function(cb) {
    get('/campaigns', resp => {
      resp.json().then(data => {
        cb(data.map(Parse.campaign));
      });
    });
  },

  campaign: function(id, cb) {
    get(`/campaigns/${id}`, resp => {
      resp.json().then(data => {
        cb(Parse.campaign(data));
      });
    });
  }
};
