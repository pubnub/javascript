type Listener<T> = (event: T) => void;

export class Subject<T> {
  private listeners: Set<Listener<T>> = new Set();

  constructor(private sync: boolean = false) {}

  subscribe(listener: Listener<T>) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  protected notify(event: T) {
    for (const listener of this.listeners.values()) {
      if (this.sync) {
        listener(event);
      } else {
        setTimeout(listener, 0, event);
      }
    }
  }
}
