/// <reference types="node" />
/// <reference types="node" />
import { ProxyAgentOptions } from 'proxy-agent';
import { Readable } from 'stream';
import { Buffer } from 'buffer';
import { CryptoModule } from '../crypto/modules/NodeCryptoModule/nodeCryptoModule';
import PubNubFile, { PubNubFileParameters } from '../file/modules/node';
import { PubNubConfiguration } from './configuration';
import { PubNubFileConstructor } from '../core/types/file';
import { PubNubCore } from '../core/pubnub-common';
declare class PubNub extends PubNubCore<string | ArrayBuffer | Buffer | Readable, PubNubFileParameters, PubNubFile> {
    static CryptoModule: typeof CryptoModule;
    File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>;
    private nodeTransport;
    constructor(configuration: PubNubConfiguration);
    setProxy(configuration?: ProxyAgentOptions): void;
}
export = PubNub;
