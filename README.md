# Freedom24 MCP Server

MCP server for the [Freedom24/Tradernet](https://freedom24.com) broker API. Provides market data, portfolio, trading, and alert tools via the [Model Context Protocol](https://modelcontextprotocol.io).

## Prerequisites

- Node.js 22+
- Freedom24 API keys ([generate here](https://freedom24.com/tradernet-api/auth-api))

## Setup

```bash
npm install
npm run build
```

Set environment variables:

```bash
export TRADERNET_PUBLIC_KEY="your-public-key"
export TRADERNET_PRIVATE_KEY="your-private-key"
export TRADERNET_HOST="freedom24.com"  # optional, defaults to freedom24.com
```

## Usage with Claude Code

Add to your MCP server configuration:

```json
{
  "mcpServers": {
    "freedom24": {
      "command": "node",
      "args": ["/path/to/freedom24mcp/dist/index.js"],
      "env": {
        "TRADERNET_PUBLIC_KEY": "your-public-key",
        "TRADERNET_PRIVATE_KEY": "your-private-key"
      }
    }
  }
}
```

## Tools

### Market Data

| Tool | Description |
|------|-------------|
| `get_security_info` | Get detailed info about a security (name, currency, min step) |
| `search_ticker` | Search for securities by name or ticker symbol |
| `get_candles` | Get OHLCV candlestick data (1m, 5m, 15m, 1h, 1d) |
| `get_order_book` | Get current bid/ask order book via WebSocket |

### Portfolio

| Tool | Description |
|------|-------------|
| `get_portfolio` | Get current positions and account info |
| `get_orders` | Get order history and active orders |

### Trading (require `confirm: true`)

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
| `delete_price_alert` | Delete a price alert (requires `confirm: true`) |

## API Reference

- [Tradernet API Documentation](https://freedom24.com/tradernet-api/)
- [WS Client (GitHub)](https://github.com/tradernet-api/tn-ws-nodejs)
