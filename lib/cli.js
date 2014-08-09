var promzard = require('promzard'),
    fs = require('fs'),
    path = require('path'),
    childproc = require('child_process'),
    _ = require('underscore'),
    cwd = process.cwd(),
    templateDir = path.join(__dirname, '../templates'),
    pkgIn = path.join(__dirname, 'input.js'),
    pkgOut = path.join(cwd, 'package.json');

if (fs.existsSync(pkgOut)) {
  bail('ERROR: ' + path.basename(pkgOut) + ' already exists!');
}

var ctx = {
  defaultAuthorName: 'Chris Pettitt',
  defaultAuthorEmail: 'cpettitt@gmail.com'
};

promzard(pkgIn, ctx, function(err, data) {
  if (err) { throw err; }

  validate(data);

  writePackageJson(data);
  renderTemplate(getLicenseFile(data.license), data, path.join(cwd, 'LICENSE'));
  renderTemplate(path.join(templateDir, 'CHANGELOG.md'), data, path.join(cwd, 'CHANGELOG.md'));
  installCommonDevLibraries(function(err) {
    if (err) { throw err; }
    console.log('Done.');
  });
});

function bail(msg) {
  console.error(msg);
  process.exit(1);
}

function validate(data) {
  if (!fs.existsSync(getLicenseFile(data.license))) {
    bail('ERROR: A license file for ' + data.license + ' does not exist.\n'+
         'Missing: ' + getLicenseFile(data.license));
  }
}

function getLicenseFile(license) {
  return path.join(templateDir, 'license', 'LICENSE.' + license);
}

function writePackageJson(data) {
  var contents = {
    name: data.name,
    version: data.version + '-pre',
    description: data.description,
    author: data.authorName + ' <' + data.authorEmail + '>',
    main: 'index.js',
    license: data.license
  };

  fs.writeFileSync(pkgOut, JSON.stringify(contents, null, 2));
}

function renderTemplate(src, ctx, dest) {
  var template = fs.readFileSync(src, 'UTF-8'),
      rendered = _.template(template, ctx);
  fs.writeFileSync(dest, rendered); 
}

function installCommonDevLibraries(cb) {
  var devLibs = [
        // For producing the final JS
        'browserify',
        'uglify-js',

        // For testing
        'chai',
        'mocha',

        // For code cleanliness
        'jscs',
        'jshint'
      ].sort(),
      args = ['install', '--save'].concat(devLibs);

  var proc = childproc.spawn('npm', args, { stdio: 'inherit' });
  proc.on('error', function(err) { cb(err); })
      .on('exit', function(code) {
        if (code) {
          cb(new Error('Installing ' + lib + ' failed. Errno: ' + code));
        } else {
          cb(null);
        }
      });
}
