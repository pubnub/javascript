export type TransportResponse = {
    url: string;
    status: number;
    headers: Record<string, string>;
    body?: ArrayBuffer;
};
