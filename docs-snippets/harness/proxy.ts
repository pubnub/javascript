import http from 'node:http';
import net from 'node:net';
import type { AddressInfo } from 'node:net';

/**
 * Local HTTP CONNECT proxy on 127.0.0.1 (`setProxy`). It tunnels to the real host and
 * counts CONNECT requests, so a step can prove traffic went through the proxy and stopped after `setProxy()`.
 * `outage(true)` refuses new tunnels and destroys open ones, for the later status-event steps.
 */
// An HTTP CONNECT proxy is enough because the SDK talks TLS to the service. The proxy never sees plaintext, it only pipes bytes.
// `http.createServer` rejects plain requests with 405 for the same reason.
export class LocalProxy {
  private server?: http.Server;
  private sockets = new Set<net.Socket>();
  private blocked = false;
  connects = 0;
  port = 0;
  readonly host = '127.0.0.1';

  /** Listens on an ephemeral port (`listen(0)`), so parallel runs never collide. Idempotent. */
  async start(): Promise<void> {
    if (this.server) return;
    this.server = http.createServer((_req, res) => {
      res.writeHead(405).end('CONNECT only');
    });
    this.server.on('connect', (req, clientSocket: net.Socket, head) => {
      this.connects += 1;
      if (this.blocked) {
        clientSocket.end('HTTP/1.1 503 Service Unavailable\r\n\r\n');
        return;
      }
      const [hostname, port] = (req.url ?? '').split(':');
      const upstream = net.connect(Number(port) || 443, hostname, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        upstream.write(head);
        upstream.pipe(clientSocket);
        clientSocket.pipe(upstream);
      });
      // Track both ends so `outage(true)` and `stop()` can cut established tunnels, which a refused new CONNECT would not.
      this.sockets.add(clientSocket);
      this.sockets.add(upstream);
      const drop = (): void => {
        this.sockets.delete(clientSocket);
        this.sockets.delete(upstream);
        clientSocket.destroy();
        upstream.destroy();
      };
      upstream.on('error', drop);
      clientSocket.on('error', drop);
      upstream.on('close', drop);
      clientSocket.on('close', drop);
    });
    await new Promise<void>((resolve) => this.server!.listen(0, this.host, resolve));
    this.port = (this.server.address() as AddressInfo).port;
  }

  /** Spread into `setProxy({...})` to point a snippet at this proxy. */
  get config(): Partial<{ hostname: string; port: number; protocol: string }> {
    return { hostname: this.host, port: this.port, protocol: 'http' };
  }

  /** Simulates a network outage: refuses new tunnels with 503 and cuts the open ones, so the SDK reports an unexpected disconnect. */
  outage(on: boolean): void {
    this.blocked = on;
    if (on) for (const socket of this.sockets) socket.destroy();
  }

  async stop(): Promise<void> {
    for (const socket of this.sockets) socket.destroy();
    this.sockets.clear();
    const server = this.server;
    this.server = undefined;
    if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
