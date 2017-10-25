module.exports = {
    entry: './web/script/start.tsx',
    devtool: 'source-map',
    output: {
        filename: 'start.js',
        path: __dirname + '/web/script',
        publicPath: '/web/script/',
        sourceMapFilename: '[name].map'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        modules: [
            './lib',
            './node_modules'
        ]
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: 'ts-loader' }
        ]
    },
    watch: true,
    stats: "minimal",
    devServer: {
        host: "0.0.0.0", // This makes the server public so that others can test by http://hostname ...
        port: 3000
    }
}