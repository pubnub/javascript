/*       */
/* global FormData */
/* global fetch */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EndpointDefinition, StatusAnnouncement } from '../../core/flow_interfaces';
import { postfile as postfilewebnode } from './web-node';
function postfileuri(url, fields, fileInput) {
    return __awaiter(this, void 0, void 0, function* () {
        const formData = new FormData();
        fields.forEach(({ key, value }) => {
            formData.append(key, value);
        });
        formData.append('file', fileInput);
        const result = yield fetch(url, {
            method: 'POST',
            body: formData,
        });
        return result;
    });
}
export function postfile(url, fields, fileInput) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fileInput.uri) {
            return postfilewebnode(url, fields, fileInput);
        }
        return postfileuri(url, fields, fileInput);
    });
}
export function getfile(params, endpoint, callback) {
    let url = this.getStandardOrigin() + endpoint.url;
    if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams(params);
        if (endpoint.url.indexOf('?') > -1) {
            url += '&';
        }
        else {
            url += '?';
        }
        url += searchParams.toString();
    }
    const fetchResult = fetch(url, { method: 'GET', headers: endpoint.headers });
    fetchResult.then((resp) => __awaiter(this, void 0, void 0, function* () {
        let parsedResponse;
        const status = {};
        status.error = false;
        status.operation = endpoint.operation;
        if (resp && resp.status) {
            status.statusCode = resp.status;
        }
        if (endpoint.ignoreBody) {
            parsedResponse = {
                headers: resp.headers,
                redirects: [],
                response: resp,
            };
        }
        else {
            try {
                parsedResponse = JSON.parse(yield resp.text());
            }
            catch (e) {
                status.errorData = resp;
                status.error = true;
                return callback(status, null);
            }
        }
        if (parsedResponse.error &&
            parsedResponse.error === 1 &&
            parsedResponse.status &&
            parsedResponse.message &&
            parsedResponse.service) {
            status.errorData = parsedResponse;
            status.statusCode = parsedResponse.status;
            status.error = true;
            status.category = this._detectErrorCategory(status);
            return callback(status, null);
        }
        if (parsedResponse.error && parsedResponse.error.message) {
            status.errorData = parsedResponse.error;
        }
        // returning the entire response in order to use response methods for
        // reading the body in react native because the response.body
        // is a ReadableStream which doesn't seem to be reliable on ios and android
        return callback(status, { response: { body: resp } });
    }));
    fetchResult.catch((err) => {
        const status = {};
        status.error = true;
        status.operation = endpoint.operation;
        if (err.response && err.response.text && !this._config.logVerbosity) {
            try {
                status.errorData = JSON.parse(err.response.text);
            }
            catch (e) {
                status.errorData = err;
            }
        }
        else {
            status.errorData = err;
        }
        status.category = this._detectErrorCategory(err);
        return callback(status, null);
    });
    return fetchResult;
}
