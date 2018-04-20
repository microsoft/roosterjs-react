module.exports = {
    entry: {
        'sample': './sample/script/sample.tsx',
        'FocusOutShellSample': './sample/script/FocusOutShellSample'
    },
    devtool: 'source-map',
    output: {
        filename: '[name].js',
        path: __dirname + '/sample/script',
        publicPath: '/sample/script/',
        sourceMapFilename: '[name].map'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.svg', '.'],
        modules: [
            './packages',
            './node_modules'
        ]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            },
            {
                test: /\.svg$/,
                loader: 'url-loader',
                options: {
                    mimetype: 'image/svg+xml'
                }
            },
            // {
            //     test: /\.scss$/,
            //     use: [
            //         '@microsoft/loader-load-themed-styles',
            //         {
            //             loader: 'css-loader',
            //             options: {
            //                 modules: true,
            //             }
            //         },
            //         {
            //             loader: 'postcss-loader',
            //             options: {
            //                 plugins: loader => [
            //                     autoprefixer({ browsers: 'last 2 versions' }),
            //                     inlineRtl,
            //                 ]
            //             }
            //         },
            //         'sass-loader'
            //     ]
            // }
        ]
    },
    watch: true,
    stats: "minimal",
    devServer: {
        host: "0.0.0.0", // This makes the server public so that others can test by http://hostname ...
        port: 3003,
        open: true,
        openPage: "sample",
        public: "localhost:3003"
    }
}