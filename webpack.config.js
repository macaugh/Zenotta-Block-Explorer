const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  watch: true,
  entry: ['./src/index.tsx'],
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        /** CSS Stylesheets Loader */
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: {
              localIdentName: '[name]__[local]___[hash:base64:5]'
            }
          }
        }],
      },
      {
        /** SASS & SCSS Loader */
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: '[name]__[local]___[hash:base64:5]'
              }
            }
          },
          'sass-loader'
        ],
      },
      {
        /** Fonts / File Loader */
        test: /\.(eot|otf|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'fonts',
            },
          },
        ],
      },
      {
        /** Images (URL) Loader */
        test: /\.(gif|jpe?g|tiff|png|webp|bmp|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
            },
          },
        ],
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: `${__dirname}/public`,
    publicPath: '/',
    filename: 'app.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: true,
    }),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
    liveReload: true,
    port: 9000,
    historyApiFallback: true,
    writeToDisk: true,
  },
};
