// @flow

//
// INTEL CONFIDENTIAL
//
// Copyright 2013-2017 Intel Corporation All Rights Reserved.
//
// The source code contained or described herein and all documents related
// to the source code ("Material") are owned by Intel Corporation or its
// suppliers or licensors. Title to the Material remains with Intel Corporation
// or its suppliers and licensors. The Material contains trade secrets and
// proprietary and confidential information of Intel or its suppliers and
// licensors. The Material is protected by worldwide copyright and trade secret
// laws and treaty provisions. No part of the Material may be used, copied,
// reproduced, modified, published, uploaded, posted, transmitted, distributed,
// or disclosed in any way without Intel's prior express written permission.
//
// No license under any patent, copyright, trade secret or other intellectual
// property right is granted to or conferred upon you by disclosure or delivery
// of the Materials, either expressly, by implication, inducement, estoppel or
// otherwise. Any license under such intellectual property rights must be
// express and approved by Intel in writing.

import * as fp from '@mfl/fp';
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
