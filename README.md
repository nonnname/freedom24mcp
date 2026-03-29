# Freedom24 MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

MCP server for the [Freedom24/Tradernet](https://freedom24.com) broker API. Provides market data, portfolio, trading, and alert tools via the [Model Context Protocol](https://modelcontextprotocol.io).

## Prerequisites

- Node.js 22+
- Freedom24 API keys ([settings → API](https://freedom24.com/settings/api))

## Setup

```bash
git clone https://github.com/nonnname/freedom24mcp.git
cd freedom24mcp
npm install
npm run build
```

## Usage with Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "freedom24": {
      "command": "node",
      "args": ["/absolute/path/to/freedom24mcp/dist/index.js"],
      "env": {
        "TRADERNET_PUBLIC_KEY": "your-public-key",
        "TRADERNET_PRIVATE_KEY": "your-private-key"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

## Usage with Claude Code

```bash
claude mcp add freedom24 node /absolute/path/to/freedom24mcp/dist/index.js \
  -e TRADERNET_PUBLIC_KEY=your-public-key \
  -e TRADERNET_PRIVATE_KEY=your-private-key
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TRADERNET_PUBLIC_KEY` | Yes | API public key from Freedom24 |
| `TRADERNET_PRIVATE_KEY` | Yes | API private key from Freedom24 |
| `TRADERNET_HOST` | No | API host, defaults to `freedom24.com` |
| `TRADERNET_READONLY` | No | Set to `true` to disable all write operations |

## Tools

### Market Data (read-only)

| Tool | Description |
|------|-------------|
| `get_security_info` | Get detailed info about a security (name, currency, min step) |
| `search_ticker` | Search for securities by name or ticker symbol |
| `get_candles` | Get OHLCV candlestick data (1m, 5m, 15m, 1h, 1d) |
| `get_order_book` | Get current bid/ask order book via WebSocket |

### Portfolio (read-only)

| Tool | Description |
|------|-------------|
| `get_portfolio` | Get current positions and account info |
| `get_orders` | Get order history and active orders |

### Trading

| Tool | Description |
|------|-------------|
| `place_order` | Place buy/sell order (market, limit, stop, stop-limit) |
| `cancel_order` | Cancel an existing order |
| `set_stop_loss` | Set stop-loss and/or take-profit on a position |

### Alerts

| Tool | Description |
|------|-------------|
| `get_alerts` | List active price alerts |
| `add_price_alert` | Create a new price alert |
| `delete_price_alert` | Delete a price alert |

## Security

- All API calls use HMAC-SHA256 signed requests
- API keys are read from environment variables, never hardcoded
- Host validated against an allowlist of known Freedom24 domains
- API commands validated against an allowlist to prevent misuse
- Error messages are sanitized to avoid leaking internal details

## API Reference

- [Tradernet API Documentation](https://freedom24.com/tradernet-api/)
- [Official WS Client](https://github.com/tradernet-api/tn-ws-nodejs)

## Disclaimer

This is an unofficial open-source project, not affiliated with or endorsed by Freedom Finance / Freedom24. It interacts with live brokerage accounts via the Tradernet API. Trading on financial markets involves risk of loss. The authors bear no responsibility for any financial losses resulting from the use of this software. Use at your own risk and always verify data independently.

## License

[MIT](LICENSE) — Sergey Zhdanov
