import uuidGenerator from 'lil-uuid';

export default {
  createUUID() {
    if (uuidGenerator.uuid) {
      return uuidGenerator.uuid();
    }
    return uuidGenerator();
  },
};
