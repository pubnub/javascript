type Listener = () => void;

class Signal {
  private events: Record<string, Listener[]> = {};
  public aborted = false;

  on(name: string, listener: Listener) {
    if (!this.events[name]) {
      this.events[name] = [];
    }

    this.events[name].push(listener);
  }

  emit(name: string) {
    for (const callback of this.events[name]) {
      callback();
    }
  }
}

export default class RequestController {
  signal: Signal = new Signal();

  abort() {
    if (this.signal.aborted) return;
    this.signal.aborted = true;

    this.signal.emit('abort');
  }
}
