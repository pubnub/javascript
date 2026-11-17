import type PubNub from 'pubnub';

/**
 * The four fragment blocks of the DataSync page (docs/sdks/javascript/api-reference/datasync.md), one object per docs
 * line. The docs show these as bare option lines (`filterFast: 'price < 100'`) inside prose, so they cannot be a
 * snippet: several lines repeat the same key and are not statements. They stay hardcoded in the docs and this file
 * keeps them honest in two ways.
 *
 * 1. Types: every entry is typed against the real SDK parameter types, so a renamed option or a `sort` shape the SDK
 *    no longer accepts breaks `npm run test:docs-snippets:types`.
 * 2. Behaviour: the
 *    live check `datasyncFragments` (api-reference/datasync.ts) sends each entry to the service.
 *
 * Keep each entry on one line, written exactly like the docs line without its trailing comment. The text check
 * relies on that.
 */

// Sneaker Drop context: `price`, `stock`, `status` and `name` are fields of the provisioned `product` class (provision/).
type Query = PubNub.DataSync.GetEntitiesParameters;
type Patch = PubNub.DataSync.UpdateEntityParameters;

/** Block "Some examples" (filter and filterFast expressions). */
export const filterFragments: Array<Pick<Query, 'filter' | 'filterFast'>> = [
  { filterFast: 'price < 100' },
  { filterFast: '(price < 100 && stock > 0) || price > 500' },
  { filter: 'name LIKE "*sneaker*"' },
  { filter: '!(status == "discontinued")' },
];

/** The two `sort` blocks: object form first, then the raw string form. */
export const sortFragments: Array<Pick<Query, 'sort'>> = [
  { sort: { price: 'desc' } },
  { sort: { type: 'asc', price: 'desc' } },
  { sort: { createdAt: null } },
  { sort: 'price:desc' },
  { sort: 'type,price:desc' },
  { sort: 'createdAt' },
];

/** Block "Correct patch forms" (JSON Patch maps of `update*`). */
export const patchFragments: Array<Pick<Patch, 'add' | 'replace' | 'remove' | 'move' | 'copy' | 'test'>> = [
  { add: { '/payload/tags/0': 'featured' } },
  { replace: { '/payload/price': 79.99 } },
  { remove: ['/payload/tempFlag', '/payload/legacy/field'] },
  { move: [{ from: '/payload/legacyName', path: '/payload/displayName' }] },
  { copy: [{ from: '/payload/displayName', path: '/payload/previousName' }] },
  { test: { '/status': 'active' } },
];
