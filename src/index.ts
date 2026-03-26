#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TradernetClient } from "./client.js";
import { registerMarketDataTools } from "./tools/market-data.js";
import { registerPortfolioTools } from "./tools/portfolio.js";
import { registerTradingTools } from "./tools/trading.js";
import { registerAlertTools } from "./tools/alerts.js";

const client = TradernetClient.fromEnv();

const server = new McpServer({
  name: "freedom24",
  version: "1.0.0",
});

registerMarketDataTools(server, client);
registerPortfolioTools(server, client);
registerTradingTools(server, client);
registerAlertTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
