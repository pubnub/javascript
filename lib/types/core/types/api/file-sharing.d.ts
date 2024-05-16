/**
 * File Sharing REST API module.
 */
import { PubNubFileInterface } from '../file';
import { Payload } from './index';
/**
 * Shared file object.
 */
export type SharedFile = {
    /**
     * Name with which file has been stored.
     */
    name: string;
    /**
     * Unique service-assigned file identifier.
     */
    id: string;
    /**
     * Shared file size.
     */
    size: number;
    /**
     * ISO 8601 time string when file has been shared.
     */
    created: string;
};
/**
 * List Files request parameters.
 */
export type ListFilesParameters = {
    /**
     * Name of channel for which list of files should be requested.
     */
    channel: string;
    /**
     * How many entries return with single response.
     */
    limit?: number;
    /**
     * Next files list page token.
     */
    next?: string;
};
/**
 * List Files request response.
 */
export type ListFilesResponse = {
    /**
     * Files list fetch result status code.
     */
    status: number;
    /**
     * List of fetched file objects.
     */
    data: SharedFile[];
    /**
     * Next files list page token.
     */
    next: string;
    /**
     * Number of retrieved files.
     */
    count: number;
};
/**
 * Send File request parameters.
 */
export type SendFileParameters<FileParameters> = Omit<PublishFileMessageParameters, 'fileId' | 'fileName'> & {
    /**
     * Channel to send the file to.
     */
    channel: string;
    /**
     * File to send.
     */
    file: FileParameters;
};
/**
 * Send File request response.
 */
export type SendFileResponse = PublishFileMessageResponse & {
    /**
     * Send file request processing status code.
     */
    status: number;
    /**
     * Actual file name under which file has been stored.
     *
     * File name and unique {@link id} can be used to download file from the channel later.
     *
     * **Important:** Actual file name may be different from the one which has been used during file
     * upload.
     */
    name: string;
    /**
     * Unique file identifier.
     *
     * Unique file identifier and it's {@link name} can be used to download file from the channel
     * later.
     */
    id: string;
};
/**
 * Upload File request parameters.
 */
export type UploadFileParameters = {
    /**
     * Unique file identifier.
     *
     * Unique file identifier, and it's {@link fileName} can be used to download file from the channel
     * later.
     */
    fileId: string;
    /**
     * Actual file name under which file has been stored.
     *
     * File name and unique {@link fileId} can be used to download file from the channel later.
     *
     * **Note:** Actual file name may be different from the one which has been used during file
     * upload.
     */
    fileName: string;
    /**
     * File which should be uploaded.
     */
    file: PubNubFileInterface;
    /**
     * Pre-signed file upload Url.
     */
    uploadUrl: string;
    /**
     * An array of form fields to be used in the pre-signed POST request.
     *
     * **Important:** Form data fields should be passed in exact same order as received from
     * the PubNub service.
     */
    formFields: {
        /**
         * Form data field name.
         */
        name: string;
        /**
         * Form data field value.
         */
        value: string;
    }[];
};
/**
 * Upload File request response.
 */
export type UploadFileResponse = {
    /**
     * Upload File request processing status code.
     */
    status: number;
    /**
     * Service processing result response.
     */
    message: Payload;
};
/**
 * Generate File Upload URL request parameters.
 */
export type GenerateFileUploadUrlParameters = {
    /**
     * Name of channel to which file should be uploaded.
     */
    channel: string;
    /**
     * Actual name of the file which should be uploaded.
     */
    name: string;
};
/**
 * Generation File Upload URL request response.
 */
export type GenerateFileUploadUrlResponse = {
    /**
     * Unique file identifier.
     *
     * Unique file identifier, and it's {@link name} can be used to download file from the channel
     * later.
     */
    id: string;
    /**
     * Actual file name under which file has been stored.
     *
     * File name and unique {@link id} can be used to download file from the channel later.
     *
     * **Note:** Actual file name may be different from the one which has been used during file
     * upload.
     */
    name: string;
    /**
     * Pre-signed URL for file upload.
     */
    url: string;
    /**
     * An array of form fields to be used in the pre-signed POST request.
     *
     * **Important:** Form data fields should be passed in exact same order as received from
     * the PubNub service.
     */
    formFields: {
        /**
         * Form data field name.
         */
        name: string;
        /**
         * Form data field value.
         */
        value: string;
    }[];
};
/**
 * Publish File Message request parameters.
 */
export type PublishFileMessageParameters = {
    /**
     * Name of channel to which file has been sent.
     */
    channel: string;
    /**
     * File annotation message.
     */
    message?: Payload;
    /**
     * Custom file and message encryption key.
     *
     * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} configured for PubNub client
     * instance or encrypt file prior {@link PubNub#sendFile|sendFile} method call.
     */
    cipherKey?: string;
    /**
     * Unique file identifier.
     *
     * Unique file identifier, and it's {@link fileName} can be used to download file from the channel
     * later.
     */
    fileId: string;
    /**
     * Actual file name under which file has been stored.
     *
     * File name and unique {@link fileId} can be used to download file from the channel later.
     *
     * **Note:** Actual file name may be different from the one which has been used during file
     * upload.
     */
    fileName: string;
    /**
     * Whether published file messages should be stored in the channel's history.
     *
     * **Note:** If `storeInHistory` not specified, then the history configuration on the key is
     * used.
     *
     * @default `true`
     */
    storeInHistory?: boolean;
    /**
     * How long the message should be stored in the channel's history.
     *
     * **Note:** If not specified, defaults to the key set's retention value.
     *
     * @default `0`
     */
    ttl?: number;
    /**
     * Metadata, which should be associated with published file.
     *
     * Associated metadata can be utilized by message filtering feature.
     */
    meta?: Payload;
};
/**
 * Publish File Message request response.
 */
export type PublishFileMessageResponse = {
    /**
     * High-precision time when published file message has been received by the PubNub service.
     */
    timetoken: string;
};
/**
 * Download File request parameters.
 */
export type DownloadFileParameters = FileUrlParameters & {
    /**
     * Custom file and message encryption key.
     *
     * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} configured for PubNub client
     * instance or encrypt file prior {@link PubNub#sendFile|sendFile} method call.
     */
    cipherKey?: string;
};
/**
 * Generate File download Url request parameters.
 */
export type FileUrlParameters = {
    /**
     * Name of channel where file has been sent.
     */
    channel: string;
    /**
     * Unique file identifier.
     *
     * Unique file identifier and it's {@link name} can be used to download file from the channel
     * later.
     */
    id: string;
    /**
     * Actual file name under which file has been stored.
     *
     * File name and unique {@link id} can be used to download file from the channel later.
     *
     * **Important:** Actual file name may be different from the one which has been used during file
     * upload.
     */
    name: string;
};
/**
 * Generate File Download Url response.
 */
export type FileUrlResponse = string;
/**
 * Delete File request parameters.
 */
export type DeleteFileParameters = {
    /**
     * Name of channel where file has been sent.
     */
    channel: string;
    /**
     * Unique file identifier.
     *
     * Unique file identifier and it's {@link name} can be used to download file from the channel
     * later.
     */
    id: string;
    /**
     * Actual file name under which file has been stored.
     *
     * File name and unique {@link id} can be used to download file from the channel later.
     *
     * **Important:** Actual file name may be different from the one which has been used during file
     * upload.
     */
    name: string;
};
/**
 * Delete File request response.
 */
export type DeleteFileResponse = {
    /**
     * Delete File request processing status code.
     */
    status: number;
};
