import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TradernetClient } from "../client.js";

export function registerAlertTools(
  server: McpServer,
  client: TradernetClient,
): void {
  server.registerTool(
    "get_alerts",
    {
      description: "List active price alerts, optionally filtered by ticker",
      inputSchema: {
        ticker: z
          .string()
          .optional()
          .describe("Filter by ticker, e.g. AAPL.US. Omit for all alerts."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ ticker }) => {
      try {
        const result = await client.callApi("getAlertsList", {
          ticker: ticker ?? null,
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
    "add_price_alert",
    {
      description: "Create a new price alert for a security",
      inputSchema: {
        ticker: z.string().describe("Instrument ticker, e.g. AAPL.US"),
        price: z.number().describe("Alert trigger price"),
        trigger_type: z
          .enum([
            "crossing",
            "less_then",
            "greater_then",
            "channel_in",
            "channel_out",
            "moving_up_from_current",
            "moving_down_from_current",
            "moving_up_from_maximum",
            "moving_down_from_maximum",
            "moving_up_from_minimum",
            "moving_down_from_minimum",
          ])
          .describe("When to trigger the alert"),
        quote_type: z
          .enum(["ltp", "bap", "bbp", "op", "pp"])
          .default("ltp")
          .describe(
            "Price type: ltp=last trade, bap=best ask, bbp=best bid, op=open, pp=prev close",
          ),
        notification_type: z
          .enum(["email", "sms", "push", "all"])
          .default("all")
          .describe("Notification delivery method"),
        alert_period: z
          .number()
          .int()
          .default(0)
          .describe(
            "Re-trigger interval in seconds: 0=once, 60, 300, 900, 3600, 86400",
          ),
        expire: z
          .string()
          .default("0")
          .describe("Expiry: '0'=GTC, 'end_of_day', or 'till_time'"),
      },
      annotations: { readOnlyHint: false },
    },
    async ({
      ticker,
      price,
      trigger_type,
      quote_type,
      notification_type,
      alert_period,
      expire,
    }) => {
      try {
        const result = await client.callApi("togglePriceAlert", {
          ticker,
          price: { price: String(price) },
          trigger_type,
          quote_type,
          notification_type,
          alert_period,
          expire: expire === "0" ? 0 : expire,
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
    "delete_price_alert",
    {
      description: "Delete an existing price alert. Destructive action — set confirm=true to execute.",
      inputSchema: {
        id: z.number().int().describe("Alert ID to delete"),
        confirm: z
          .boolean()
          .describe("Must be true to delete this alert"),
      },
      annotations: { destructiveHint: true, readOnlyHint: false },
    },
    async ({ id, confirm }) => {
      if (!confirm) {
        return {
          content: [
            {
              type: "text",
              text: "Alert not deleted. Set confirm=true to delete.",
            },
          ],
        };
      }

      try {
        const result = await client.callApi("togglePriceAlert", {
          id,
          del: true,
          quote_type: "ltp",
          notification_type: "all",
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
}
