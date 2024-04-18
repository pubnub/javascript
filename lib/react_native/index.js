import { TextEncoder, TextDecoder } from 'text-encoding';
import 'react-native-url-polyfill/auto';
import CborReader from 'cbor-js';
import { Buffer } from 'buffer';
import { stringifyBufferKeys } from '../core/components/stringify_buffer_keys';
import { WebReactNativeTransport } from '../transport/web-react-native-transport';
import { makeConfiguration } from '../core/components/configuration';
import { TokenManager } from '../core/components/token_manager';
import { PubNubMiddleware } from '../transport/middleware';
import { decode } from '../core/components/base64_codec';
import PubNubFile from '../file/modules/react-native';
import Crypto from '../core/components/cryptography';
import { PubNubCore } from '../core/pubnub-common';
import { setDefaults } from './configuration';
import Cbor from '../cbor/common';
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;
global.Buffer = global.Buffer || Buffer;
export default class PubNub extends PubNubCore {
    constructor(configuration) {
        const configurationCopy = setDefaults(configuration);
        const platformConfiguration = Object.assign(Object.assign({}, configurationCopy), { sdkFamily: 'ReactNative', PubNubFile });
        const clientConfiguration = makeConfiguration(platformConfiguration);
        const tokenManager = new TokenManager(new Cbor((arrayBuffer) => stringifyBufferKeys(CborReader.decode(arrayBuffer)), decode));
        let crypto;
        if (clientConfiguration.getCipherKey() || clientConfiguration.secretKey) {
            crypto = new Crypto({
                secretKey: clientConfiguration.secretKey,
                cipherKey: clientConfiguration.getCipherKey(),
                useRandomIVs: clientConfiguration.getUseRandomIVs(),
                customEncrypt: clientConfiguration.getCustomEncrypt(),
                customDecrypt: clientConfiguration.getCustomDecrypt(),
            });
        }
        const transportMiddleware = new PubNubMiddleware({
            clientConfiguration,
            tokenManager,
            transport: new WebReactNativeTransport(clientConfiguration.keepAlive, clientConfiguration.logVerbosity),
        });
        super({
            configuration: clientConfiguration,
            transport: transportMiddleware,
            tokenManager,
            crypto,
        });
    }
}
