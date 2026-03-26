import { createHmac } from "node:crypto";

const ALLOWED_HOSTS = new Set([
  "freedom24.com",
  "tradernet.com",
  "freedom24.de",
  "freedom24.fr",
  "freedom24.es",
]);

const ALLOWED_V1_COMMANDS = new Set([
  "getSecurityInfo",
  "tickerFinder",
  "getHloc",
  "getAlertsList",
  "togglePriceAlert",
]);

const ALLOWED_V2_COMMANDS = new Set([
  "getPositionJson",
  "getNotifyOrderJson",
  "putTradeOrder",
  "delTradeOrder",
  "putStopLoss",
]);

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

    if (!ALLOWED_HOSTS.has(host)) {
      throw new Error(
        `TRADERNET_HOST "${host}" is not allowed. Allowed hosts: ${[...ALLOWED_HOSTS].join(", ")}`,
      );
    }

    return new TradernetClient(publicKey, privateKey, host);
  }

  async callV1(
    cmd: string,
    params: Record<string, unknown>,
  ): Promise<unknown> {
    if (!ALLOWED_V1_COMMANDS.has(cmd)) {
      throw new Error(`V1 command "${cmd}" is not allowed`);
    }

    const q = JSON.stringify({ cmd, params });
    const url = `https://${this.host}/api/?q=${encodeURIComponent(q)}`;

    const timestamp = Math.floor(Date.now() / 1000).toString();

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-NtApi-PublicKey": this.publicKey,
        "X-NtApi-Timestamp": timestamp,
        "X-NtApi-Sig": this.sign(timestamp),
      },
    });

    if (!res.ok) {
      throw new Error(`API error: ${cmd} returned HTTP ${res.status}`);
    }

    return res.json();
  }

  async callV2(
    cmd: string,
    params: Record<string, unknown>,
  ): Promise<unknown> {
    if (!ALLOWED_V2_COMMANDS.has(cmd)) {
      throw new Error(`V2 command "${cmd}" is not allowed`);
    }

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
      throw new Error(`API error: ${cmd} returned HTTP ${res.status}`);
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

      ws.addEventListener("error", () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          ws.close();
          reject(new Error(`WebSocket connection failed for ${ticker}`));
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
