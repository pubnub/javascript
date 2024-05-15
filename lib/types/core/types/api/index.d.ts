import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import StatusCategory from '../../constants/categories';
export type KeySet = {
    subscribeKey: string;
    publishKey?: string;
    secretKey?: string;
};
export type SendRequestFunction<ResponseType> = (request: AbstractRequest<ResponseType>, callback?: ResultCallback<ResponseType>) => Promise<ResponseType | void>;
export type ResultCallback<ResponseType> = (status: Status, response: ResponseType | null) => void;
export type StatusCallback = (status: Status) => void;
export type Status = {
    error: boolean;
    category: StatusCategory;
    operation?: RequestOperation;
    statusCode: number;
    errorData?: Error | Payload;
    [p: string]: Payload | Error | undefined;
};
export type StatusEvent = {
    category: StatusCategory;
    operation?: RequestOperation;
    error?: string | boolean;
    affectedChannels?: string[];
    subscribedChannels?: string[];
    affectedChannelGroups?: string[];
    lastTimetoken?: number | string;
    currentTimetoken?: number | string;
};
export type Query = Record<string, string | number | (string | number)[]>;
export type Payload = string | number | boolean | {
    [key: string]: Payload | null;
} | Payload[];
