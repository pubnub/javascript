import { Subject } from './subject';

export class AbortError extends Error {
  name = 'AbortError';

  constructor() {
    super('The operation was aborted.');

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Event Engine stored effect processing cancellation signal.
 *
 * @internal
 */
export class AbortSignal extends Subject<AbortError> {
  private _aborted = false;

  get aborted() {
    return this._aborted;
  }

  throwIfAborted() {
    if (this._aborted) {
      throw new AbortError();
    }
  }

  abort() {
    this._aborted = true;
    this.notify(new AbortError());
  }
}
