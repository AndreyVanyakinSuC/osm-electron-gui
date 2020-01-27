const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Config directories
const MAIN_SRC_DIR = path.resolve(__dirname, 'main-window/');
const CONNECT_SRC_DIR = path.resolve(__dirname, 'connect-window/');
const MAPSETTINGS_SRC_DIR = path.resolve(__dirname, 'map-window/');
const ADVANCED_SRC_DIR = path.resolve(__dirname, 'advanced-window/');
const ELECTRON_SRC_DIR = path.resolve(__dirname, 'Electron/');
const OUTPUT_DIR = path.resolve(__dirname, 'dist/');

// Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
const defaultInclude = [
  MAIN_SRC_DIR,
  CONNECT_SRC_DIR,
  MAPSETTINGS_SRC_DIR,
  ADVANCED_SRC_DIR
];

module.exports = {
  mode: 'production',
  node: {
    __dirname: false,
    __filename: false
  },
  entry: {
    main: ELECTRON_SRC_DIR + '/index.js',
    bigWindow: MAIN_SRC_DIR + '/mainIndex.js',
    connectWindow: CONNECT_SRC_DIR + '/connectIndex.js',
    map: MAPSETTINGS_SRC_DIR + '/mapSettingsIndex.js',
    advanced: ADVANCED_SRC_DIR + '/advancedIndex.js'
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
    publicPath: './',
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
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
      },
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'babel-loader',

            options: {
              presets: ['@babel/react'],
              plugins: ['@babel/plugin-proposal-class-properties']
            }
          }
        ],
        exclude: '/node_modules/',
        include: defaultInclude
      },
      {
        test: /\.(jpe?g|png|gif|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'img',
              name: '[name].[ext]'
            }
          }
        ]
        // loader: 'file-loader?name=img/[name].[ext]'
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'fonts',
              name: '[name].[ext]'
            }
          }
        ]
      }
    ]
  },
  target: 'electron-main',
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '/static'),
        to: path.join(__dirname, '/dist'),
        ignore: ['.*']
      }
    ]),
    new HtmlWebpackPlugin({
      // inject: false,
      title: 'Система ОАИСКГН',
      chunks: ['bigWindow'],
      filename: OUTPUT_DIR + '/mainIndex.html'
    }),
    new HtmlWebpackPlugin({
      // inject: false,
      title: 'Соедниние с сервером',
      chunks: ['connectWindow'],
      filename: OUTPUT_DIR + '/connectIndex.html'
    }),
    new HtmlWebpackPlugin({
      // inject: false,
      title: 'Настройки',
      chunks: ['map'],
      filename: OUTPUT_DIR + '/mapIndex.html'
    }),
    new HtmlWebpackPlugin({
      // inject: false,
      title: 'Расширенные настройки',
      chunks: ['advanced'],
      filename: OUTPUT_DIR + '/advancedIndex.html'
    })
  ],
  stats: {
    colors: true,
    children: false,
    chunks: false,
    modules: false
  }
};
