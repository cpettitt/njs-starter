var promzard = require('promzard'),
    fs = require('fs'),
    path = require('path'),
    childproc = require('child_process'),
    _ = require('underscore'),
    cwd = process.cwd(),
    pkgIn = path.join(__dirname, 'lib/input.js'),
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
  copyLicenseFile(data);
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
  return path.join(__dirname, 'templates/license', 'LICENSE.' + license);
}

function copyLicenseFile(data) {
  var licenseTemplate = fs.readFileSync(getLicenseFile(data.license), 'UTF-8'),
      license = _.template(licenseTemplate, data);
  fs.writeFileSync(path.join(cwd, 'LICENSE'), license); 
}

function writePackageJson(data) {
  var contents = {
    name: data.name,
    version: '0.0.1-pre',
    description: data.description,
    author: data.authorName + ' <' + data.authorEmail + '>',
    main: 'index.js',
    license: data.license
  };

  fs.writeFileSync(pkgOut, JSON.stringify(contents, null, 2));
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
