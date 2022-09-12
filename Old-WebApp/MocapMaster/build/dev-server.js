const webpack = require("webpack");
const clientConfig = require("./webpack.dev.config");

module.exports = function setupDevServer(app) {
  clientConfig.entry.app = [
    "webpack-hot-middleware/client",
    clientConfig.entry.app
  ];
  clientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  );

  const clientCompiler = webpack(clientConfig);

  app.use(
    require("webpack-dev-middleware")(clientCompiler, {
      stats: {
        colors: true,
        hash: false,
        version: false,
        timings: false,
        assets: false,
        chunks: false,
        modules: false,
        reasons: false,
        children: false,
        source: false,
        errors: true,
        errorDetails: true,
        warnings: true,
        publicPath: false
      }
      // stats: "errors-only"
    })
  );
  app.use(require("webpack-hot-middleware")(clientCompiler));
};
