import { UserConfiguration, ExtendedConfiguration } from '../core/interfaces/configuration';
import { TransportKeepAlive } from '../core/interfaces/transport';
import { Payload } from '../core/types/api';
import { CryptoModule } from '../core/interfaces/crypto-module';
export type PubNubConfiguration = UserConfiguration & {
    keepAliveSettings?: TransportKeepAlive;
    cryptoModule?: CryptoModule;
    cipherKey?: string;
    useRandomIVs?: boolean;
    customEncrypt?: (data: string | Payload) => string;
    customDecrypt?: (data: string) => string;
};
export declare const setDefaults: (configuration: PubNubConfiguration) => PubNubConfiguration & ExtendedConfiguration;
