"use strict";
/**
 * Default console-based logger.
 *
 * **Important:** This logger is always added as part of {@link LoggerManager} instance configuration and can't be
 * removed.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLogger = void 0;
const logger_1 = require("../core/interfaces/logger");
const utils_1 = require("../core/utils");
/**
 * Custom {@link Logger} implementation to show a message in the native console.
 */
class ConsoleLogger {
    /**
     * Process a `debug` level message.
     *
     * @param message - Message which should be handled by custom logger implementation.
     */
    debug(message) {
        this.log(message);
    }
    /**
     * Process a `error` level message.
     *
     * @param message - Message which should be handled by custom logger implementation.
     */
    error(message) {
        this.log(message);
    }
    /**
     * Process an `info` level message.
     *
     * @param message - Message which should be handled by custom logger implementation.
     */
    info(message) {
        this.log(message);
    }
    /**
     * Process a `trace` level message.
     *
     * @param message - Message which should be handled by custom logger implementation.
     */
    trace(message) {
        this.log(message);
    }
    /**
     * Process an `warn` level message.
     *
     * @param message - Message which should be handled by custom logger implementation.
     */
    warn(message) {
        this.log(message);
    }
    /**
     * Stringify logger object.
     *
     * @returns Serialized logger object.
     */
    toString() {
        return `ConsoleLogger {}`;
    }
    /**
     * Process log message object.
     *
     * @param message - Object with information which can be used to identify level and prepare log entry payload.
     */
    log(message) {
        const logLevelString = logger_1.LogLevel[message.level];
        const level = logLevelString.toLowerCase();
        console[level === 'trace' ? 'debug' : level](`${message.timestamp.toISOString()} PubNub-${message.pubNubId} ${logLevelString.padEnd(5, ' ')}${message.location ? ` ${message.location}` : ''} ${this.logMessage(message)}`);
    }
    /**
     * Get a pre-formatted log message.
     *
     * @param message - Log message which should be stringified.
     *
     * @returns String formatted for log entry in console.
     */
    logMessage(message) {
        if (message.messageType === 'text')
            return message.message;
        else if (message.messageType === 'object')
            return `${message.details ? `${message.details}\n` : ''}${this.formattedObject(message)}`;
        else if (message.messageType === 'network-request') {
            const showOnlyBasicInfo = !!message.canceled || !!message.failed;
            const headersList = message.minimumLevel === logger_1.LogLevel.Trace && !showOnlyBasicInfo ? this.formattedHeaders(message) : undefined;
            const request = message.message;
            const queryString = request.queryParameters && Object.keys(request.queryParameters).length > 0
                ? (0, utils_1.queryStringFromObject)(request.queryParameters)
                : undefined;
            const url = `${request.origin}${request.path}${queryString ? `?${queryString}` : ''}`;
            const formattedBody = !showOnlyBasicInfo ? this.formattedBody(message) : undefined;
            let action = 'Sending';
            if (showOnlyBasicInfo)
                action = `${!!message.canceled ? 'Canceled' : 'Failed'}${message.details ? ` (${message.details})` : ''}`;
            const padding = ((formattedBody === null || formattedBody === void 0 ? void 0 : formattedBody.formData) ? 'FormData' : 'Method').length;
            return `${action} HTTP request:\n  ${this.paddedString('Method', padding)}: ${request.method}\n  ${this.paddedString('URL', padding)}: ${url}${headersList ? `\n  ${this.paddedString('Headers', padding)}:\n${headersList}` : ''}${(formattedBody === null || formattedBody === void 0 ? void 0 : formattedBody.formData) ? `\n  ${this.paddedString('FormData', padding)}:\n${formattedBody.formData}` : ''}${(formattedBody === null || formattedBody === void 0 ? void 0 : formattedBody.body) ? `\n  ${this.paddedString('Body', padding)}:\n${formattedBody.body}` : ''}`;
        }
        else if (message.messageType === 'network-response') {
            const headersList = message.minimumLevel === logger_1.LogLevel.Trace ? this.formattedHeaders(message) : undefined;
            const formattedBody = this.formattedBody(message);
            const padding = ((formattedBody === null || formattedBody === void 0 ? void 0 : formattedBody.formData) ? 'Headers' : 'Status').length;
            const response = message.message;
            return `Received HTTP response:\n  ${this.paddedString('URL', padding)}: ${response.url}\n  ${this.paddedString('Status', padding)}: ${response.status}${headersList ? `\n  ${this.paddedString('Headers', padding)}:\n${headersList}` : ''}${(formattedBody === null || formattedBody === void 0 ? void 0 : formattedBody.body) ? `\n  ${this.paddedString('Body', padding)}:\n${formattedBody.body}` : ''}`;
        }
        else if (message.messageType === 'error') {
            const formattedStatus = this.formattedErrorStatus(message);
            const error = message.message;
            return `${error.name}: ${error.message}${formattedStatus ? `\n${formattedStatus}` : ''}`;
        }
        return '<unknown log message data>';
    }
    /**
     * Get a pre-formatted object (dictionary / array).
     *
     * @param message - Log message which may contain an object for formatting.
     *
     * @returns String formatted for log entry in console or `undefined` if a log message doesn't have suitable data.
     */
    formattedObject(message) {
        const stringify = (obj, level = 1, skipIndentOnce = false) => {
            const maxIndentReached = level === 10;
            const targetIndent = ' '.repeat(level * 2);
            const lines = [];
            const isIgnored = (key, obj) => {
                if (!message.ignoredKeys)
                    return false;
                if (typeof message.ignoredKeys === 'function')
                    return message.ignoredKeys(key, obj);
                return message.ignoredKeys.includes(key);
            };
            if (typeof obj === 'string')
                lines.push(`${targetIndent}- ${obj}`);
            else if (typeof obj === 'number')
                lines.push(`${targetIndent}- ${obj}`);
            else if (typeof obj === 'boolean')
                lines.push(`${targetIndent}- ${obj}`);
            else if (obj === null)
                lines.push(`${targetIndent}- null`);
            else if (obj === undefined)
                lines.push(`${targetIndent}- undefined`);
            else if (typeof obj === 'function')
                lines.push(`${targetIndent}- <function>`);
            else if (typeof obj === 'object') {
                if (!Array.isArray(obj) && typeof obj.toString === 'function' && obj.toString().indexOf('[object') !== 0) {
                    lines.push(`${skipIndentOnce ? '' : targetIndent}${obj.toString()}`);
                    skipIndentOnce = false;
                }
                else if (Array.isArray(obj)) {
                    for (const element of obj) {
                        const indent = skipIndentOnce ? '' : targetIndent;
                        if (element === null)
                            lines.push(`${indent}- null`);
                        else if (element === undefined)
                            lines.push(`${indent}- undefined`);
                        else if (typeof element === 'function')
                            lines.push(`${indent}- <function>`);
                        else if (typeof element === 'object') {
                            const isArray = Array.isArray(element);
                            const entry = maxIndentReached ? '...' : stringify(element, level + 1, !isArray);
                            lines.push(`${indent}-${isArray && !maxIndentReached ? '\n' : ' '}${entry}`);
                        }
                        else
                            lines.push(`${indent}- ${element}`);
                        skipIndentOnce = false;
                    }
                }
                else {
                    const object = obj;
                    const keys = Object.keys(object);
                    const maxKeyLen = keys.reduce((max, key) => Math.max(max, isIgnored(key, object) ? max : key.length), 0);
                    for (const key of keys) {
                        if (isIgnored(key, object))
                            continue;
                        const indent = skipIndentOnce ? '' : targetIndent;
                        const raw = object[key];
                        const paddedKey = key.padEnd(maxKeyLen, ' ');
                        if (raw === null)
                            lines.push(`${indent}${paddedKey}: null`);
                        else if (raw === undefined)
                            lines.push(`${indent}${paddedKey}: undefined`);
                        else if (typeof raw === 'function')
                            lines.push(`${indent}${paddedKey}: <function>`);
                        else if (typeof raw === 'object') {
                            const isArray = Array.isArray(raw);
                            const isEmptyArray = isArray && raw.length === 0;
                            const isEmptyObject = !isArray && !(raw instanceof String) && Object.keys(raw).length === 0;
                            const hasToString = !isArray && typeof raw.toString === 'function' && raw.toString().indexOf('[object') !== 0;
                            const entry = maxIndentReached
                                ? '...'
                                : isEmptyArray
                                    ? '[]'
                                    : isEmptyObject
                                        ? '{}'
                                        : stringify(raw, level + 1, hasToString);
                            lines.push(`${indent}${paddedKey}:${maxIndentReached || hasToString || isEmptyArray || isEmptyObject ? ' ' : '\n'}${entry}`);
                        }
                        else
                            lines.push(`${indent}${paddedKey}: ${raw}`);
                        skipIndentOnce = false;
                    }
                }
            }
            return lines.join('\n');
        };
        return stringify(message.message);
    }
    /**
     * Get a pre-formatted headers list.
     *
     * @param message - Log message which may contain an object with headers to be used for formatting.
     *
     * @returns String formatted for log entry in console or `undefined` if a log message not related to the network data.
     */
    formattedHeaders(message) {
        if (!message.message.headers)
            return undefined;
        const headers = message.message.headers;
        const maxHeaderLength = Object.keys(headers).reduce((max, key) => Math.max(max, key.length), 0);
        return Object.keys(headers)
            .map((key) => `    - ${key.toLowerCase().padEnd(maxHeaderLength, ' ')}: ${headers[key]}`)
            .join('\n');
    }
    /**
     * Get a pre-formatted body.
     *
     * @param message - Log message which may contain an object with `body` (request or response).
     *
     * @returns Object with formatted string of form data and / or body for log entry in console or `undefined` if a log
     * message not related to the network data.
     */
    formattedBody(message) {
        var _a;
        if (!message.message.headers)
            return undefined;
        let stringifiedFormData;
        let stringifiedBody;
        const headers = message.message.headers;
        const contentType = (_a = headers['content-type']) !== null && _a !== void 0 ? _a : headers['Content-Type'];
        const formData = 'formData' in message.message ? message.message.formData : undefined;
        const body = message.message.body;
        // The presence of this object means that we are sending `multipart/form-data` (potentially uploading a file).
        if (formData) {
            const maxFieldLength = formData.reduce((max, { key }) => Math.max(max, key.length), 0);
            stringifiedFormData = formData
                .map(({ key, value }) => `    - ${key.padEnd(maxFieldLength, ' ')}: ${value}`)
                .join('\n');
        }
        if (!body)
            return { formData: stringifiedFormData };
        if (typeof body === 'string') {
            stringifiedBody = `    ${body}`;
        }
        else if (body instanceof ArrayBuffer || Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
            if (contentType && (contentType.indexOf('javascript') !== -1 || contentType.indexOf('json') !== -1))
                stringifiedBody = `    ${ConsoleLogger.decoder.decode(body)}`;
            else
                stringifiedBody = `    ArrayBuffer { byteLength: ${body.byteLength} }`;
        }
        else {
            stringifiedBody = `    File { name: ${body.name}${body.contentLength ? `, contentLength: ${body.contentLength}` : ''}${body.mimeType ? `, mimeType: ${body.mimeType}` : ''} }`;
        }
        return { body: stringifiedBody, formData: stringifiedFormData };
    }
    /**
     * Get a pre-formatted status object.
     *
     * @param message - Log message which may contain a {@link Status} object.
     *
     * @returns String formatted for log entry in console or `undefined` if a log message doesn't have {@link Status}
     * object.
     */
    formattedErrorStatus(message) {
        if (!message.message.status)
            return undefined;
        const status = message.message.status;
        const errorData = status.errorData;
        let stringifiedErrorData;
        if (ConsoleLogger.isError(errorData)) {
            stringifiedErrorData = `    ${errorData.name}: ${errorData.message}`;
            if (errorData.stack) {
                stringifiedErrorData += `\n${errorData.stack
                    .split('\n')
                    .map((line) => `      ${line}`)
                    .join('\n')}`;
            }
        }
        else if (errorData) {
            try {
                stringifiedErrorData = `    ${JSON.stringify(errorData)}`;
            }
            catch (_) {
                stringifiedErrorData = `    ${errorData}`;
            }
        }
        return `  Category  : ${status.category}\n  Operation : ${status.operation}\n  Status    : ${status.statusCode}${stringifiedErrorData ? `\n  Error data:\n${stringifiedErrorData}` : ''}`;
    }
    /**
     * Append the required amount of space to provide proper padding.
     *
     * @param str - Source string which should be appended with necessary number of spaces.
     * @param maxLength - Maximum length of the string to which source string should be padded.
     * @returns End-padded string.
     */
    paddedString(str, maxLength) {
        return str.padEnd(maxLength - str.length, ' ');
    }
    /**
     * Check whether passed object is {@link Error} instance.
     *
     * @param errorData - Object which should be checked.
     *
     * @returns `true` in case if an object actually {@link Error}.
     */
    static isError(errorData) {
        if (!errorData)
            return false;
        return errorData instanceof Error || Object.prototype.toString.call(errorData) === '[object Error]';
    }
}
exports.ConsoleLogger = ConsoleLogger;
/**
 * Binary data decoder.
 */
ConsoleLogger.decoder = new TextDecoder();
