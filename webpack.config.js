const HtmlWebpackPlugin = require("html-webpack-plugin");
const ThreadsPlugin = require('threads-plugin');

module.exports = {
    entry: "./src/index.ts",
    resolve: {
        extensions: [".ts", ".js", ".json"]
    },
    module: {
        rules: [{
            test: /\.ts?$/, loader: "ts-loader",
            options: {
                compilerOptions: {
                    module: "esnext"
                }
            }
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Voxel Octree",
        }),
        new ThreadsPlugin({path: "/"})
    ]
};