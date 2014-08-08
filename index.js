var promzard = require('promzard'),
    fs = require('fs'),
    path = require('path'),
    pkgIn = path.join(__dirname, 'lib/input.js'),
    pkgOut = path.join(process.cwd(), 'package.json');

if (fs.existsSync(pkgOut)) {
  console.error('ERROR: ' + path.basename(pkgOut) + ' already exists!');
  process.exit(1);
}

var ctx = {
  defaultAuthorName: 'Chris Pettitt',
  defaultAuthorEmail: 'cpettitt@gmail.com'
};

promzard(pkgIn, ctx, function(err, data) {
  if (err) { throw err; }

  var pkgContents = {
    name: data.name,
    version: '0.0.1-pre',
    description: data.description,
    author: data.authorName + ' <' + data.authorEmail + '>',
    main: 'index.js',
    license: data.license
  };

  fs.writeFile(pkgOut, JSON.stringify(pkgContents, null, 2), function(err) {
    if (err) { throw err; }
    console.log('Done.');
  });
});
