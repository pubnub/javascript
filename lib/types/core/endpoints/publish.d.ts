import { CryptoModule } from '../interfaces/crypto-module';
import { Payload } from '../types/api';
export type PublishParameters = {
    channel: string;
    message: Payload;
    storeInHistory?: boolean;
    sendByPost?: boolean;
    meta?: Payload;
    ttl?: number;
    replicate?: boolean;
    [key: string]: string | number | boolean | undefined | Payload | CryptoModule;
};
export type PublishResponse = {
    timetoken: string;
};
