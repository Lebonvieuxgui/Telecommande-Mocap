const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const WebpackAutoInject = require("webpack-auto-inject-version")

const config = {
  entry: {
    app: path.resolve(__dirname, "../client/client-entry.js"),
    vendor: ["vue", "vue-router", "vuex", "axios"]
  },
  plugins: [
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(),
    new WebpackAutoInject({
      SILENT: false,
      PACKAGE_JSON_PATH: "./package.json",
      PACKAGE_JSON_INDENT: 2,
      components: {
        AutoIncreaseVersion: false
      }
    })
  ],
  module: {
    rules: [
      {
        enforce: "pre",
        test: /(\.js$)|(\.vue$)/,
        loader: "eslint-loader",
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          css: "css-loader",
          scss: "css-loader|sass-loader",
          less: "css-loader|less-loader"
        }
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|svgz)(\?.+)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000
              // name: utils.assetsPath("fonts/[name].[hash:7].[ext]")
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader" // creates style nodes from JS strings
          },
          {
            loader: "css-loader" // translates CSS into CommonJS
          },
          {
            loader: "less-loader" // compiles Less to CSS
          }
        ]
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, "../dist"),
    publicPath: "/",
    filename: "assets/js/[name].js"
  }
};

module.exports = config;
