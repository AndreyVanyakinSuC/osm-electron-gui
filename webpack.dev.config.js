const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { spawn } = require('child_process');

// Config directories
const MAIN_SRC_DIR = path.resolve(__dirname, 'main-window/src');
const OUTPUT_DIR = path.resolve(__dirname, '/dist');
const CONNECT_SRC_DIR = path.resolve(__dirname, 'connect-window/src');
const CONNECT_OUTPUT_DIR = path.resolve(__dirname, 'connect-window/dist');

// Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
const defaultInclude = [MAIN_SRC_DIR, CONNECT_SRC_DIR];

module.exports = {
  mode: 'development',
  entry: {
    main: path.resolve(__dirname, 'main-window/src/mainIndex.js'),
    connect: path.resolve(__dirname, 'connect-window/src/connectIndex.js')
  },
  resolve: {
    extensions: ['.html', '.js', '.json', '.scss', '.css'],
    alias: {
      leaflet_css: __dirname + '/node_modules/leaflet/dist/leaflet.css',
      leaflet_marker:
        __dirname + '/node_modules/leaflet/dist/images/marker-icon.png',
      leaflet_marker_2x:
        __dirname + '/node_modules/leaflet/dist/images/marker-icon-2x.png',
      leaflet_marker_shadow:
        __dirname + '/node_modules/leaflet/dist/images/marker-shadow.png'
    }
  },
  output: {
    path: OUTPUT_DIR,
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' }
        ],
        include: defaultInclude
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['react']
            }
          }
        ],
        include: defaultInclude
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        loader: 'file-loader?name=img/[name].[ext]'
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader?name=font/[name].[ext]'
      }
    ]
  },
  target: 'electron-renderer',
  plugins: [
    new HtmlWebpackPlugin({
      // inject: false,
      title: 'Система ОАИСКГН',
      chunks: ['main'],
      filename: OUTPUT_DIR + '/mainIndex.html'
    }),
    new HtmlWebpackPlugin({
      // inject: false,
      title: 'Соедниние с сервером',
      chunks: ['connect'],
      filename: OUTPUT_DIR + '/connectIndex.html'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  devtool: 'cheap-source-map',
  devServer: {
    contentBase: OUTPUT_DIR,
    stats: 'minimal',
    before: function() {
      spawn('electron', ['.'], {
        shell: true,
        env: process.env,
        stdio: 'inherit'
      })
        .on('close', code => process.exit(0))
        .on('error', spawnError => console.error(spawnError));
    }
  }
};
