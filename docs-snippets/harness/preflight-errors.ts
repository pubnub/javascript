/**
 * Role: used by preflight.ts to produce the failure message, and by the dry run to test every cause without a network.
 *
 * Turns an SDK error from a preflight call into one named cause. Before this, every failure read "the keyset does not
 * have <feature>", which was wrong for a mistyped key or an offline laptop.
 *
 * Causes, in the order they are tested:
 *  - network: no HTTP status, or a network and timeout category. Nothing is wrong with the keyset.
 *  - bad-key: HTTP 400 or 401 whose service message names the key, or 401. Check the variable that holds the key.
 *  - feature-off: HTTP 403. The key is fine and the portal feature is off (or Access Manager needs a token).
 *  - bad-request: any other 400. Not a missing feature. Look at the service message.
 *  - unknown: anything else.
 */

export type PreflightCause = 'network' | 'bad-key' | 'feature-off' | 'bad-request' | 'unknown';

interface SdkLikeError {
  message?: string;
  code?: string;
  status?: { category?: string; statusCode?: number; errorData?: unknown; message?: string };
}

const NETWORK_CATEGORIES = new Set(['PNNetworkIssuesCategory', 'PNNetworkDownCategory', 'PNTimeoutCategory', 'PNConnectionErrorCategory']);
const NETWORK_CODES = new Set(['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'EHOSTUNREACH']);

function serviceText(error: SdkLikeError): string {
  const data = error.status?.errorData;
  let text = '';
  try {
    text = typeof data === 'string' ? data : JSON.stringify(data ?? '');
  } catch {
    text = String(data);
  }
  return `${text} ${error.status?.message ?? ''} ${error.message ?? ''}`;
}

export function classifyPreflightError(error: unknown): { cause: PreflightCause; detail: string } {
  const e = (error ?? {}) as SdkLikeError;
  const code = e.status?.statusCode;
  const category = e.status?.category;
  const text = serviceText(e);
  const detail = [category, code, e.message].filter(Boolean).join(' ');
  if ((category && NETWORK_CATEGORIES.has(category)) || (e.code && NETWORK_CODES.has(e.code)) || (code === undefined && /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|network|fetch failed|timed out/i.test(text))) {
    return { cause: 'network', detail };
  }
  if (code === 401 || ((code === 400 || code === 403) && /invalid (subscribe |publish )?key|invalid subscribe|invalid publish|key.*not found|no such key|invalid.*subscribe.?key/i.test(text))) {
    return { cause: 'bad-key', detail };
  }
  if (code === 403) return { cause: 'feature-off', detail };
  if (code === 400) return { cause: 'bad-request', detail };
  return { cause: 'unknown', detail };
}

/** The message a failed preflight throws. `feature` and `setting` are used only when the cause is a missing feature. */
export function preflightMessage(
  error: unknown,
  keyset: 'open' | 'pam' | 'datasync',
  feature: string,
  setting: string,
): string {
  const { cause, detail } = classifyPreflightError(error);
  const vars = keyset === 'open' ? 'PUBLISH_KEY and SUBSCRIBE_KEY' : keyset === 'pam' ? 'PAM_PUBLISH_KEY, PAM_SUBSCRIBE_KEY and PAM_SECRET_KEY' : 'DS_PUBLISH_KEY, DS_SUBSCRIBE_KEY and DS_SECRET_KEY';
  switch (cause) {
    case 'network':
      return `Network problem, not a keyset problem: PubNub could not be reached while checking ${feature} on the ${keyset} keyset. Check connectivity and proxy settings, then rerun. ${detail}`;
    case 'bad-key':
      return `The ${keyset} keyset keys were rejected, so the keys are wrong or belong to another keyset. Check ${vars}. ${detail}`;
    case 'feature-off':
      return `The ${keyset} keyset does not have ${feature}. The keys work. Enable "${setting}" for this keyset in the Admin Portal (see docs-snippets/README.md, "Keysets"). ${detail}`;
    case 'bad-request':
      return `The service answered 400 while checking ${feature} on the ${keyset} keyset. That is not a missing feature, so look at the service message first. ${detail}`;
    default:
      return `Could not verify ${feature} on the ${keyset} keyset (unclassified error). ${detail}`;
  }
}
