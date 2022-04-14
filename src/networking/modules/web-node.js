/*       */
/* global window */

import superagent from 'superagent';
import categories from '../../core/constants/categories';

function log(req) {
  const _pickLogger = () => {
    if (console && console.log) return console; // eslint-disable-line no-console
    if (window && window.console && window.console.log) return window.console;
    return console;
  };

  const start = new Date().getTime();
  const timestamp = new Date().toISOString();
  const logger = _pickLogger();
  logger.log('<<<<<');
  logger.log(`[${timestamp}]`, '\n', req.url, '\n', req.qs);
  logger.log('-----');

  req.on('response', (res) => {
    const now = new Date().getTime();
    const elapsed = now - start;
    const timestampDone = new Date().toISOString();

    logger.log('>>>>>>');

    logger.log(`[${timestampDone} / ${elapsed}]`, '\n', req.url, '\n', req.qs, '\n', res.text);
    logger.log('-----');
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
    } else {
      sc = sc.responseType('arraybuffer');
    }
  } else if (endpoint.forceBuffered === false) {
    sc = sc.buffer(false);
  }

  sc = sc.timeout(endpoint.timeout);

  sc.on('abort', () => {
    return callback(
      {
        category: categories.PNUnknownCategory,
        error: true,
        operation: endpoint.operation,
        errorData: new Error('Aborted'),
      },
      null,
    );
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
        } catch (e) {
          status.errorData = err;
        }
      } else {
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
    } else {
      try {
        parsedResponse = JSON.parse(resp.text);
      } catch (e) {
        status.errorData = resp;
        status.error = true;
        return callback(status, null);
      }
    }

    if (
      parsedResponse.error &&
      parsedResponse.error === 1 &&
      parsedResponse.status &&
      parsedResponse.message &&
      parsedResponse.service
    ) {
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

export async function postfile(url, fields, fileInput) {
  let agent = superagent.post(url);

  fields.forEach(({ key, value }) => {
    agent = agent.field(key, value);
  });

  agent.attach('file', fileInput, { contentType: 'application/octet-stream' });

  const result = await agent;

  return result;
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
