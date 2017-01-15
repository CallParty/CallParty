const API_URL = 'http://localhost:8081';

function get(endpoint, cb, onErr) {
  return fetch(`${API_URL}${endpoint}`)
    .then(cb)
    .catch(onErr);
}

function post(endpoint, data, cb, onErr) {
  return fetch(`${API_URL}/${endpoint}`, {
      method: 'post',
      body: JSON.stringify(data)
    })
    .then(cb)
    .catch(onErr);
}

export default {
  get: get,
  post: post
};
