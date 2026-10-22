const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

module.exports = {
  entry: './src/index.js',
  output: {
    // 'auto' makes webpack figure out the base URL at runtime from where the script was loaded.
    // That is why the same build works on localhost, on GitHub Pages in a sub folder or on any other host.
    publicPath: 'auto',
    // Content hashes let browsers cache chunks forever. A new deploy produces new file names.
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: { extensions: ['.js', '.jsx'] },
  devServer: { port: 3000, static: './public' },
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
      name: 'container',
      // No static "remotes" here on purpose. The container reads their URLs at runtime from remotes.json
      // (see src/federation/loadRemote.js), so moving a remote to another host needs no rebuild.
      remotes: {},
      // "shared" is the heart of dependency sharing. Every app declares the same libraries here and
      // webpack negotiates at runtime so each library is downloaded only once for the whole page.
      shared: {
        // singleton: true means there must be exactly one copy. React breaks (hooks errors) with two copies.
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
        // Not a framework, but shared too. It shows that any heavy library can be loaded once.
        // We share the English only entry, because the root entry bundles every locale (about 3 MB).
        '@faker-js/faker/locale/en': { singleton: true, requiredVersion: deps['@faker-js/faker'] },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    // Ships remotes.json next to index.html. CI overwrites it with the production URLs.
    new CopyWebpackPlugin({ patterns: ['public/remotes.json'] }),
  ],
};
