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

  ['lib', 'src', 'test'].forEach(function(dir) {
    fs.mkdirSync(path.join(cwd, dir));
  });

  writeFile(license, path.join(cwd, 'LICENSE'));
  writeTemplate('README.md', ctx);
  writeTemplate('CHANGELOG.md', ctx);
  writeTemplate('browser.js', ctx);
  writeTemplate('index.js', ctx);
  writeTemplate('jshintrc', ctx, '.jshintrc');
  writeTemplate('jscsrc', ctx, '.jscsrc');
  writeTemplate('gitignore', ctx, '.gitignore');
  writeTemplate('npmignore', ctx, '.npmignore');
  writeTemplate('version.js', ctx, 'src/version.js', 0755);
  writeTemplate('Makefile', ctx);

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

function writeTemplate(src, ctx, dest, mode) {
  dest = dest || src;
  writeFile(_.template(readFile(templateDir, src), ctx), path.join(cwd, dest), mode);
}

function writeFile(contents, path, mode) {
  mode = mode || 0644;
  fs.writeFileSync(path, contents, {mode: mode});
}

function writePackageJson(ctx) {
  var contents = {
    name: ctx.name,
    version: ctx.version + '-pre',
    description: ctx.description,
    author: ctx.authorName + ' <' + ctx.authorEmail + '>',
    main: 'index.js',
    repository: {
      type: 'git',
      url: 'https://github.com/' + ctx.gitName + '/' + ctx.name + '.git'
    },
    license: ctx.license
  };

  fs.writeFileSync(pkgOut, JSON.stringify(contents, null, 2));
}

function createLicenseComment(license) {
  return (license
    .trim()
    .split('\n')
    .map(function(x) { return ' *' + (x.length ? ' ' + x : ''); })
    .join('\n'));
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
