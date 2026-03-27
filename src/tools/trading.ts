import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TradernetClient } from "../client.js";

const ACTION_MAP: Record<string, number> = {
  buy: 1,
  buy_margin: 2,
  sell: 3,
  sell_short: 4,
};

const ORDER_TYPE_MAP: Record<string, number> = {
  market: 1,
  limit: 2,
  stop: 3,
  stop_limit: 4,
};

const EXPIRATION_MAP: Record<string, number> = {
  day: 1,
  day_ext: 2,
  gtc: 3,
};

export function registerTradingTools(
  server: McpServer,
  client: TradernetClient,
): void {
  server.registerTool(
    "place_order",
    {
      description: "Place a trade order (buy/sell). Destructive action — set confirm=true to execute.",
      inputSchema: {
        instr_name: z.string().describe("Instrument ticker, e.g. AAPL.US"),
        action: z
          .enum(["buy", "buy_margin", "sell", "sell_short"])
          .describe("Trade action"),
        order_type: z
          .enum(["market", "limit", "stop", "stop_limit"])
          .describe("Order type"),
        qty: z.number().int().positive().describe("Number of shares/lots"),
        limit_price: z
          .number()
          .optional()
          .describe("Limit price (required for limit/stop_limit orders)"),
        stop_price: z
          .number()
          .optional()
          .describe("Stop trigger price (required for stop/stop_limit orders)"),
        expiration: z
          .enum(["day", "day_ext", "gtc"])
          .default("day")
          .describe("Order duration: day, day+extended, good-til-cancelled"),
        confirm: z
          .boolean()
          .describe("Must be true to execute this order"),
      },
      annotations: { destructiveHint: true, readOnlyHint: false },
    },
    async ({
      instr_name,
      action,
      order_type,
      qty,
      limit_price,
      stop_price,
      expiration,
      confirm,
    }) => {
      if (!confirm) {
        return {
          content: [
            {
              type: "text",
              text: "Order not executed. Set confirm=true to place this order.",
            },
          ],
        };
      }

      try {
        const params: Record<string, unknown> = {
          instr_name,
          action_id: ACTION_MAP[action],
          order_type_id: ORDER_TYPE_MAP[order_type],
          qty,
          expiration_id: EXPIRATION_MAP[expiration],
        };
        if (limit_price !== undefined) params.limit_price = limit_price;
        if (stop_price !== undefined) params.stop_price = stop_price;

        const result = await client.callApi("putTradeOrder", params);
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
    "cancel_order",
    {
      description: "Cancel an existing order. Destructive action — set confirm=true to execute.",
      inputSchema: {
        order_id: z.number().int().describe("ID of the order to cancel"),
        confirm: z
          .boolean()
          .describe("Must be true to cancel this order"),
      },
      annotations: { destructiveHint: true, readOnlyHint: false },
    },
    async ({ order_id, confirm }) => {
      if (!confirm) {
        return {
          content: [
            {
              type: "text",
              text: "Order not cancelled. Set confirm=true to cancel this order.",
            },
          ],
        };
      }

      try {
        const result = await client.callApi("delTradeOrder", { order_id });
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
    "set_stop_loss",
    {
      description: "Set stop-loss and/or take-profit on a position. Destructive action — set confirm=true to execute.",
      inputSchema: {
        instr_name: z.string().describe("Instrument ticker, e.g. AAPL.US"),
        take_profit: z
          .number()
          .nullable()
          .optional()
          .describe("Take-profit price, null to leave unchanged"),
        stop_loss: z
          .number()
          .nullable()
          .optional()
          .describe("Stop-loss price, null to leave unchanged"),
        stop_loss_percent: z
          .number()
          .nullable()
          .optional()
          .describe("Stop-loss as percentage from current price"),
        trailing_stop_percent: z
          .number()
          .nullable()
          .optional()
          .describe("Trailing stop-loss percentage"),
        confirm: z
          .boolean()
          .describe("Must be true to execute this action"),
      },
      annotations: { destructiveHint: true, readOnlyHint: false },
    },
    async ({
      instr_name,
      take_profit,
      stop_loss,
      stop_loss_percent,
      trailing_stop_percent,
      confirm,
    }) => {
      if (!confirm) {
        return {
          content: [
            {
              type: "text",
              text: "Stop-loss not set. Set confirm=true to execute.",
            },
          ],
        };
      }

      try {
        const result = await client.callApi("putStopLoss", {
          instr_name,
          take_profit: take_profit ?? null,
          stop_loss: stop_loss ?? null,
          stop_loss_percent: stop_loss_percent ?? null,
          stoploss_trailing_percent: trailing_stop_percent ?? null,
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
