type Listener<T> = (event: T) => void;

/**
 * @internal
 */
export class Subject<T> {
  protected listeners: Set<Listener<T>> = new Set();

  constructor(private sync: boolean = false) {}

  subscribe(listener: Listener<T>) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  notify(event: T) {
    const wrapper = () => {
      this.listeners.forEach((listener) => {
        listener(event);
      });
    };

    if (this.sync) {
      wrapper();
    } else {
      setTimeout(wrapper, 0);
    }
  }
}
