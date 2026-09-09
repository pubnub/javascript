/**
 * Recorded DataSync service responses.
 *
 * Every shape here was captured from a live run of the matching test file against the DataSync
 * backend (see `data-sync-channel-live-trace.md` for the Channel capture). The server returns
 * fields the SDK response types do not declare — `entityClass`/`entityClassLevel` on channels and
 * users, `entityClassLevel` on entities — so the fixture types widen the SDK types to keep the
 * recorded shapes faithful.
 */

import type * as DataSync from '../../../../src/core/types/api/data-sync';

/** Entity class schema version the service reports for `Channel`, `Customer` and `User`. */
export const CLASS_VERSION = 1;

/** Opaque forward cursor as returned by the service. */
export const NEXT_CURSOR = 'eyJpIjoiMzUwMSIsInN2IjpbXX0';

export type ChannelResponseObject = DataSync.ChannelObject & {
  entityClass: 'Channel';
  entityClassLevel: 'Global';
};

/** One persisted channel, with the server-owned fields the service always sends back. */
export const channelObject = (overrides: Partial<ChannelResponseObject> = {}): ChannelResponseObject => ({
  id: 'JSchannel-56738',
  createdAt: '2026-09-07T06:57:09.375184Z',
  updatedAt: '2026-09-07T06:57:09.375184Z',
  eTag: 'y16jaw',
  expiresAt: '2026-10-08T00:00:00Z',
  entityClass: 'Channel',
  entityClassVersion: CLASS_VERSION,
  entityClassLevel: 'Global',
  status: 'active',
  payload: { kind: 'public', name: 'engineering', description: 'engineering' },
  ...overrides,
});

/** `{ errors: [...] }` — the DataSync-shaped error envelope, flattened by `PubNubAPIError`. */
export const notFoundError = (id: string) => ({
  errors: [{ errorCode: 'DS-0100', message: `Entity not found: ${id}` }],
});

// --------------------------------------------------------
// ---------------------- List pages ----------------------
// --------------------------------------------------------
// Trimmed to two rows per page — the live payloads carried every channel on the shared subkey.

export const listPage1 = [
  channelObject({ id: 'channel1', eTag: '3w5e1123mn7p0', payload: { name: 'channel name' } }),
  channelObject({ id: 'c.mem914058452', eTag: '3w5e112494psw' }),
];

export const listPage2 = [
  channelObject({ id: 'customer.392', eTag: 'ppdlga', payload: { name: 'customer' } }),
  channelObject({ id: 'JSchannel-92977', eTag: 'sr2yku' }),
];

/** Rows the service returns for `filter=name == 'group'`. */
export const filteredGroupRows = [
  channelObject({ id: 'JSchannel-88646', eTag: 'sr3e5x', payload: { name: 'group', kind: 'public' } }),
  channelObject({ id: 'JSchannel-36964', eTag: 'sr3gbm', payload: { name: 'group', kind: 'public' } }),
];

/** Rows the service returns for `sort=createdAt:desc`, newest first. */
export const sortedDescRows = [
  channelObject({ id: 'JSchannel-44510', createdAt: '2026-09-07T06:57:43.184534Z', eTag: 'y17aaa' }),
  channelObject({ id: 'JSchannel-33796', createdAt: '2026-09-07T06:57:42.868535Z', eTag: 'y17bbb' }),
  channelObject({ id: 'channel1', createdAt: '2026-08-12T17:16:24.004593Z', eTag: '3w5e1123mn7p0' }),
];

// --------------------------------------------------------
// -------------- Generic entities (Customer) -------------
// --------------------------------------------------------
// Captured from a live run of `entity.test.ts`. Unlike channels, the provisioned `Customer` class is
// sub-key scoped, so the service reports `entityClassLevel: 'SubKey'`.

/** Entity class the entity tests exercise. */
export const ENTITY_CLASS_CUSTOMER = 'Customer';

/** Opaque forward cursors the service returned for `entity_class=Customer&limit=2`. */
export const ENTITY_CURSOR_PAGE_2 = 'eyJpIjoiMTQzNTYzIiwic3YiOltdfQ';
export const ENTITY_CURSOR_PAGE_3 = 'eyJpIjoiMTQzNjEyIiwic3YiOltdfQ';

export type EntityResponseObject = DataSync.EntityObject & {
  entityClassLevel: 'Global' | 'SubKey';
};

/** The payload template `helpers.ts::customerPayload` seeds, as the service echoes it back. */
export const customerPayload = (id: string, overrides: Record<string, unknown> = {}) => ({
  customerId: id,
  firstName: 'Alice',
  lastName: 'Verma',
  email: 'alice.verma@acme.test',
  creditScore: 720,
  city: 'Pune',
  ...overrides,
});

/** One persisted `Customer`, with the server-owned fields the service always sends back. */
export const entityObject = (overrides: Partial<EntityResponseObject> = {}): EntityResponseObject => {
  const id = overrides.id ?? 'customer-43508';

  return {
    id,
    createdAt: '2026-09-07T07:25:20.309207Z',
    updatedAt: '2026-09-07T07:25:20.309207Z',
    eTag: 'y26s8e',
    expiresAt: '2027-09-08T00:00:00Z',
    entityClass: ENTITY_CLASS_CUSTOMER,
    entityClassVersion: CLASS_VERSION,
    entityClassLevel: 'SubKey',
    status: 'active',
    payload: customerPayload(id),
    ...overrides,
  };
};

/** Rows from the shared sub-key, trimmed to two per page (the live payloads carried 44). */
export const entityListPage1 = [
  entityObject({
    id: 'customer.001',
    createdAt: '2026-08-25T05:40:31.597366Z',
    updatedAt: '2026-08-25T05:40:31.597366Z',
    eTag: 'fdpwyu',
    expiresAt: '2027-08-26T00:00:00Z',
    payload: { customerId: 'customer.001', firstName: 'John', lastName: 'Doe' },
  }),
  entityObject({ id: 'customer.002', eTag: 'fdq1ab' }),
];

export const entityListPage2 = [
  entityObject({
    id: 'customer.004',
    createdAt: '2026-08-25T06:24:30.257591Z',
    updatedAt: '2026-08-25T06:30:42.074249Z',
    eTag: 'ffifwz',
    status: 'active-normal',
    expiresAt: '2027-08-26T00:00:00Z',
    payload: { customerId: 'customer.004', firstName: 'John', lastName: 'Doe' },
  }),
  entityObject({ id: 'customer.005', eTag: 'ffik3p' }),
];

/** Rows the service returns for `filter_fast=city == 'Pune'`. */
export const entityPuneRows = [
  entityObject({ id: 'customer-89286', eTag: 'fzaei0' }),
  entityObject({ id: 'customer-11204', eTag: 'fzahb7' }),
];

/** Rows the service returns for `sort=firstName:desc`, reverse-alphabetical by `firstName`. */
export const entitySortedDescRows = ['Zoe', 'Dan', 'Cara', 'Bella', 'Aaron'].map((firstName, index) =>
  entityObject({
    id: `customer-6681${index}`,
    eTag: `y2774${index}`,
    payload: customerPayload(`customer-6681${index}`, { firstName }),
  }),
);

// --------------------------------------------------------
// -------------------- Typed users -----------------------
// --------------------------------------------------------
// Captured from a live run of `user.test.ts`. The `User` class is globally scoped, so the service
// reports `entityClass: 'User'` / `entityClassLevel: 'Global'` — neither of which `UserObject`
// declares.

/** Opaque forward cursors the service returned for `limit=2` over `/users`. */
export const USER_CURSOR_PAGE_2 = 'eyJpIjoiMzQ5MSIsInN2IjpbXX0';
export const USER_CURSOR_PAGE_3 = 'eyJpIjoiMzQ5MyIsInN2IjpbXX0';

export type UserResponseObject = DataSync.UserObject & {
  entityClass: string;
  entityClassLevel: 'Global' | 'SubKey';
};

/** The payload template `helpers.ts::userPayload` seeds, as the service echoes it back. */
export const userPayload = (overrides: Record<string, unknown> = {}) => ({
  firstName: 'Alice',
  lastName: 'Verma',
  email: 'alice.verma@acme.test',
  ...overrides,
});

/** One persisted user, with the server-owned fields the service always sends back. */
export const userObject = (overrides: Partial<UserResponseObject> = {}): UserResponseObject => ({
  id: 'user-99961',
  createdAt: '2026-09-07T07:34:55.265874Z',
  updatedAt: '2026-09-07T07:34:55.265874Z',
  eTag: 'y2j3ve',
  expiresAt: '2026-10-08T00:00:00Z',
  entityClass: 'User',
  entityClassVersion: CLASS_VERSION,
  entityClassLevel: 'Global',
  status: 'active',
  payload: userPayload(),
  ...overrides,
});

/**
 * `{ error: true, status, service, message }` — the Access Manager envelope, which is shaped
 * differently from the DataSync `{ errors: [...] }` one and so is *not* flattened onto the message.
 */
export const accessDeniedError = { error: true, status: 403, service: 'Access Manager', message: 'Forbidden' };

/** Directory rows from the shared sub-key, trimmed to two per page. */
export const userListPage1 = [
  userObject({
    id: 'u.1',
    createdAt: '2026-08-12T17:10:27.831727Z',
    updatedAt: '2026-08-12T17:10:27.831727Z',
    eTag: '3w5e1123mfkn5',
    expiresAt: '2026-09-12T00:00:00Z',
    status: 'some-default-status',
    payload: { name: 'Regular User' },
  }),
  userObject({
    id: 'u.10',
    createdAt: '2026-08-13T03:13:51.834961Z',
    updatedAt: '2026-08-13T03:13:51.834961Z',
    eTag: '3w5e11247zjtq',
    expiresAt: '2026-09-13T00:00:00Z',
    status: 'some-default-status',
    payload: { name: 'Regular User' },
  }),
];

export const userListPage2 = [
  userObject({
    id: 'u.2',
    createdAt: '2026-08-13T03:15:09.537229Z',
    updatedAt: '2026-08-13T03:15:09.537229Z',
    eTag: '3w5e11248180n',
    expiresAt: '2026-09-13T00:00:00Z',
    status: 'some-default-status',
    payload: { name: 'Regular User' },
  }),
  userObject({
    id: 'u.smoke381469',
    createdAt: '2026-08-13T03:39:44.563570Z',
    updatedAt: '2026-08-13T03:39:44.563570Z',
    eTag: '3w5e11248wu4l',
    expiresAt: '2026-09-13T00:00:00Z',
    status: 'some-default-status',
    payload: { name: 'Smoke User' },
  }),
];

/** Rows the service would return for `filter=department == 'Engineering'`. */
export const userEngineeringRows = [
  userObject({ id: 'user-31445', eTag: 'y2ja11', payload: userPayload({ department: 'Engineering', isActive: true }) }),
  userObject({ id: 'user-88210', eTag: 'y2jb22', payload: userPayload({ department: 'Engineering', isActive: true }) }),
];

/** Rows the service would return for `sort=-createdAt`, newest first. */
export const userSortedDescRows = [
  userObject({ id: 'user-77301', createdAt: '2026-09-07T07:35:10.101010Z', eTag: 'y2jc33' }),
  userObject({ id: 'user-77302', createdAt: '2026-09-07T07:35:09.090909Z', eTag: 'y2jc34' }),
  userObject({ id: 'user-77303', createdAt: '2026-09-07T07:35:08.080808Z', eTag: 'y2jc35' }),
];

// --------------------------------------------------------
// ------------------- Memberships ------------------------
// --------------------------------------------------------
// Captured from a live run of `membership.test.ts`. A membership is a relationship, so its objects
// carry `relationshipClass` / `relationshipClassVersion` — and, on the REST axis, `channelId` and
// `userId` directly (the real-time event axis instead uses entityAId/entityBId). `MembershipObject`
// declares every field the service returns, so no type widening is needed here.

/** Opaque forward cursor the service returned for `user_id=…&limit=2`. */
export const MEMBERSHIP_CURSOR_PAGE_2 = 'eyJpIjoiNTM4MDMiLCJzdiI6W119';

/** The payload template `helpers.ts::membershipPayload` seeds, as the service echoes it back. */
export const membershipPayload = (overrides: Record<string, unknown> = {}) => ({
  role: 'member',
  joinedAt: '2026-07-06T10:00:00.000Z',
  ...overrides,
});

/** One persisted membership, with the server-owned fields the service always sends back. */
export const membershipObject = (overrides: Partial<DataSync.MembershipObject> = {}): DataSync.MembershipObject => ({
  id: 'membership-18116',
  createdAt: '2026-09-07T07:42:29.374143Z',
  updatedAt: '2026-09-07T07:42:29.374143Z',
  eTag: 'y2sto7',
  expiresAt: '2026-10-08T00:00:00Z',
  relationshipClass: 'Membership',
  relationshipClassVersion: CLASS_VERSION,
  channelId: 'JSchannel-46429',
  userId: 'user-97219',
  status: 'active',
  payload: membershipPayload(),
  ...overrides,
});

/**
 * Relationship-axis 404s (memberships and generic relationships alike) report
 * `Relationship '<id>' not found` — a different message from the `Entity not found: <id>` the
 * entity/channel/user endpoints use.
 */
export const relationshipNotFoundError = (id: string) => ({
  errors: [{ errorCode: 'DS-0100', message: `Relationship '${id}' not found` }],
});

/** Three memberships joining one user to three channels. */
export const membershipsOfUser = (userId: string) => [
  membershipObject({
    id: 'membership-59284',
    createdAt: '2026-09-07T07:42:49.138128Z',
    updatedAt: '2026-09-07T07:42:49.138128Z',
    eTag: 'y2t94b',
    channelId: 'JSchannel-77932',
    userId,
  }),
  membershipObject({
    id: 'membership-82938',
    createdAt: '2026-09-07T07:42:49.860587Z',
    updatedAt: '2026-09-07T07:42:49.860587Z',
    eTag: 'y2ta4d',
    channelId: 'JSchannel-99106',
    userId,
  }),
  membershipObject({
    id: 'membership-78351',
    createdAt: '2026-09-07T07:42:51.788892Z',
    updatedAt: '2026-09-07T07:42:51.788892Z',
    eTag: 'y2tb0l',
    channelId: 'JSchannel-57312',
    userId,
  }),
];

/** Three memberships joining three users to one channel. */
export const membershipsOfChannel = (channelId: string) => [
  membershipObject({ id: 'membership-31001', eTag: 'y2tc11', channelId, userId: 'user-31001' }),
  membershipObject({ id: 'membership-31002', eTag: 'y2tc22', channelId, userId: 'user-31002' }),
  membershipObject({ id: 'membership-31003', eTag: 'y2tc33', channelId, userId: 'user-31003' }),
];

/** Rows the service would return for `filter_fast=role == 'admin'`. */
export const membershipAdminRows = [
  membershipObject({ id: 'membership-41001', eTag: 'y2td11', payload: membershipPayload({ role: 'admin' }) }),
  membershipObject({ id: 'membership-41002', eTag: 'y2td22', payload: membershipPayload({ role: 'admin' }) }),
];

/** Rows the service would return for `sort=-createdAt`, newest first. */
export const membershipSortedDescRows = [
  membershipObject({ id: 'membership-51001', createdAt: '2026-09-07T07:43:10.303030Z', eTag: 'y2te11' }),
  membershipObject({ id: 'membership-51002', createdAt: '2026-09-07T07:43:09.202020Z', eTag: 'y2te22' }),
  membershipObject({ id: 'membership-51003', createdAt: '2026-09-07T07:43:08.101010Z', eTag: 'y2te33' }),
];

// --------------------------------------------------------
// --------------- Generic relationships ------------------
// --------------------------------------------------------
// Captured from a live run of `relationship.test.ts`. The provisioned class is `REQUESTED_BY`
// (Customer → LoanQuote); on the generic axis the two endpoints are `entityAId` / `entityBId` rather
// than membership's `channelId` / `userId`. `RelationshipObject` declares every field the service
// returns, so no type widening is needed here.

/** Relationship class the relationship tests exercise. */
export const RELATIONSHIP_CLASS_REQUESTED_BY = 'REQUESTED_BY';

/** Opaque forward cursor the service returned for `relationship_class=REQUESTED_BY&limit=2`. */
export const RELATIONSHIP_CURSOR_PAGE_2 = 'eyJpIjoiNTM4MTQiLCJzdiI6W119';

/** The payload template `helpers.ts::createRequestedByRelationship` seeds. */
export const relationshipPayload = (overrides: Record<string, unknown> = {}) => ({
  linkedAt: '2026-07-06T10:00:00.000Z',
  ...overrides,
});

/** One persisted relationship, with the server-owned fields the service always sends back. */
export const relationshipObject = (
  overrides: Partial<DataSync.RelationshipObject> = {},
): DataSync.RelationshipObject => ({
  id: 'requested-by-55620',
  createdAt: '2026-09-07T08:09:08.253170Z',
  updatedAt: '2026-09-07T08:09:08.253170Z',
  eTag: 'y3r3fa',
  expiresAt: '2027-09-08T00:00:00Z',
  relationshipClass: RELATIONSHIP_CLASS_REQUESTED_BY,
  relationshipClassVersion: CLASS_VERSION,
  entityAId: 'customer-20648',
  entityBId: 'loanquote-23500',
  status: 'active',
  payload: relationshipPayload(),
  ...overrides,
});

/** Rows the service returned for `relationship_class=REQUESTED_BY&limit=50`. */
export const relationshipClassRows = [
  relationshipObject({
    id: 'requested-by-61347',
    createdAt: '2026-08-25T15:45:28.218292Z',
    updatedAt: '2026-08-25T15:45:28.218292Z',
    eTag: 'fzbvo3',
    expiresAt: '2027-08-26T00:00:00Z',
    entityAId: 'customer-58155',
    entityBId: 'loanquote-80027',
  }),
  relationshipObject({
    id: 'requested-by-45358',
    createdAt: '2026-09-07T08:09:28.400984Z',
    updatedAt: '2026-09-07T08:09:28.400984Z',
    eTag: 'y3rjk9',
    entityAId: 'customer-13775',
    entityBId: 'loanquote-35280',
  }),
  relationshipObject({
    id: 'requested-by-95592',
    createdAt: '2026-09-07T08:09:29.522825Z',
    updatedAt: '2026-09-07T08:09:29.522825Z',
    eTag: 'y3rk6j',
    entityAId: 'customer-36568',
    entityBId: 'loanquote-72482',
  }),
];

/** Page 1 / page 2 as the service returned them for `limit=2`, split by `RELATIONSHIP_CURSOR_PAGE_2`. */
export const relationshipListPage1 = [
  relationshipClassRows[0],
  relationshipObject({
    id: 'requested-by-87790',
    createdAt: '2026-09-07T08:09:36.952826Z',
    updatedAt: '2026-09-07T08:09:36.952826Z',
    eTag: 'y3rpip',
    entityAId: 'customer-53840',
    entityBId: 'loanquote-61308',
  }),
];

export const relationshipListPage2 = [
  relationshipObject({
    id: 'requested-by-36143',
    createdAt: '2026-09-07T08:09:38.079363Z',
    updatedAt: '2026-09-07T08:09:38.079363Z',
    eTag: 'y3rr14',
    entityAId: 'customer-70165',
    entityBId: 'loanquote-48372',
  }),
  relationshipObject({
    id: 'requested-by-83824',
    createdAt: '2026-09-07T08:09:39.314724Z',
    updatedAt: '2026-09-07T08:09:39.314724Z',
    eTag: 'y3rrqj',
    entityAId: 'customer-82952',
    entityBId: 'loanquote-44983',
  }),
];

/**
 * Rows for an `entity_a_id` / `entity_b_id` filtered list. Derived from `get-all.ts` plus the row
 * shape above rather than captured: the live `filter by entityAId` test failed while seeding its
 * Customer entity, so its list request was never sent.
 */
export const relationshipsOfEntityA = (entityAId: string) => [
  relationshipObject({ id: 'requested-by-71001', eTag: 'y3s011', entityAId, entityBId: 'loanquote-71001' }),
  relationshipObject({ id: 'requested-by-71002', eTag: 'y3s022', entityAId, entityBId: 'loanquote-71002' }),
];

export const relationshipsOfEntityB = (entityBId: string) => [
  relationshipObject({ id: 'requested-by-72001', eTag: 'y3s111', entityAId: 'customer-72001', entityBId }),
  relationshipObject({ id: 'requested-by-72002', eTag: 'y3s122', entityAId: 'customer-72002', entityBId }),
];

/** Rows the service would return for `filter_fast=linkedAt == '2026-07-06T10:00:00.000Z'`. */
export const relationshipLinkedRows = [
  relationshipObject({ id: 'requested-by-73001', eTag: 'y3s211' }),
  relationshipObject({ id: 'requested-by-73002', eTag: 'y3s222' }),
];

/** Rows the service would return for `sort=createdAt:desc`, newest first. */
export const relationshipSortedDescRows = [
  relationshipObject({ id: 'requested-by-74001', createdAt: '2026-09-07T08:09:40.303030Z', eTag: 'y3s311' }),
  relationshipObject({ id: 'requested-by-74002', createdAt: '2026-09-07T08:09:39.202020Z', eTag: 'y3s322' }),
  relationshipObject({ id: 'requested-by-74003', createdAt: '2026-09-07T08:09:38.101010Z', eTag: 'y3s333' }),
];
