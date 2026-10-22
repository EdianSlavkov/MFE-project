const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');
const { ModuleFederationPlugin } = require('webpack').container;
const { VueLoaderPlugin } = require('vue-loader');
const deps = require('./package.json').dependencies;

module.exports = {
  entry: './src/index.js',
  output: {
    // Chunks are resolved relative to remoteEntry.js, so the cart works from any host or sub folder.
    publicPath: 'auto',
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: { extensions: ['.js', '.vue'] },
  devServer: {
    port: 3002,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  module: {
    rules: [
      // vue-loader compiles .vue single file components. This is the only Vue specific build piece.
      { test: /\.vue$/, loader: 'vue-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    // Vue's recommended compile time flags. They also silence a console warning about missing flags.
    new DefinePlugin({
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    }),
    new ModuleFederationPlugin({
      name: 'cart',
      filename: 'remoteEntry.js',
      exposes: { './mount': './src/mount.js' },
      // The container has no Vue, so here Vue is loaded from the cart itself.
      // Declaring it shared still matters: if a second Vue remote is added later, both use one Vue copy.
      shared: {
        vue: { singleton: true, requiredVersion: deps.vue },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
};
