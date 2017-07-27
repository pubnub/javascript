/* @flow */
import queryParameters from '../constants/query_parameters';
import { EndpointDefinition } from '../flow_interfaces';

export default class {
  constructor() {
    this._latencies = {};
    this._results = [];
  }

  get() {
    return this._results.shift() || {};
  }

  start(endpoint: EndpointDefinition): void {
    endpoint.time = (new Date()).getTime();
  }

  stop(endpoint: EndpointDefinition): void {
    let { operation, time } = endpoint;

    const param = queryParameters[operation];

    if (!param) {
      return;
    }

    time = ((new Date()).getTime() - time) / 1000;

    if (!this._latencies[param]) {
      this._latencies[param] = { times: [], avg: 0 };
    }

    this._latencies[param].times.push(time);

    let sum = this._latencies[param].times.reduce((acc, val) => {
      acc += val;
      return acc;
    }, 0);

    this._latencies[param].avg = Math.round((sum / this._latencies[param].times.length) * 1000) / 1000;
  }

  startPolling() {
    this._timeTimer = setInterval(this._performTimeLoop.bind(this), 1000);
  }

  stopPolling() {
    clearInterval(this._timeTimer);
  }

  _performTimeLoop() {
    let obj = {};

    Object.keys(this._latencies).forEach((key) => {
      obj[key] = this._latencies[key].avg;
    });

    this._latencies = {};

    this._results.push(obj);
  }
}
