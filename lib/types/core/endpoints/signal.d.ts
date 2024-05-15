import { Payload } from '../types/api';
export type SignalParameters = {
    channel: string;
    message: Payload;
};
export type SignalResponse = {
    timetoken: string;
};
