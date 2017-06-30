// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import * as fp from '@iml/fp';
import path from 'path';
import * as fs from 'fs';

const filesToExclude = [
  'index.js',
  'package.json',
  'ziplock.json',
  'jasmine.json'
];
const validExtensions = ['.js', '.json'];

const filterOnlyFiles = (directory: string) => (name: string): boolean =>
  fs.statSync(path.join(directory, name)).isFile();

const removeExtensionFromName = (filename: string): string => {
  const parts = filename.split('.');
  if (parts.length > 1) parts.pop();
  return parts.join('.');
};

const filterFileName = (name: string): boolean =>
  filesToExclude.indexOf(name) === -1;

const filterFileExtension = (name: string): boolean =>
  validExtensions.indexOf(path.extname(name)) !== -1;

export const camel = (str: string): string => {
  const parts = str.split('-');
  const first = parts.shift();

  return [first]
    .concat(
      parts.map(function upperFirst(str) {
        return str[0].toUpperCase() + str.slice(1);
      })
    )
    .join('');
};

export default (directory: string, requireFile?: Function) => {
  const files = fs.readdirSync(directory);

  const filenames: string[] = files
    .filter(filterOnlyFiles(directory))
    .filter(filterFileName)
    .filter(filterFileExtension)
    .map(removeExtensionFromName);

  const camelCaseFileNames = filenames.map(camel);
  const paths = filenames.map(x => path.join(directory, x));
  const requiredPaths: string[] = paths.map(requireFile || require);

  return fp.zipObject(camelCaseFileNames)(requiredPaths);
};
