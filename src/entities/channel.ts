import { Entity } from './entity';

/**
 * First-class objects which provides access to the channel-specific APIs.
 */
export class Channel extends Entity {
  /**
   * Retrieve entity type.
   *
   * @return One of known entity types.
   *
   * @internal
   */
  override get entityType(): 'Channel' {
    return 'Channel';
  }

  /**
   * Get a unique channel name.
   *
   * @returns Channel name.
   */
  get name(): string {
    return this._nameOrId;
  }
}
