import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TradernetClient } from "../client.js";

export function registerPortfolioTools(
  server: McpServer,
  client: TradernetClient,
): void {
  server.registerTool(
    "get_portfolio",
    {
      description: "Get current portfolio positions and account info",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const result = await client.callApi("getPositionJson", {});
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
    "get_orders",
    {
      description: "Get order history and current orders",
      inputSchema: {
        active_only: z
          .boolean()
          .optional()
          .default(false)
          .describe("If true, return only active orders"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ active_only }) => {
      try {
        const result = await client.callApi("getNotifyOrderJson", {
          active_only: active_only ? 1 : 0,
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
