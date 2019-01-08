var path = require('path');
// var autoprefixer = require('autoprefixer');
// var inlineRtl = require('postcss-inline-rtl');
var rootPath = path.resolve(__dirname, '..');
var sourcePath = path.resolve(rootPath, 'packages');
var distPath = path.resolve(rootPath, 'dist/roosterjs-react/dist');
var webpack = require('webpack');
var param = process.argv[2];

var isProduction = checkParam('-p', '-prod');
var isAmd = checkParam('-amd');
var preserveEnum = checkParam('-e', '-enum');
var skipRooster = checkParam('-s', '-skipRooster', '-skiprooster');
var filename = isAmd ? 'rooster-react-amd' : 'rooster-react';
if (isProduction) {
    filename += '-min';
}
filename += '.js';
var output = {
    filename: filename,
    path: distPath
};
if (isAmd) {
    output.libraryTarget = 'amd';
} else {
    output.library = 'roosterjs';
};

var externalMap = new Map([
    ["react", "react"],
    ["react-dom", "react-dom"],
    ["office-ui-fabric-react", "OfficeFabric"],
    [/^office-ui-fabric-react\/lib\/([^/]+)$/, "OfficeFabric/$1"],
    [/^office-ui-fabric-react\/lib\/components\/([^/]+)$/, "OfficeFabric/components/$1/$1"],
]);

if (skipRooster) {
    externalMap.set(/^roosterjs\-(?!react).*$/, "roosterjs");
}

var webpackConfig = {
    entry: path.resolve(sourcePath, 'roosterjs-react/lib/index.ts'),
    devtool: 'source-map',
    output: output,
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        modules: [
            sourcePath,
            path.resolve(rootPath, 'node_modules')
        ],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    compilerOptions: {
                        declaration: false,
                        preserveConstEnums: false,
                    },
                }
            }
        ]
    },
    externals: function (context, request, callback) {
        for (const [key, value] of externalMap) {
            if (key instanceof RegExp && key.test(request)) {
                return callback(null, request.replace(key, value));
            }
            else if (request === key) {
                return callback(null, value);
            }
        }

        callback();
    },
    stats: 'minimal',
    mode: isProduction ? 'production' : 'development',
    optimization: {
        minimize: isProduction,
    },
};

console.log('Packing file: ' + path.resolve(distPath, filename));
webpack(webpackConfig).run((err, stat) => {
    if (err) {
        console.error(err);
    }
});

function checkParam() {
    var params = process.argv;
    for (var i = 0; i < arguments.length; i++) {
        if (params.indexOf(arguments[i]) >= 0) {
            return true;
        }
    }
    return false;
}
