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

var externals = {
    "react": "react",
    "react-dom": "react-dom",
    "office-ui-fabric-react": "OfficeFabric",
    "office-ui-fabric-react/lib/Button": "OfficeFabric/Button",
    "office-ui-fabric-react/lib/Callout": "OfficeFabric/Callout",
    "office-ui-fabric-react/lib/CommandBar": "OfficeFabric/CommandBar",
    "office-ui-fabric-react/lib/ContextualMenu": "OfficeFabric/ContextualMenu",
    "office-ui-fabric-react/lib/Dialog": "OfficeFabric/Dialog",
    "office-ui-fabric-react/lib/FocusZone": "OfficeFabric/FocusZone",
    "office-ui-fabric-react/lib/Image": "OfficeFabric/Image",
    "office-ui-fabric-react/lib/components/Button": "OfficeFabric/components/Button/Button",
    "office-ui-fabric-react/lib/components/Callout": "OfficeFabric/components/Callout/Callout",
    "office-ui-fabric-react/lib/components/CommandBar": "OfficeFabric/components/CommandBar/CommandBar",
    "office-ui-fabric-react/lib/components/ContextualMenu": "OfficeFabric/components/ContextualMenu/ContextualMenu",
    "office-ui-fabric-react/lib/components/Dialog": "OfficeFabric/components/Dialog/Dialog",
    "office-ui-fabric-react/lib/components/FocusZone": "OfficeFabric/components/FocusZone/FocusZone",
    "office-ui-fabric-react/lib/components/Image": "OfficeFabric/components/Image/Image"
};

if (skipRooster) {
    externals["roosterjs-plugin-image-resize"] = "roosterjs";
    externals["roosterjs-editor-plugins"] = "roosterjs";
    externals["roosterjs-editor-api"] = "roosterjs";
    externals["roosterjs-editor-core"] = "roosterjs";
    externals["roosterjs-editor-dom"] = "roosterjs";
    externals["roosterjs-editor-types"] = "roosterjs";
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
    externals: externals,
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
