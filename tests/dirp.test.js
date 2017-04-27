// @flow

import { describe, beforeEach, it, expect, jest } from './jasmine.js';

import path from 'path';

import { camel } from '../index.js';

const isFile = (file: boolean): { isFile: (x: string) => boolean } => ({
  isFile: jest.fn(() => 'statSync.isFile').mockReturnValue(file)
});

describe('dirp test', () => {
  let directory, dirp, files, result, requireFile, readdirSync, statSync;
  beforeEach(() => {
    requireFile = jest
      .fn(() => 'requireFile')
      .mockImplementation((name: string) => ({ name }));

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

    readdirSync = jest.fn(() => 'readdirSync').mockReturnValue(files);

    statSync = jest
      .fn(() => 'statSync')
      .mockImplementation(
        (name: string) => (path.extname(name) ? isFile(true) : isFile(false))
      );

    dirp = jest.mock('fs', () => ({
      statSync,
      readdirSync
    }));

    dirp = require('../index.js').default;

    result = dirp(directory, requireFile);
  });

  [
    'its-a-big-one',
    'filename-1',
    'its-a-small-1-now'
  ].forEach((key: string) => {
    it(`should contain the path and name for ${key}`, () => {
      expect(result[camel(key)]).toEqual({
        name: `${directory}/${key}`
      });
    });
  });

  ['.DS_Name', 'node_modules', 'readme', 'data'].forEach((key: string) => {
    it(`${key} should not be in the results`, () => {
      expect(result[camel(key)]).not.toEqual({
        name: `${directory}/${key}`
      });
    });
  });
});
