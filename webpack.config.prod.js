const path = require('path');
const CleanPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/app.ts',
    devServer: {
        static: [
            {
                directory: path.join(__dirname),
            }
        ]
    },
    //path to produced file
    output: {
        filename: 'bundle.js',
        // path is to an absolute path to dist folder
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                // chemk for files that end in .ts
                test: /\.ts$/,
                // use ts-loader to deal with found .ts files
                use: 'ts-loader',
                exclude: /node-modules/,
            }
        ]
    },
    resolve: {
        // find these types of files and bundle them together
        extensions: ['.ts', '.js']
    },
    plugins: [
        //use to clear output folder before writing to it again
        new CleanPlugin.CleanWebpackPlugin()
    ]
};