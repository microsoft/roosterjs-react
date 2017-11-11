var fs = require('fs');
var path = require('path');
var glob = require('glob');
var copy = require('./copy');

var outputPath = path.resolve(__dirname, '../dist');
var cwd = process.cwd();

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
}

let copyFn = (f) => {
    var outfile = path.join(outputPath, f);
    copy(path.join(cwd, f), outfile);
};

glob.sync('package.json').forEach(copyFn);
glob.sync('@(README|readme)*.*').forEach(copyFn);
glob.sync('@(license|LICENSE)*').forEach(copyFn);
glob.sync('lib/ribbon/icons/*.@(svg|SVG)').forEach(copyFn);
glob.sync('lib/ribbon/components/*.@(scss|SCSS)').forEach(copyFn);
