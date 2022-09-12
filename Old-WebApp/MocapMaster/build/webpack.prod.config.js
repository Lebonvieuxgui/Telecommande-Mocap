const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.client.config.js");
const CompressionPlugin = require("compression-webpack-plugin");
const Visualizer = require("webpack-visualizer-plugin");

module.exports = merge(common, {
  devtool: "cheap-module-source-map",
  mode: "production",
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": "\"production\""
    }),
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0
    }),
    new Visualizer()
  ]
});
