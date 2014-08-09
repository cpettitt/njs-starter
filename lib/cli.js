var promzard = require('promzard'),
    fs = require('fs'),
    path = require('path'),
    childproc = require('child_process'),
    _ = require('underscore'),
    camelize = require('camelize'),
    cwd = process.cwd(),
    templateDir = path.join(__dirname, '../templates'),
    pkgIn = path.join(__dirname, 'input.js'),
    pkgOut = path.join(cwd, 'package.json');

if (fs.existsSync(pkgOut)) {
  bail('ERROR: ' + path.basename(pkgOut) + ' already exists!');
}

var pzCtx = {
  defaultAuthorName: 'Chris Pettitt',
  defaultAuthorEmail: 'cpettitt@gmail.com',
  defaultGitName: 'cpettitt'
};

promzard(pkgIn, pzCtx, function(err, ctx) {
  if (err) { throw err; }

  validate(ctx);

  var license = _.template(readFile(getLicenseFile(ctx.license)), ctx);

  ctx.camelName = camelize(ctx.name);
  ctx.licenseComment = createLicenseComment(license);

  writePackageJson(ctx);
  writeFile(license, cwd, 'LICENSE');
  writeTemplate('README.md', ctx);
  writeTemplate('CHANGELOG.md', ctx);
  writeTemplate('browser.js', ctx);
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
    bail('ERROR: A license file for ' + data.license + ' does not exist.\n' +
         'Missing: ' + getLicenseFile(data.license));
  }
}

function getLicenseFile(license) {
  return path.join(templateDir, 'license', 'LICENSE.' + license);
}

function readFile() {
  var file = path.join.apply(path, arguments);
  return fs.readFileSync(file, 'UTF-8');
}

function writeTemplate(file, ctx) {
  writeFile(_.template(readFile(templateDir, file), ctx), cwd, file);
}

function writeFile(contents) {
  var file = path.join.apply(path, Array.prototype.slice.call(arguments, 1));
  fs.writeFileSync(file, contents);
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

function createLicenseComment(license) {
  var licenseBlock = license.trim().split('\n').join('\n * ');
  return ' * ' + licenseBlock;
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

  var proc = childproc.spawn('npm', args, {stdio: 'inherit'});
  proc.on('error', function(err) { cb(err); })
      .on('exit', function(code) {
        if (code) {
          cb(new Error('Installing ' + lib + ' failed. Errno: ' + code));
        } else {
          cb(null);
        }
      });
}
