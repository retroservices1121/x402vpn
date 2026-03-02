# x402vpn - Claude Code Build Prompt

## Project Overview

Build a Node.js/Express application called **x402vpn** that sells VPN access through the x402 payment protocol. Users pay USDC on Base (Coinbase L2) via HTTP 402 micropayments to create VPN accounts, list servers, and download OpenVPN/WireGuard configs. No signups, no API keys, no KYC. Payment is authentication.

The backend VPN infrastructure is white-labeled from VPNResellers API v3.2. The VPNResellers brand must NEVER appear on any user-facing surface (UI, docs, README). Internal code files can reference it.

## Tech Stack

- **Runtime:** Node.js with ES modules ("type": "module" in package.json)
- **Framework:** Express.js
- **Payments:** x402 protocol via `@x402/express`, `@x402/evm`, `@x402/core` packages
- **VPN Backend:** VPNResellers API v3.2 (https://api.vpnresellers.com/v3_2/)
- **Network:** Base mainnet (eip155:8453) for production, Base Sepolia (eip155:84532) for testing
- **Token:** USDC
- **Deployment:** Docker + Railway/Render/Fly.io compatible

## x402 Middleware Setup (IMPORTANT - Use the new @x402 scoped packages)

The x402 ecosystem recently migrated from `x402-express` to `@x402/express`. Use the NEW scoped packages:

```bash
npm install @x402/express @x402/evm @x402/core
```

Here is how the middleware is configured with the new API:

```javascript
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const app = express();

// Facilitator - use x402.org for testnet, @coinbase/x402 for mainnet
const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://www.x402.org/facilitator"
});

// Create resource server and register EVM payment scheme
const resourceServer = new x402ResourceServer(facilitatorClient)
  .register("eip155:84532", new ExactEvmScheme()); // Base Sepolia for testing
  // .register("eip155:8453", new ExactEvmScheme()); // Base mainnet for production

const PAY_TO = process.env.PAY_TO_ADDRESS; // Wallet that receives USDC

// Route config - keys are "METHOD /path" strings
const routes = {
  "POST /api/vpn/account": {
    accepts: {
      scheme: "exact",
      price: "$2.00",
      network: "eip155:84532",
      payTo: PAY_TO,
    },
    description: "Create a new VPN account with credentials",
  },
  "GET /api/vpn/servers": {
    accepts: {
      scheme: "exact",
      price: "$0.01",
      network: "eip155:84532",
      payTo: PAY_TO,
    },
    description: "List all available VPN server locations",
  },
  "GET /api/vpn/config": {
    accepts: {
      scheme: "exact",
      price: "$0.50",
      network: "eip155:84532",
      payTo: PAY_TO,
    },
    description: "Download OpenVPN configuration file",
  },
  "GET /api/vpn/ports": {
    accepts: {
      scheme: "exact",
      price: "$0.01",
      network: "eip155:84532",
      payTo: PAY_TO,
    },
    description: "List available VPN protocols and ports",
  },
  "GET /api/vpn/wireguard-config": {
    accepts: {
      scheme: "exact",
      price: "$0.50",
      network: "eip155:84532",
      payTo: PAY_TO,
    },
    description: "Download WireGuard configuration file",
  },
};

app.use(paymentMiddleware(routes, resourceServer));
```

The NETWORK should be configurable via env var so you can switch between testnet and mainnet. Use "eip155:84532" for Base Sepolia (testing) and "eip155:8453" for Base mainnet (production).

For mainnet production, optionally support `@coinbase/x402` facilitator:
```javascript
import { facilitator } from "@coinbase/x402";
const facilitatorClient = new HTTPFacilitatorClient(facilitator);
```

## VPNResellers API v3.2 Reference

Base URL: `https://api.vpnresellers.com/v3_2/`
Auth: Bearer token in Authorization header
Token comes from env var: `VPNRESELLERS_API_TOKEN`

### Endpoints used:

**Accounts:**
- `GET /v3_2/accounts/check_username?username={username}` - Check if username is available
- `POST /v3_2/accounts` - Create account (body: { username, password }) - Returns: { data: { id, username, status, wg_ip, wg_private_key, wg_public_key, expired_at, updated, created } }
- `GET /v3_2/accounts/{account}` - Get account details
- `DELETE /v3_2/accounts/{account}` - Delete account
- `PUT /v3_2/accounts/{account}/enable` - Enable account
- `PUT /v3_2/accounts/{account}/disable` - Disable account
- `PUT /v3_2/accounts/{account}/change_password` - Change password (body: { password })
- `PUT /v3_2/accounts/{account}/expire` - Set expiration (body: { expire_at: "Y-m-d" or null })
- `POST /v3_2/accounts/validate` - Validate credentials (body: { username, password })

**Servers:**
- `GET /v3_2/servers` - List all servers - Returns: { data: [{ id, name, ip, country_code, city, capacity }] }

**Configuration:**
- `GET /v3_2/ports` - List ports - Returns: { data: [{ id, protocol, number, default }] }
- `GET /v3_2/configuration?server_id={id}&port_id={id}` - Get OpenVPN config (JSON with download_url, file_body, file_name)
- `GET /v3_2/configuration/download?server_id={id}&port_id={id}` - Download .ovpn file directly
- `GET /v3_2/accounts/{account_id}/wireguard-configuration?server_id={id}` - Get WireGuard config (JSON with download_url, file_body, file_name)
- `GET /v3_2/accounts/{account_id}/wireguard-configuration/download?server_id={id}` - Download WireGuard .conf file

**Geo:**
- `GET /v3_2/geoip` - Get caller's geo info (no auth required)

## Project Structure

```
x402vpn/
  src/
    index.js          # Express server, x402 middleware, route definitions
    vpnresellers.js   # VPNResellers API client wrapper (internal, not user-facing)
    ui.js              # Terminal-themed landing page HTML (served by Express)
  examples/
    client.js          # Example x402 client showing how to buy VPN access
  SKILL.md             # Agent integration docs (also served at /skill.md and /llms.txt)
  Dockerfile
  package.json
  .env.example
  README.md
```

## API Endpoints to Build

### Free (no x402 payment):
- `GET /` - Serve the terminal-themed landing page
- `GET /api/health` - Returns { status: "operational", service: "x402-vpn", protocol: "x402", network: "<current_network>" }
- `GET /api/pricing` - Returns all endpoint prices in a structured JSON object
- `GET /skill.md` - Serves SKILL.md as text/markdown
- `GET /llms.txt` - Serves SKILL.md as text/plain

### Paid (x402 protected):
- `POST /api/vpn/account` ($2.00 USDC) - Generate a unique username (prefix "x402_" + random hex) and password, call VPNResellers create account API. Return credentials to user. Never expose the VPNResellers account ID directly.
- `GET /api/vpn/servers` ($0.01 USDC) - Proxy to VPNResellers list servers. Clean up the response to only show: id, name (use city instead of hostname), country_code, city.
- `GET /api/vpn/ports` ($0.01 USDC) - Proxy to VPNResellers list ports.
- `GET /api/vpn/config?server_id={id}&port_id={id}` ($0.50 USDC) - Fetch OpenVPN config from VPNResellers, return the .ovpn file body with Content-Type application/x-openvpn-profile.
- `GET /api/vpn/wireguard-config?server_id={id}&account_id={id}` ($0.50 USDC) - Fetch WireGuard config from VPNResellers for a specific account and server.

## Landing Page (src/ui.js)

Build an immersive terminal/CRT-themed landing page. Export a function that returns the full HTML string. The function should accept config params (network, payTo address, pricing) so the page dynamically reflects the current server config.

**Design specs:**
- Color palette: Black (#030508) base, electric blue (#0af) primary, cyan (#00e5ff) accents, green (#00ff88) for status/success
- Typography: Google Fonts - IBM Plex Mono + Share Tech Mono
- CRT effects: Scanlines overlay, vignette darkening at edges, blue grid background pattern
- Hero section: Animated terminal window with line-by-line boot sequence and blinking cursor
- Sections: Protocol flow (4 steps), pricing table, code example, "Built for Agents" cards, Agent Integration Docs (tabbed component with Overview/Endpoints/Integration/Workflow/Use Cases), Network details strip
- Nav bar at top with links: FLOW, PRICING, CODE, AGENTS, DOCS
- Footer: "Built on x402 protocol . Payments on Base . @x402vpn" (link to https://x.com/x402vpn)
- The docs section should be a tabbed interface that contains the full SKILL.md content rendered in the terminal aesthetic, including endpoint details, code examples, agent workflow with costs, and use cases
- Fully responsive (mobile-friendly)
- ALL in a single HTML string, no external files (inline CSS and JS)

## SKILL.md (Agent Integration Guide)

Create a comprehensive markdown file that an AI agent can read to understand and use the API autonomously. Include:
- One-liner description
- Base URL
- Authentication explanation (none - payment IS auth)
- Network details (chain, token, protocol, facilitator, settlement mechanism)
- Every endpoint with method, path, cost, description, and example response JSON
- Code examples for @x402/fetch and @x402/axios
- Recommended agent workflow (numbered steps with costs, total: $2.52)
- Use cases: geo-routing, privacy research, distributed access, censorship circumvention, testing/QA
- Error format and common status codes
- Support link: @x402vpn on X

## Example Client (examples/client.js)

Working demo script that uses `@x402/fetch` and `@x402/evm` to:
1. Check health (free)
2. Check pricing (free)
3. Create a VPN account (pays $2.00)
4. List servers (pays $0.01)
5. List ports (pays $0.01)
6. Download an OpenVPN config (pays $0.50)

Include comments explaining each step. Requires PRIVATE_KEY env var.

```javascript
import { wrapFetch } from "@x402/fetch";
import { createEvmClient } from "@x402/evm";

const client = createEvmClient({ privateKey: process.env.PRIVATE_KEY });
const fetchWithPay = wrapFetch(fetch, client);
```

## Environment Variables (.env.example)

```
# x402 Payment Config
PAY_TO_ADDRESS=0xYOUR_WALLET_ADDRESS
NETWORK=eip155:84532

# VPN Backend (internal)
VPNRESELLERS_API_TOKEN=your_vpnresellers_api_token

# Server
PORT=3402

# Optional: Coinbase facilitator for mainnet
# CDP_API_KEY_ID=
# CDP_API_KEY_SECRET=

# Pricing (USD)
PRICE_CREATE=2.00
PRICE_SERVERS=0.01
PRICE_CONFIG=0.50
PRICE_PORTS=0.01
PRICE_WG_CONFIG=0.50
```

## Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3402
CMD ["node", "src/index.js"]
```

## Key Implementation Details

1. **Username generation:** When creating VPN accounts, generate usernames like `x402_` + 16 random hex characters. Generate a strong random password. Never let the user choose - this prevents collisions and keeps things simple for agents.

2. **Server list cleanup:** The VPNResellers API returns hostnames like "ams-s02.321inter.net". Clean these up for the user-facing response. Use the city field as the display name. Only expose: id, city, country_code, and a friendly name.

3. **Config download:** When serving .ovpn files, set the Content-Type to `application/x-openvpn-profile` and Content-Disposition to `attachment; filename="<filename>"`.

4. **Error handling:** Wrap all VPNResellers API calls in try/catch. Return clean error JSON: `{ success: false, error: "message", detail: "technical detail" }`. Never leak VPNResellers error messages to the user.

5. **Startup logging:** On server start, log a clean summary showing all endpoints, their prices, the network, and the pay-to address.

6. **No VPNResellers branding:** The user-facing surfaces (landing page, SKILL.md, README, API responses) must ONLY show "x402 VPN" or "x402vpn" branding. The VPNResellers name only appears in internal source code (vpnresellers.js, env vars).

## README.md

Write a concise README covering:
- What x402vpn is (one paragraph)
- Quick start (clone, npm install, configure .env, run)
- Environment variables table
- Endpoints table (method, path, description, price)
- How x402 payment flow works (4 steps, brief)
- Docker deployment
- Example client usage
- Link to /skill.md for agent integration
- License: MIT

## Style Rules

- Never use em dashes in any copy or documentation. Use commas, periods, or "to" instead.
- Keep all user-facing copy direct and technical. No marketing fluff.
- Code should be clean, well-commented, and production-ready.
- Use async/await throughout, no callbacks.
