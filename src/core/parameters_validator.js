export default function (expectedParams, incomingParams) {
  let result;

  Object.keys(incomingParams).forEach((key) => {
    const expected = expectedParams[key];
    const received = typeof incomingParams[key];

    if (!expected) {
      result = `The param: (${key}) is not valid!`;
      return true;
    } else if (expected === '*ignore') {
      return true;
    } else if (expected === 'array' && Array.isArray(incomingParams[key])) {
      return true;
    } else if (expected === 'object') {
      return true;
    } else if (received !== expected) {
      result = `The type expected for the param (${key}) has to be ${expected} but was received ${received}`;
      return true;
    }
  });

  return result;
}
