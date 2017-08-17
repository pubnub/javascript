export default function (expectedParams, incomingParams) {
  let result;

  Object.keys(incomingParams).forEach((key) => {
    const expected = expectedParams[key];
    const received = typeof incomingParams[key];

    if (!expected) {
      result = `The param: (${key}) is not valid!`;
      return;
    } else if (expected === '*ignore') {
      return;
    } else if (expected === 'array' && Array.isArray(incomingParams[key])) {
      return;
    } else if (expected === 'object') {
      return;
    } else if (received !== expected) {
      result = `The type expected for the param (${key}) has to be ${expected} but was received ${received}`;
      return;
    }
  });

  return result;
}
