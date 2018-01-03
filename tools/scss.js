const glob = require('glob');
const path = require('path');

var scssPath = path.resolve(__dirname, '..', 'packages/**/*.scss');
const files = glob.sync(scssPath);

const sass = require('node-sass');
const fs = require('fs');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer')({ browsers: ['> 1%', 'last 2 versions', 'ie >= 11'] });
const modules = require('postcss-modules')({
    getJSON,
    generateScopedName
  });
const _fileNameToClassMap = {};

files.forEach(function(fileName) {
    fileName = path.resolve(fileName);

    sass.render(
        {
            file: fileName,
            outputStyle: 'compressed',
        },
        (err, result) => {
            if (!err) {
                var css = result.css.toString();

                postcss([autoprefixer, modules])
                    .process(css, { from: fileName })
                    .then(result => {
                        var ts = createTypeScriptModule(fileName, result.css)
                        fs.writeFileSync(fileName + '.g.ts', ts);
                    });
            }
        }
    );    
});

function createTypeScriptModule(fileName, css) {
    const { splitStyles } = require("@microsoft/load-themed-styles");

    // Create a source file.
    const source = [
      `/* tslint:disable */`,
      `import { loadStyles } from \'@microsoft/load-themed-styles\';`,
      `loadStyles(${JSON.stringify(splitStyles(css))});`
    ];

    const map = _fileNameToClassMap[fileName];

    for (let prop in map) {
      source.push(`export const ${prop} = "${map[prop]}";`);
    }

    return source.join('\n');
}


function getJSON(cssFileName, json) {
    _fileNameToClassMap[path.resolve(cssFileName)] = json;
}

function generateScopedName(name, fileName, css) {
    const crypto = require('crypto');
    return name + '_' + crypto.createHmac('sha1', fileName).update(css).digest('hex').substring(0, 8);
}
