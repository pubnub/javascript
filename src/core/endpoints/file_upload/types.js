/** @flow */

import type { IFile } from '../../../file';

export type FileDescriptor = {|
  name: string,
  id: string,
  size: number,
  created: string,
|};

export type ListFilesParams = {|
  channel: string,
  limit?: number,
  next?: string,
|};

export type ListFilesResult = {|
  status: number,
  data: $ReadOnlyArray<FileDescriptor>,
  next: string,
  count: number,
|};

export type GenerateUploadUrlParams = {|
  channel: string,
  name: string,
|};

export type GenerateUploadUrlResult = {|
  status: number,
  data: {
    id: string,
    name: string,
  },
  file_upload_request: {
    url: string,
    method: string,
    expiration_date: string,
    form_fields: Array<{ key: string, value: string }>,
  },
|};

export type PublishFileParams = {|
  channel: string,
  message: any,
  fileId: string,
  fileName: string,
  storeInHistory?: boolean,
  ttl?: number,
  meta?: any,
|};

export type PublishFileResult = {|
  timetoken: string,
|};

export type SendFileParams = {|
  channel: string,
  file: any,
  message?: any,
  cipherKey?: string,
  storeInHistory?: boolean,
  ttl?: number,
  meta?: any,
|};

export type SendFileResult = {|
  timetoken: string,
  id: string,
  name: string,
|};

export type GetFileUrlParams = {|
  channel: string,
  id: string,
  name: string,
|};

export type GetFileUrlResult = string;

export type DownloadFileParams = {|
  cipherKey?: string,
  channel: string,
  id: string,
  name: string,
|};

export type DownloadFileResult = IFile;

export type DeleteFileParams = {|
  channel: string,
  id: string,
  name: string,
|};

export type DeleteFileResult = {|
  status: number,
|};
