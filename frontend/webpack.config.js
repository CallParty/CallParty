var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')


const params = {}
if (process.env.BUILD_ENV === 'production') {
    params.BUILD_DIR = path.resolve(__dirname, 'build/prod')
    params.SENTRY_FRONTEND_DSN = 'https://994a895dccec491d92bf5f99a9bd349f@sentry.io/135819'
}
else {
    params.BUILD_DIR = path.resolve(__dirname, 'build/staging')
    params.SENTRY_FRONTEND_DSN = 'https://4bac552fe9ba4a62a1cc7dffed3ac1d9@sentry.io/138146'
}

module.exports = {
  entry: ['react-hot-loader/patch', 'whatwg-fetch', './main'],
  output: {
    path: params.BUILD_DIR,
    filename: 'bundle.js',
    publicPath: '/build/'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /\.sass$/,
        loader: ExtractTextPlugin.extract('css!sass')
      },
      {
        test: /\.json$/,
        loaders: ['json']
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('css/style.css'),
    new webpack.DefinePlugin({
      'process.env.SENTRY_FRONTEND_DSN ': params.SENTRY_FRONTEND_DSN,
    }),
  ],
  resolve: {
    extensions: ['', '.js', '.sass'],
    modulesDirectories: ['node_modules']
  },
  devServer: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        secure: false
      },
      '/socket.io': {
        target: 'ws://localhost:8081',
        ws: true,
        secure: false
      }
    }
  }
}
