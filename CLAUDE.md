# Freedom24 MCP Server

## Build & Run

```bash
npm install
npm run build    # tsc → dist/
node dist/index.js
```

## Project Structure

- `src/index.ts` — Entry point: McpServer + StdioServerTransport
- `src/client.ts` — TradernetClient: POST with HMAC-SHA256 signing, WS orderbook
- `src/tools/market-data.ts` — Read-only market data tools (quotes, search, candles, orderbook)
- `src/tools/portfolio.ts` — Read-only portfolio and orders tools
- `src/tools/trading.ts` — Destructive trading tools (place/cancel order, stop-loss)
- `src/tools/alerts.ts` — Alert management tools

## Conventions

- **All API calls** via POST to `https://{host}/api/{command}` with HMAC-SHA256 signing (payload + timestamp)
- All tool handlers return JSON as `{ content: [{ type: "text", text: ... }] }`
- Errors returned as `{ isError: true, content: [...] }`, not thrown

## Environment Variables

- `TRADERNET_PUBLIC_KEY` — required
- `TRADERNET_PRIVATE_KEY` — required
- `TRADERNET_HOST` — optional, defaults to `freedom24.com`
- `TRADERNET_READONLY` — optional, `true` to disable write operations

## Testing

Runtime testing requires valid API keys. No automated test suite — verify with `npm run build` for type checking.
