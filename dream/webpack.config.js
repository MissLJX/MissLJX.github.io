var webpack = require('webpack');
var path = require('path');

module.exports = function () {
    return {
        entry: {
            main: './app/index.js',
            vendor: ['moment', 'lodash']
        },
        output: {
            filename: '[chunkhash].[name].js',
            path: path.resolve(__dirname, 'dist')
        },
        plugins: [
            new webpack.optimize.CommonsChunkPlugin({
                names: ['vendor', 'manifest'], // 指定公共 bundle 的名字。
            }),
            new ExtractTextPlugin('bootstrap/dist/css/bootstrap.css')
        ],
        module: {
            rules: [
                {
                    test: /\.css$/,
                    // use: 'css-loader'
                    use: ExtractTextPlugin({
                        use: 'css-loader'
                    })
                },
                // {
                //     test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                //     loader: "url-loader?limit=10000&mimetype=application/font-woff"
                // },
                // {
                //     test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                //     loader: "file-loader"
                // }
            ]
        }
    }
}