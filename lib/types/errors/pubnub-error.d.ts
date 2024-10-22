/**
 * PubNub operation error module.
 *
 * @internal
 */
/**
 * PubNub operation error.
 *
 * When an operation can't be performed or there is an error from the server, this object will be returned.
 */
export declare class PubNubError extends Error {
    status?: Status | undefined;
}
