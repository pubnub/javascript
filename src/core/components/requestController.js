class Signal {
  constructor() {
    this._events = {};
    this.aborted = false;
  }

  on(name, listener) {
    if (!this._events[name]) {
      this._events[name] = [];
    }
    this._events[name].push(listener);
  }

  emit(name) {
    const fireCallbacks = (callback) => {
      callback();
    };
    this._events[name].forEach(fireCallbacks);
  }
}
export default class RequestController {
  constructor() {
    this.signal = new Signal();
  }

  abort() {
    if (this.signal.aborted) return;

    this.signal.aborted = true;

    this.signal.emit('abort');
  }
}
