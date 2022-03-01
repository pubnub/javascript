export type Cursor = { timetoken: string; region?: number };

export type HandshakeEndpointResponse = Cursor;

export type ReceiveEndpointResponse = {
  metadata: Cursor;
  messages: EventEnvelope[];
};

export type EventEnvelope = {
  a: string;
  b?: string;
  c: string;
  d: any;
  e?: 0 | 1 | 2 | 3 | 4 | undefined;
  f: number;
  i: string;
  k: string;
  o?: Cursor;
  p: Cursor;
  u?: any;
};
