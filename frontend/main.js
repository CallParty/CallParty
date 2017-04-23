import './css/main.sass'
import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import App from './app/App'
import Raven from 'raven-js'

Raven.config(process.env.SENTRY_FRONTEND_DSN || '').install()
ReactDOM.render(
  <AppContainer>
    <App />
  </AppContainer>,
  document.getElementById('root')
)

// reference: https://github.com/gaearon/redux-devtools/commit/64f58b7010a1b2a71ad16716eb37ac1031f93915
if (module.hot) {
  /**
   * Warning from React Router, caused by react-hot-loader.
   * The warning can be safely ignored, so filter it from the console.
   * Otherwise you'll see it every time something changes.
   * See https://github.com/gaearon/react-hot-loader/issues/298
   */
  const isString = s => (typeof s === 'string' || s instanceof String)
  /* eslint-disable no-console */
  const orgError = console.error
  console.error = (...args) => {
    if (args && args.length === 1 && isString(args[0]) && args[0].indexOf('You cannot change <Router routes>;') > -1) {
      // React route changed
    } else {
      // Log the error as normally
      orgError.apply(console, args)
    }
  }
  /* eslint:enable no-console */

  module.hot.accept('./app/App', () => {
    const NextApp = require('./app/App').default
    ReactDOM.render(
      <AppContainer>
        <NextApp />
      </AppContainer>,
      document.getElementById('root')
    )
  })
}
