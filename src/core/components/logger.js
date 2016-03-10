import logger from 'loglevel';

class moduleLogger {

  _moduleName: string;

  __commonLogger(level: string, payload: Object) {
    logger[level]({
      component: this._moduleName,
      data: payload,
      timestamp: new Date(),
    });
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
