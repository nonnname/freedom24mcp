import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TradernetClient } from "../client.js";

export function registerMarketDataTools(
  server: McpServer,
  client: TradernetClient,
): void {
  server.registerTool(
    "get_security_info",
    {
      description: "Get detailed info about a security (ticker, name, currency, min step, etc.)",
      inputSchema: { ticker: z.string().describe("Instrument ticker, e.g. AAPL.US") },
      annotations: { readOnlyHint: true },
    },
    async ({ ticker }) => {
      try {
        const result = await client.callApi("getSecurityInfo", {
          ticker,
          sup: true,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
        };
      }
    },
  );

  server.registerTool(
    "search_ticker",
    {
      description: "Search for securities by name or ticker symbol",
      inputSchema: {
        text: z
          .string()
          .describe("Search query: ticker or name, e.g. 'AAPL' or 'Apple'"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ text }) => {
      try {
        const result = await client.callApi("tickerFinder", { text });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
        };
      }
    },
  );

  server.registerTool(
    "get_candles",
    {
      description: "Get OHLCV candlestick data for a security",
      inputSchema: {
        ticker: z.string().describe("Instrument ticker, e.g. AAPL.US"),
        timeframe: z
          .enum(["1", "5", "15", "60", "1440"])
          .describe("Candle interval in minutes: 1, 5, 15, 60 (1h), 1440 (1d)"),
        date_from: z
          .string()
          .describe("Start date in DD.MM.yyyy hh:mm format"),
        date_to: z
          .string()
          .describe("End date in DD.MM.yyyy hh:mm format"),
        count: z
          .number()
          .int()
          .optional()
          .default(-1)
          .describe("Number of extra candles, -1 for none"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ ticker, timeframe, date_from, date_to, count }) => {
      try {
        const result = await client.callApi("getHloc", {
          id: ticker,
          count,
          timeframe: Number(timeframe),
          date_from,
          date_to,
          intervalMode: "ClosedRay",
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
        };
      }
    },
  );

  server.registerTool(
    "get_order_book",
    {
      description: "Get current order book (market depth) for a security via WebSocket",
      inputSchema: {
        ticker: z.string().describe("Instrument ticker, e.g. AAPL.US"),
        timeout_ms: z
          .number()
          .int()
          .min(500)
          .max(30000)
          .optional()
          .default(3000)
          .describe("Timeout in milliseconds to wait for data (500–30000)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ ticker, timeout_ms }) => {
      try {
        const result = await client.fetchOrderBook(ticker, timeout_ms);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
        };
      }
    },
  );
}
