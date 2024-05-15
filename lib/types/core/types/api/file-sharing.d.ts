import { PubNubFileInterface } from '../file';
import { Payload } from './index';
export type SharedFile = {
    name: string;
    id: string;
    size: number;
    created: string;
};
export type ListFilesParameters = {
    channel: string;
    limit?: number;
    next?: string;
};
export type ListFilesResponse = {
    status: number;
    data: SharedFile[];
    next: string;
    count: number;
};
export type SendFileParameters<FileParameters> = Omit<PublishFileMessageParameters, 'fileId' | 'fileName'> & {
    channel: string;
    file: FileParameters;
};
export type SendFileResponse = PublishFileMessageResponse & {
    status: number;
    name: string;
    id: string;
};
export type UploadFileParameters = {
    fileId: string;
    fileName: string;
    file: PubNubFileInterface;
    uploadUrl: string;
    formFields: {
        name: string;
        value: string;
    }[];
};
export type UploadFileResponse = {
    status: number;
    message: Payload;
};
export type GenerateFileUploadUrlParameters = {
    channel: string;
    name: string;
};
export type GenerateFileUploadUrlResponse = {
    id: string;
    name: string;
    url: string;
    formFields: {
        name: string;
        value: string;
    }[];
};
export type PublishFileMessageParameters = {
    channel: string;
    message?: Payload;
    cipherKey?: string;
    fileId: string;
    fileName: string;
    storeInHistory?: boolean;
    ttl?: number;
    meta?: Payload;
};
export type PublishFileMessageResponse = {
    timetoken: string;
};
export type DownloadFileParameters = FileUrlParameters & {
    cipherKey?: string;
};
export type FileUrlParameters = {
    channel: string;
    id: string;
    name: string;
};
export type FileUrlResponse = string;
export type DeleteFileParameters = {
    channel: string;
    id: string;
    name: string;
};
export type DeleteFileResponse = {
    status: number;
};
