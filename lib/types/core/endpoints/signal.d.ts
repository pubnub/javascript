/**
 * Signal REST API module.
 */
import { Payload } from '../types/api';
/**
 * Request configuration parameters.
 */
export type SignalParameters = {
    /**
     * Channel name to publish signal to.
     */
    channel: string;
    /**
     * Data which should be sent to the `channel`.
     *
     * The message may be any valid JSON type including objects, arrays, strings, and numbers.
     */
    message: Payload;
};
/**
 * Service success response.
 */
export type SignalResponse = {
    /**
     * High-precision time when published data has been received by the PubNub service.
     */
    timetoken: string;
};
