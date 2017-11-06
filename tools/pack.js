var exec = require('child_process').execSync;
var path = require('path');
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
        extensions: ['.ts', '.tsx', '.js'],
        modules: [ sourcePath, path.resolve(sourcePath, 'node_modules') ],
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            options: {
                compilerOptions: {
                    declaration: false,
                    preserveConstEnums: false
                },
            }
        }]
    },
    externals: {
        "react": "React"
    },
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
    }
});

// exec('node ./dts.js', {
//     stdio: 'inherit',
//     cwd: __dirname
// });