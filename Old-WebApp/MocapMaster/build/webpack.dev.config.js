const merge = require("webpack-merge");
const common = require("./webpack.common.config.js");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

module.exports = merge(common, {
  mode: "development",
  plugins: [],
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist"
  }
});
