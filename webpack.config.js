const path = require("path");

module.exports = {
  mode: "production",
  entry: "./lib/axios-helper.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    library: {
      name: "axiosHelper",
      type: "umd",
    },
    clean: true,
  },
  externals: {
    qs: {
      commonjs: "qs",
      commonjs2: "qs",
      amd: "qs",
      root: "QS",
    },
    axios: {
      commonjs: "axios",
      commonjs2: "axios",
      amd: "axios",
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
