/*       */
/* global window */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import superagent from 'superagent';
import categories from '../../core/constants/categories';
function log(req) {
    const start = new Date().getTime();
    const timestamp = new Date().toISOString();
    console.log('<<<<<');
    console.log(`[${timestamp}]`, '\n', req.url, '\n', req.qs);
    console.log('-----');
    req.on('response', (res) => {
        const now = new Date().getTime();
        const elapsed = now - start;
        const timestampDone = new Date().toISOString();
        console.log('>>>>>>');
        console.log(`[${timestampDone} / ${elapsed}]`, '\n', req.url, '\n', req.qs, '\n', res.text);
        console.log('-----');
    });
}
function xdr(superagentConstruct, endpoint, callback) {
    if (this._config.logVerbosity) {
        superagentConstruct = superagentConstruct.use(log);
    }
    if (this._config.proxy && this._modules.proxy) {
        superagentConstruct = this._modules.proxy.call(this, superagentConstruct);
    }
    if (this._config.keepAlive && this._modules.keepAlive) {
        superagentConstruct = this._modules.keepAlive(superagentConstruct);
    }
    let sc = superagentConstruct;
    if (endpoint.abortSignal) {
        const unsubscribe = endpoint.abortSignal.subscribe(() => {
            sc.abort();
            unsubscribe();
        });
    }
    if (endpoint.forceBuffered === true) {
        if (typeof Blob === 'undefined') {
            sc = sc.buffer().responseType('arraybuffer');
        }
        else {
            sc = sc.responseType('arraybuffer');
        }
    }
    else if (endpoint.forceBuffered === false) {
        sc = sc.buffer(false);
    }
    sc = sc.timeout(endpoint.timeout);
    sc.on('abort', () => {
        return callback({
            category: categories.PNUnknownCategory,
            error: true,
            operation: endpoint.operation,
            errorData: new Error('Aborted'),
        }, null);
    });
    sc.end((err, resp) => {
        let parsedResponse;
        const status = {};
        status.error = err !== null;
        status.operation = endpoint.operation;
        if (resp && resp.status) {
            status.statusCode = resp.status;
        }
        if (err) {
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
        }
        if (endpoint.ignoreBody) {
            parsedResponse = {
                headers: resp.headers,
                redirects: resp.redirects,
                response: resp,
            };
        }
        else {
            try {
                parsedResponse = JSON.parse(resp.text);
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
        return callback(status, parsedResponse);
    });
    return sc;
}
export function postfile(url, fields, fileInput) {
    return __awaiter(this, void 0, void 0, function* () {
        let agent = superagent.post(url);
        fields.forEach(({ key, value }) => {
            agent = agent.field(key, value);
        });
        agent.attach('file', fileInput, { contentType: 'application/octet-stream' });
        const result = yield agent;
        return result;
    });
}
export function getfile(params, endpoint, callback) {
    const superagentConstruct = superagent
        .get(this.getStandardOrigin() + endpoint.url)
        .set(endpoint.headers)
        .query(params);
    return xdr.call(this, superagentConstruct, endpoint, callback);
}
export function get(params, endpoint, callback) {
    const superagentConstruct = superagent
        .get(this.getStandardOrigin() + endpoint.url)
        .set(endpoint.headers)
        .query(params);
    return xdr.call(this, superagentConstruct, endpoint, callback);
}
export function post(params, body, endpoint, callback) {
    const superagentConstruct = superagent
        .post(this.getStandardOrigin() + endpoint.url)
        .query(params)
        .set(endpoint.headers)
        .send(body);
    return xdr.call(this, superagentConstruct, endpoint, callback);
}
export function patch(params, body, endpoint, callback) {
    const superagentConstruct = superagent
        .patch(this.getStandardOrigin() + endpoint.url)
        .query(params)
        .set(endpoint.headers)
        .send(body);
    return xdr.call(this, superagentConstruct, endpoint, callback);
}
export function del(params, endpoint, callback) {
    const superagentConstruct = superagent
        .delete(this.getStandardOrigin() + endpoint.url)
        .set(endpoint.headers)
        .query(params);
    return xdr.call(this, superagentConstruct, endpoint, callback);
}
