/**
 * Lets a docs sample that carries a placeholder literal run with its text unchanged. Examples: a token such as
 * 'use-token-string-generated-by-grantToken()', a file id such as '...', a timetoken such as 'replace-with-start-timetoken'.
 *
 * `withPlaceholders(client, { placeholder: liveValue })` returns the client wrapped so that every string argument equal to a key
 * of `values`, also inside arrays and plain-object arguments, is replaced by the live value before the call reaches the SDK.
 * Nothing else changes. Only the methods of the client itself are wrapped, not the ones of `client.objects` and the like.
 */
import type PubNub from 'pubnub';

function substitute(value: unknown, values: Record<string, string>): unknown {
  if (typeof value === 'string') return Object.prototype.hasOwnProperty.call(values, value) ? values[value] : value;
  if (Array.isArray(value)) return value.map((item) => substitute(item, values));
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, substitute(item, values)]));
  }
  return value;
}

export function withPlaceholders<T extends PubNub>(client: T, values: Record<string, string>): T {
  return new Proxy(client, {
    get(target, property) {
      const member = (target as unknown as Record<string | symbol, unknown>)[property];
      if (typeof member !== 'function') return member;
      return (...args: unknown[]) =>
        (member as (...a: unknown[]) => unknown).apply(
          target,
          args.map((arg) => substitute(arg, values)),
        );
    },
  });
}
