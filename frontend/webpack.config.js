var path = require('path')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

var BUILD_DIR = path.resolve(__dirname, 'build')

module.exports = {
  entry: './main',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js',
    publicPath: 'build'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
        query: {
          presets: ['es2015', 'stage-2', 'react']
        }
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
    new ExtractTextPlugin('css/style.css')
  ],
  resolve: {
    extensions: ['', '.js', '.sass'],
    modulesDirectories: ['node_modules']
  },
  devServer: {
    historyApiFallback: true
  }
}
