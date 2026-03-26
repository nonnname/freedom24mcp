# Freedom24 MCP Server

## Build & Run

```bash
npm install
npm run build    # tsc → dist/
node dist/index.js
```

## Project Structure

- `src/index.ts` — Entry point: McpServer + StdioServerTransport
- `src/client.ts` — TradernetClient: V1 GET, V2 POST (HMAC-SHA256), WS orderbook
- `src/tools/market-data.ts` — Read-only market data tools (quotes, search, candles, orderbook)
- `src/tools/portfolio.ts` — Read-only portfolio and orders tools
- `src/tools/trading.ts` — Destructive trading tools (place/cancel order, stop-loss)
- `src/tools/alerts.ts` — Alert management tools

## Conventions

- **V1 GET** for read-only endpoints (no auth signing needed)
- **V2 POST** with HMAC-SHA256 for authenticated/write endpoints
- **Destructive actions** require `confirm: true` parameter — handler returns error text if false
- All tool handlers return JSON as `{ content: [{ type: "text", text: ... }] }`
- Errors returned as `{ isError: true, content: [...] }`, not thrown

## Environment Variables

- `TRADERNET_PUBLIC_KEY` — required
- `TRADERNET_PRIVATE_KEY` — required
- `TRADERNET_HOST` — optional, defaults to `freedom24.com`

## Testing

Runtime testing requires valid API keys. No automated test suite — verify with `npm run build` for type checking.
