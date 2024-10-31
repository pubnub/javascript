/**
 * Random identifier generator helper module.
 *
 * @internal
 */

import uuidGenerator from 'lil-uuid';

/** @internal */
export default {
  createUUID() {
    if (uuidGenerator.uuid) {
      return uuidGenerator.uuid();
    }
    // @ts-expect-error Depending on module type it may be callable.
    return uuidGenerator();
  },
};
