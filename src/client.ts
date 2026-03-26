import { createHmac } from "node:crypto";

export class TradernetClient {
  constructor(
    private readonly publicKey: string,
    private readonly privateKey: string,
    private readonly host: string = "freedom24.com",
  ) {}

  static fromEnv(): TradernetClient {
    const publicKey = process.env.TRADERNET_PUBLIC_KEY;
    const privateKey = process.env.TRADERNET_PRIVATE_KEY;
    const host = process.env.TRADERNET_HOST ?? "freedom24.com";

    if (!publicKey || !privateKey) {
      throw new Error(
        "TRADERNET_PUBLIC_KEY and TRADERNET_PRIVATE_KEY environment variables are required",
      );
    }

    return new TradernetClient(publicKey, privateKey, host);
  }

  async callV1(
    cmd: string,
    params: Record<string, unknown>,
  ): Promise<unknown> {
    const q = JSON.stringify({ cmd, params });
    const url = `https://${this.host}/api/?q=${encodeURIComponent(q)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-NtApi-PublicKey": this.publicKey,
        "X-NtApi-Timestamp": Math.floor(Date.now() / 1000).toString(),
        "X-NtApi-Sig": this.sign(q),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    return res.json();
  }

  async callV2(
    cmd: string,
    params: Record<string, unknown>,
  ): Promise<unknown> {
    const body = JSON.stringify(params);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const sig = this.sign(body + timestamp);

    const url = `https://${this.host}/api/v2/cmd/${cmd}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-NtApi-PublicKey": this.publicKey,
        "X-NtApi-Timestamp": timestamp,
        "X-NtApi-Sig": sig,
      },
      body,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    return res.json();
  }

  fetchOrderBook(
    ticker: string,
    timeoutMs: number = 3000,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const wsHost = this.host === "freedom24.com"
        ? "wss.freedom24.com"
        : `wss.${this.host}`;
      const ws = new WebSocket(`wss://${wsHost}/`);
      let settled = false;

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          ws.close();
          reject(new Error(`Order book timeout after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      ws.addEventListener("open", () => {
        ws.send(JSON.stringify(["orderBook", [ticker]]));
      });

      ws.addEventListener("message", (event) => {
        try {
          const msg = JSON.parse(String(event.data));
          if (Array.isArray(msg) && msg[0] === "b") {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              ws.close();
              resolve(msg[1]);
            }
          }
        } catch {
          // ignore non-JSON messages
        }
      });

      ws.addEventListener("error", (err) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          ws.close();
          reject(new Error(`WebSocket error: ${err}`));
        }
      });
    });
  }

  private sign(data: string): string {
    return createHmac("sha256", this.privateKey)
      .update(data)
      .digest("hex");
  }
}
