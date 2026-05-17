import { INestApplication } from '@nestjs/common';
import * as http from 'http';

/**
 * Lightweight HTTP helper for E2E tests — no extra dependencies needed.
 * Works directly with the NestJS app's underlying HTTP server.
 */
export class TestHttpClient {
  private baseUrl: string;

  constructor(private readonly app: INestApplication) {
    const server = this.app.getHttpServer();
    if (!server.listening) {
      server.listen(0);
    }
    const address = server.address();
    const port = typeof address === 'object' ? address!.port : address;
    this.baseUrl = `http://127.0.0.1:${port}`;
  }

  async request(
    method: string,
    path: string,
    options: {
      body?: unknown;
      headers?: Record<string, string>;
      rawBody?: Buffer;
    } = {},
  ): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const payload: BodyInit | undefined = options.rawBody
      ? new Uint8Array(options.rawBody)
      : options.body
        ? JSON.stringify(options.body)
        : undefined;

    if (options.rawBody) {
      headers['Content-Type'] = 'application/octet-stream';
    }

    const response = await fetch(url, {
      method,
      headers,
      body: payload,
    });

    const text = await response.text();
    let body: any;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }

    return { status: response.status, body, headers: Object.fromEntries(response.headers.entries()) };
  }

  post(path: string, body?: unknown, headers?: Record<string, string>) {
    return this.request('POST', path, { body, headers });
  }

  get(path: string, headers?: Record<string, string>) {
    return this.request('GET', path, { headers });
  }

  patch(path: string, body?: unknown, headers?: Record<string, string>) {
    return this.request('PATCH', path, { body, headers });
  }

  delete(path: string, headers?: Record<string, string>) {
    return this.request('DELETE', path, { headers });
  }
}
