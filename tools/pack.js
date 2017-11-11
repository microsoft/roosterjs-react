var exec = require('child_process').execSync;
var path = require('path');
var autoprefixer = require('autoprefixer');
var inlineRtl = require('postcss-inline-rtl');
var rootPath = path.resolve(__dirname, '..');
var sourcePath = rootPath;
var distPath = path.resolve(rootPath, 'dist');
var webpack = require('webpack');
var param = process.argv[2];
var isProduction = param == '-p';
var webpackConfig = {
    entry: path.resolve(sourcePath, 'lib/index.ts'),
    devtool: 'source-map',
    output: {
        library: 'roosterjs',
        filename: 'rooster-react.js',
        path: distPath
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.svg', '.scss'],
        modules: [ sourcePath, path.resolve(sourcePath, 'node_modules') ],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    compilerOptions: {
                        declaration: false,
                        preserveConstEnums: false
                    },
                }
            },
            {
                test: /\.svg$/,
                loader: 'url-loader',
                options: {
                    mimetype: 'image/svg+xml'                        
                }
            },
            {
                test: /\.scss$/,
                use: [
                    '@microsoft/loader-load-themed-styles',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: loader => [
                                autoprefixer({browsers: 'last 2 versions'}),
                                inlineRtl,
                            ]
                        }
                    },
                    'sass-loader'
                ]
            }
        ]
    },
    // externals: {
    //     "react": "React",
    //     "react-dom": "ReactDom",
    // },
    stats: 'minimal',
    plugins: isProduction ? [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                dead_code: true,
                warnings: true,
                screw_ie8: true,
                drop_debugger: true,
                drop_console: true,
                unsafe: false,
            },
        })
    ] : []
};

console.log('Packing file: ' + path.resolve(distPath, 'rooster.js'));
webpack(webpackConfig).run((err, stat) => {
    if (err) {
        console.error(err);
    } else {
        exec('node ./dts.js', {
            stdio: 'inherit',
            cwd: __dirname
        });
    }
});
