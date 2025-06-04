import { Entity } from './entity';

/**
 * First-class objects which provides access to the channel-specific APIs.
 */
export class Channel extends Entity {
  /**
   * Get a unique channel name.
   *
   * @returns Channel name.
   */
  get name(): string {
    return this._nameOrId;
  }
}
