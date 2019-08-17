const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./src/index.ts",
    resolve: {
        extensions: [".ts", ".js", ".json"]
    },
    output: {
        filename: "[name].js",
        chunkFilename: "[name].js"
    },
    module: {
        rules: [
            { test: /\.ts?$/, loader: "ts-loader", options: { transpileOnly: true } }
        ]
    },
    optimization: {
        splitChunks: {
            chunks: "all"
        }
    },
    plugins: [
        new HtmlWebpackPlugin()
    ]
};