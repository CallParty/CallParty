import React, { Component } from 'react'
import Header from './components/header'
import './css/custom.css';
import {testFun, getQueryParamsUrl} from './utils/fetch.js';

class App extends Component {

  componentDidMount() {
    fetch(getQueryParamsUrl('/api/test', {'input': 'test input'}), {
      method: 'get',
    }).then(function (response) {
      return response.json();
    }).then(function (j) {
      console.log('++ received message from backend: ' + j.message);
    }).catch(function(err) {
      console.log('++ failed to receive message from backend');
    });
  }

  render() {
    return <Header/>
  }

}

export default App