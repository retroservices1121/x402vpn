# x402vpn

VPN access through x402 micropayments. Pay USDC on Base, get VPN credentials, server lists, and config files. No signups, no API keys, no KYC. Payment is authentication.

## Quick Start

```bash
git clone https://github.com/youruser/x402vpn.git
cd x402vpn
npm install
cp .env.example .env
# Edit .env with your wallet address and API token
npm start
```

The server starts on port 3402 by default.

## Environment Variables

| Variable               | Required | Description                              | Default          |
|------------------------|----------|------------------------------------------|------------------|
| `PAY_TO_ADDRESS`       | Yes      | Wallet address that receives USDC        |                  |
| `VPNRESELLERS_API_TOKEN` | Yes    | VPN backend API token                    |                  |
| `NETWORK`              | No       | Chain ID for payments                    | `eip155:84532`   |
| `PORT`                 | No       | Server port                              | `3402`           |
| `PRICE_CREATE`         | No       | Account creation price (USD)             | `2.00`           |
| `PRICE_SERVERS`        | No       | Server list price (USD)                  | `0.01`           |
| `PRICE_PORTS`          | No       | Port list price (USD)                    | `0.01`           |
| `PRICE_CONFIG`         | No       | OpenVPN config price (USD)               | `0.50`           |
| `PRICE_WG_CONFIG`      | No       | WireGuard config price (USD)             | `0.50`           |

Set `NETWORK=eip155:8453` for Base mainnet production.

## Endpoints

| Method | Path                      | Description              | Price  |
|--------|---------------------------|--------------------------|--------|
| GET    | `/`                       | Landing page             | Free   |
| GET    | `/api/health`             | Health check             | Free   |
| GET    | `/api/pricing`            | Pricing info             | Free   |
| GET    | `/skill.md`               | Agent docs (markdown)    | Free   |
| GET    | `/llms.txt`               | Agent docs (plain text)  | Free   |
| POST   | `/api/vpn/account`        | Create VPN account       | $2.00  |
| GET    | `/api/vpn/servers`        | List server locations    | $0.01  |
| GET    | `/api/vpn/ports`          | List protocols and ports | $0.01  |
| GET    | `/api/vpn/config`         | Download OpenVPN config  | $0.50  |
| GET    | `/api/vpn/wireguard-config` | Download WireGuard config | $0.50 |

## How x402 Payment Works

1. Client requests a paid endpoint
2. Server responds with HTTP 402 and payment requirements (price, network, wallet)
3. Client signs a USDC payment on Base and resubmits with a payment header
4. Facilitator verifies the payment on-chain, server delivers the response

The `@x402/fetch` and `@x402/axios` libraries handle steps 2-3 automatically.

## Docker

```bash
docker build -t x402vpn .
docker run -p 3402:3402 --env-file .env x402vpn
```

For Railway, push to GitHub and connect the repo. Railway will detect the Dockerfile automatically. Set environment variables in the Railway dashboard.

## Example Client

```bash
npm install @x402/fetch @x402/evm
PRIVATE_KEY=0x... node examples/client.js
```

See `examples/client.js` for a full walkthrough that creates an account, lists servers, and downloads a config.

## Agent Integration

Serve `/skill.md` or `/llms.txt` to any AI agent for structured API documentation. See the [SKILL.md](SKILL.md) file for the full agent integration guide.

## License

MIT
