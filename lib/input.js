var path = require('path');

module.exports = {
  name: prompt('name', path.basename(process.cwd())),
  description: prompt('description'),
  authorName: prompt('author name', defaultAuthorName),
  authorEmail: prompt('author email', defaultAuthorEmail),
  license: prompt('license', 'BSD')
};
