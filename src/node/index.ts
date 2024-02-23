import CborReader from 'cbor-sync';
import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import Cbor from '../cbor/common';
import { decode } from '../core/components/base64_codec';
import { del, get, patch, post, getfile, postfile } from '../networking/modules/web-node';
import { keepAlive, proxy } from '../networking/modules/node';

import NodeCryptography from '../crypto/modules/node';
import PubNubFile from '../file/modules/node';
import { CryptoModule, LegacyCryptor, AesCbcCryptor } from '../crypto/modules/NodeCryptoModule/nodeCryptoModule';
import { NodeTransport } from '../transport/node-transport';
import { NodeConfiguration, PrivateNodeConfigurationOptions } from './configuration';

export = class extends PubNubCore {
  static CryptoModule = CryptoModule;
  constructor(setup: Exclude<NodeConfiguration, PrivateNodeConfigurationOptions>) {
    setup.cbor = new Cbor((buffer: ArrayBuffer) => CborReader.decode(Buffer.from(buffer)), decode);
    setup.networking = new Networking({
      keepAlive,
      del,
      get,
      post,
      patch,
      proxy,
      getfile,
      postfile,
    });
    setup.sdkFamily = 'Nodejs';

    setup.PubNubFile = PubNubFile;
    setup.cryptography = new NodeCryptography();

    setup.initCryptoModule = (cryptoConfiguration: any) => {
      return new CryptoModule({
        default: new LegacyCryptor({
          cipherKey: cryptoConfiguration.cipherKey,
          useRandomIVs: cryptoConfiguration.useRandomIVs,
        }),
        cryptors: [new AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
      });
    };

    if (!('ssl' in setup)) {
      setup.ssl = true;
    }

    {
      const { keepAlive, keepAliveSettings } = setup;
      const network = new NodeTransport(keepAlive, keepAliveSettings);
    }

    super(setup);
  }
};
