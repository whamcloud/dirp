'use strict';

var fp = require('intel-fp');
var path = require('path');
var readDirSync = require('fs').readdirSync;
var statSync = require('fs').statSync;


/**
 * Loads all items in the specified directory and requires each file.
 * An object containing the data is returned.
 * @param {String} directory
 * @param {Function} [requireFile]
 * @returns {Object}
 */
module.exports = function loadDirectoryItems (directory, requireFile) {

  var files = readDirSync(directory);
  var filesToExclude = ['index.js', 'package.json', 'ziplock.json', 'jasmine.json'];
  var validExtensions = ['.js', '.json'];

  var filenames = fp.flow(
      fp.filter(filterOnlyFiles),
      fp.filter(filterFileName),
      fp.filter(filterFileExtension),
      fp.map(removeExtensionFromName))(files);

  var camelCaseFileNames = fp.map(camel, filenames);
  var paths = fp.map(path.join.bind(path, directory), filenames);
  return fp.zipObject(camelCaseFileNames, fp.map(requireFile || require, paths));

  function filterOnlyFiles (name) {
    return statSync(path.join(directory,name)).isFile();
  }

  function removeExtensionFromName (filename) {
    var parts = filename.split('.');
    if (parts.length > 1)
      parts.pop();
    return parts.join('.');
  }

  function filterFileName (name) {
    return filesToExclude.indexOf(name) === -1;
  }

  function filterFileExtension (name) {
    return validExtensions.indexOf(path.extname(name)) !== -1;
  }

  function camel (str) {
    var parts = str.split('-');
    var first = parts.shift();

    return [first].concat(parts.map(function upperFirst (str) {
      return str[0].toUpperCase() + str.slice(1);
    })).join('');
  }
};
