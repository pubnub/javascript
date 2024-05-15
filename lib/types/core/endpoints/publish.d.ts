/**
 * Publish REST API module.
 */
import { CryptoModule } from '../interfaces/crypto-module';
import { Payload } from '../types/api';
/**
 * Request configuration parameters.
 */
export type PublishParameters = {
    /**
     * Channel name to publish messages to.
     */
    channel: string;
    /**
     * Data which should be sent to the `channel`.
     *
     * The message may be any valid JSON type including objects, arrays, strings, and numbers.
     */
    message: Payload;
    /**
     * Whether published data should be available with `Storage API` later or not.
     *
     * @default `true`
     */
    storeInHistory?: boolean;
    /**
     * Whether message should be sent as part of request POST body or not.
     *
     * @default `false`
     */
    sendByPost?: boolean;
    /**
     * Metadata, which should be associated with published data.
     *
     * Associated metadata can be utilized by message filtering feature.
     */
    meta?: Payload;
    /**
     * Specify duration during which data will be available with `Storage API`.
     *
     * - If `storeInHistory` = `true`, and `ttl` = `0`, the `message` is stored with no expiry time.
     * - If `storeInHistory` = `true` and `ttl` = `X` (`X` is an Integer value), the `message` is
     * stored with an expiry time of `X` hours.
     * - If `storeInHistory` = `false`, the `ttl` parameter is ignored.
     * - If `ttl` is not specified, then expiration of the `message` defaults back to the expiry value
     * for the key.
     */
    ttl?: number;
    /**
     * Whether published data should be replicated across all data centers or not.
     *
     * @default `true`
     * @deprecated
     */
    replicate?: boolean;
    /**
     * Indexed signature for deprecated parameters.
     */
    [key: string]: string | number | boolean | undefined | Payload | CryptoModule;
};
/**
 * Service success response.
 */
export type PublishResponse = {
    /**
     * High-precision time when published data has been received by the PubNub service.
     */
    timetoken: string;
};
