/// <reference types="node" />
/// <reference types="node" />
import { ProxyAgentOptions } from 'proxy-agent';
import { Readable } from 'stream';
import { Buffer } from 'buffer';
import type { CryptoModule as CryptoModuleType } from '../crypto/modules/NodeCryptoModule/nodeCryptoModule';
import PubNubFile, { PubNubFileParameters } from '../file/modules/node';
import { PubNubConfiguration } from './configuration';
import { PubNubFileConstructor } from '../core/types/file';
import { PubNubCore } from '../core/pubnub-common';
/**
 * PubNub client for Node.js platform.
 */
declare class PubNub extends PubNubCore<string | ArrayBuffer | Buffer | Readable, PubNubFileParameters, PubNubFile> {
    /**
     * Data encryption / decryption module constructor.
     */
    static CryptoModule: typeof CryptoModuleType;
    /**
     * PubNub File constructor.
     */
    File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>;
    /**
     * Actual underlying transport provider.
     */
    private nodeTransport;
    constructor(configuration: PubNubConfiguration);
    /**
     * Update request proxy configuration.
     *
     * @param configuration - Updated request proxy configuration.
     *
     * @throws An error if {@link PubNub} client already configured to use `keepAlive`.
     * `keepAlive` and `proxy` can't be used simultaneously.
     */
    setProxy(configuration?: ProxyAgentOptions): void;
}
export = PubNub;
