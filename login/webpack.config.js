const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

module.exports = {
  entry: './src/index.js',
  output: {
    // 'auto' is critical for a remote. Its chunks are loaded relative to remoteEntry.js,
    // not relative to the page that hosts it. Otherwise the container would look for them on its own domain.
    publicPath: 'auto',
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: { extensions: ['.js', '.jsx'] },
  devServer: {
    port: 3001,
    // The container runs on another port (another origin), so the browser needs CORS to load our scripts.
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: { presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'automatic' }]] },
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      // Must match the key in the container's remotes.json, because remoteEntry.js registers itself as window.login.
      name: 'login',
      // The small manifest the container downloads first. Its name never changes, unlike hashed chunks.
      filename: 'remoteEntry.js',
      // The public API of this micro frontend. Everything else stays private.
      exposes: { './mount': './src/mount.jsx' },
      // Same list as the container. When loaded inside the container we reuse its React.
      // When opened standalone (localhost:3001) we fall back to our own bundled copy.
      shared: {
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
        '@faker-js/faker/locale/en': { singleton: true, requiredVersion: deps['@faker-js/faker'] },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
};
