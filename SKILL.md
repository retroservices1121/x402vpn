# x402vpn

> VPN access via x402 micropayments. Pay USDC on Base, get VPN credentials and configs. No signups, no API keys.

## Base URL

```
https://x402vpn.com
```

## Authentication

None. Payment is authentication. The x402 protocol handles payment negotiation automatically via HTTP 402 responses. Any x402-compatible client with a funded wallet can access paid endpoints.

## Network Details

| Property     | Value                                    |
|-------------|------------------------------------------|
| Chain        | Base (eip155:8453)                       |
| Testnet      | Base Sepolia (eip155:84532)              |
| Token        | USDC                                     |
| Protocol     | x402 (HTTP 402 Payment Required)         |
| Facilitator  | x402.org (testnet) / Coinbase (mainnet)  |
| Settlement   | On-chain via facilitator                 |

## Free Endpoints

### GET /api/health

Health check. Returns service status.

**Response:**
```json
{
  "status": "operational",
  "service": "x402-vpn",
  "protocol": "x402",
  "network": "eip155:8453"
}
```

### GET /api/pricing

Returns pricing for all paid endpoints.

**Response:**
```json
{
  "currency": "USDC",
  "network": "eip155:8453",
  "endpoints": {
    "POST /api/vpn/account": { "price": "$2.00", "description": "Create VPN account" },
    "GET /api/vpn/servers": { "price": "$0.01", "description": "List server locations" },
    "GET /api/vpn/ports": { "price": "$0.01", "description": "List protocols and ports" },
    "GET /api/vpn/config": { "price": "$0.50", "description": "Download OpenVPN config" },
    "GET /api/vpn/wireguard-config": { "price": "$0.50", "description": "Download WireGuard config" }
  }
}
```

### GET /skill.md

This file, served as `text/markdown`.

### GET /llms.txt

This file, served as `text/plain`.

## Paid Endpoints

### POST /api/vpn/account

**Cost:** $2.00 USDC

Create a new VPN account with credentials. Returns username, password, and WireGuard details.

**Response:**
```json
{
  "success": true,
  "account": {
    "username": "x402_a1b2c3d4e5f6g7h8",
    "password": "random-base64url-password",
    "vpn_id": 12345,
    "status": "active",
    "wireguard": {
      "ip": "10.x.x.x",
      "public_key": "base64-public-key"
    },
    "expires_at": null,
    "created_at": "2025-01-01 00:00:00"
  }
}
```

### GET /api/vpn/servers

**Cost:** $0.01 USDC

List all available VPN server locations.

**Response:**
```json
{
  "success": true,
  "servers": [
    { "id": 1, "name": "Amsterdam", "country_code": "NL", "city": "Amsterdam" },
    { "id": 2, "name": "New York", "country_code": "US", "city": "New York" }
  ]
}
```

### GET /api/vpn/ports

**Cost:** $0.01 USDC

List available VPN protocols and ports.

**Response:**
```json
{
  "success": true,
  "ports": [
    { "id": 1, "protocol": "udp", "number": 1194, "default": true },
    { "id": 2, "protocol": "tcp", "number": 443, "default": false }
  ]
}
```

### GET /api/vpn/config

**Cost:** $0.50 USDC

Download an OpenVPN configuration file.

**Query parameters:**
- `server_id` (required) - Server ID from the servers list
- `port_id` (required) - Port ID from the ports list

**Response:** `.ovpn` file with `Content-Type: application/x-openvpn-profile`

### GET /api/vpn/wireguard-config

**Cost:** $0.50 USDC

Download a WireGuard configuration file.

**Query parameters:**
- `server_id` (required) - Server ID from the servers list
- `account_id` (required) - VPN account ID (`vpn_id` from account creation)

**Response:** `.conf` file with `Content-Type: application/x-wireguard-profile`

## Code Examples

### Using @x402/fetch

```javascript
import { wrapFetch } from "@x402/fetch";
import { createEvmClient } from "@x402/evm";

const client = createEvmClient({ privateKey: process.env.PRIVATE_KEY });
const fetchX = wrapFetch(fetch, client);

// Create VPN account ($2.00 USDC, paid automatically)
const res = await fetchX("https://x402vpn.com/api/vpn/account", {
  method: "POST",
});
const { account } = await res.json();
console.log(account.username, account.password);
```

### Using @x402/axios

```javascript
import { wrapAxios } from "@x402/axios";
import { createEvmClient } from "@x402/evm";
import axios from "axios";

const client = createEvmClient({ privateKey: process.env.PRIVATE_KEY });
const axiosX = wrapAxios(axios, client);

const { data } = await axiosX.post("https://x402vpn.com/api/vpn/account");
console.log(data.account.username, data.account.password);
```

## Recommended Agent Workflow

1. **Check health** - `GET /api/health` (free)
2. **Check pricing** - `GET /api/pricing` (free)
3. **Create account** - `POST /api/vpn/account` ($2.00)
4. **List servers** - `GET /api/vpn/servers` ($0.01)
5. **List ports** - `GET /api/vpn/ports` ($0.01)
6. **Download config** - `GET /api/vpn/config?server_id={id}&port_id={id}` ($0.50)

**Total cost: $2.52 USDC** for full VPN setup with OpenVPN config.

## Use Cases

- **Geo-routing** - Route traffic through specific countries for location-dependent tasks
- **Privacy research** - Anonymous connectivity for OSINT or web scraping
- **Distributed access** - Multiple agents, each with unique VPN identities
- **Censorship circumvention** - Access resources restricted by network policy
- **Testing and QA** - Verify application behavior from different geographic locations

## Error Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "detail": "Technical detail for debugging"
}
```

### Common Status Codes

| Code | Meaning                                       |
|------|-----------------------------------------------|
| 200  | Success                                       |
| 400  | Missing or invalid parameters                 |
| 402  | Payment required (x402 negotiation response)  |
| 500  | Internal server error                         |

## Support

[@x402vpn on X](https://x.com/x402vpn)
