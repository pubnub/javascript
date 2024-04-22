"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractRequest = void 0;
const transport_request_1 = require("../types/transport-request");
const uuid_1 = __importDefault(require("./uuid"));
class AbstractRequest {
    constructor(params) {
        this.params = params;
        this.requestIdentifier = uuid_1.default.createUUID();
        this._cancellationController = null;
    }
    get cancellationController() {
        return this._cancellationController;
    }
    set cancellationController(controller) {
        this._cancellationController = controller;
    }
    abort() {
        if (this && this.cancellationController)
            this.cancellationController.abort();
    }
    operation() {
        throw Error('Should be implemented by subclass.');
    }
    validate() {
        return undefined;
    }
    parse(_response) {
        return __awaiter(this, void 0, void 0, function* () {
            throw Error('Should be implemented by subclass.');
        });
    }
    request() {
        var _a, _b, _c, _d;
        const request = {
            method: (_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.method) !== null && _b !== void 0 ? _b : transport_request_1.TransportMethod.GET,
            path: this.path,
            queryParameters: this.queryParameters,
            cancellable: (_d = (_c = this.params) === null || _c === void 0 ? void 0 : _c.cancellable) !== null && _d !== void 0 ? _d : false,
            timeout: 10000,
            identifier: this.requestIdentifier,
        };
        const headers = this.headers;
        if (headers)
            request.headers = headers;
        if (request.method === transport_request_1.TransportMethod.POST || request.method === transport_request_1.TransportMethod.PATCH) {
            const [body, formData] = [this.body, this.formData];
            if (formData)
                request.formData = formData;
            if (body)
                request.body = body;
        }
        return request;
    }
    get headers() {
        return undefined;
    }
    get path() {
        throw Error('`path` getter should be implemented by subclass.');
    }
    get queryParameters() {
        return {};
    }
    get formData() {
        return undefined;
    }
    get body() {
        return undefined;
    }
    deserializeResponse(response) {
        const contentType = response.headers['content-type'];
        if (!contentType || (contentType.indexOf('javascript') === -1 && contentType.indexOf('json') === -1))
            return undefined;
        const json = AbstractRequest.decoder.decode(response.body);
        try {
            const parsedJson = JSON.parse(json);
            return parsedJson;
        }
        catch (error) {
            console.error('Error parsing JSON response:', error);
            return undefined;
        }
    }
}
exports.AbstractRequest = AbstractRequest;
AbstractRequest.decoder = new TextDecoder();
