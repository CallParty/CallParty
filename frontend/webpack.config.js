var path = require('path')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var Dotenv = require('dotenv-webpack')

var BUILD_DIR = path.resolve(__dirname, 'build')

module.exports = {
  entry: ['react-hot-loader/patch', 'whatwg-fetch', './main'],
  output: {
    path: BUILD_DIR,
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
    new Dotenv({
      'path': '../backend/.env'
    })
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
      }
    }
  }
}
