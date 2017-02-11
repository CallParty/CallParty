import './css/main.sass';
import React from 'react'
import ReactDOM from 'react-dom';
import App from './app/App';
import Raven from 'raven-js'

Raven.config(process.env.SENTRY_FRONTEND_DSN || '').install()
ReactDOM.render(
  <App />,
  document.getElementById('root')
);
