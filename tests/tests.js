'use strict';

var format = require('util').format;
var rewire = require('rewire');
var dirp = rewire('../index');
var path = require('path');

describe('dirp test', function() {
  var directory, files, result, requireFile, revert, readDirSync, statSync;
  beforeEach(function() {
    requireFile = jasmine.createSpy('requireFile').and.callFake(function(name) {
      return { name: name };
    });

    directory = '/some/known/directory';
    files = [
      'its-a-big-one.json',
      '.DS_Name',
      'index.js',
      'node_modules',
      'filename-1.json',
      'its-a-small-1-now.js',
      'package.json',
      'ziplock.json',
      'readme.md',
      'data.xml'
    ];

    readDirSync = jasmine.createSpy('readDirSync').and.returnValue(files);

    statSync = jasmine.createSpy('statSync').and.callFake(function(name) {
      return path.extname(name) ? isFile(true) : isFile(false);

      function isFile(file) {
        return {
          isFile: jasmine.createSpy('statSync.isFile').and.returnValue(file)
        };
      }
    });

    revert = dirp.__set__({
      readDirSync: readDirSync,
      statSync: statSync
    });

    result = dirp(directory, requireFile);
  });

  afterEach(function() {
    revert();
  });

  ['its-a-big-one', 'filename-1', 'its-a-small-1-now'].forEach(function(key) {
    it(format('should contain the path and name for %s', key), function() {
      expect(result[camel(key)]).toEqual({
        name: format('%s/%s', directory, key)
      });
    });
  });

  ['.DS_Name', 'node_modules', 'readme', 'data'].forEach(function(key) {
    it(format('%s should not be in the results', key), function() {
      expect(result[camel(key)]).not.toEqual({
        name: format('%s/%s', directory, key)
      });
    });
  });
});

function camel(str) {
  var parts = str.split('-');
  var first = parts.shift();

  return [first]
    .concat(
      parts.map(function upperFirst(str) {
        return str[0].toUpperCase() + str.slice(1);
      })
    )
    .join('');
}
