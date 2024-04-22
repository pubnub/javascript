import uuidGenerator from 'lil-uuid';

export default {
  createUUID() {
    if (uuidGenerator.uuid) {
      return uuidGenerator.uuid();
    }
    // @ts-expect-error Depending on module type it may be callable.
    return uuidGenerator();
  },
};
