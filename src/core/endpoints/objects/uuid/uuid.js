/** @flow */

export type UUIDMetadata = {|
  id: string,
  name: string,
  externalId: ?string,
  profileUrl: ?string,
  email: ?string,
  custom: ?any,
  updated: string,
  eTag: string,
|};
