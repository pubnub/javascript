import logger from 'loglevel';

class moduleLogger {

  _moduleName: string;

  constructor(moduleName: string) {
    this._moduleName = moduleName;
  }

  __commonLogger(level: string, payload: Object) {
    logger[level]({
      component: this._moduleName,
      data: payload,
      timestamp: new Date(),
    });
  }

  error(payload: Object) {
    this.__commonLogger('error', payload);
  }

  debug(payload: Object) {
    this.__commonLogger('debug', payload);
  }

}


export default {
  getLogger(moduleName: string) {
    return new moduleLogger(moduleName);
  },
};
