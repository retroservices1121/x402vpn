// x402vpn Example Client
// Demonstrates buying VPN access via x402 micropayments
//
// Requirements:
//   npm install @x402/fetch @x402/evm
//   Set PRIVATE_KEY env var to a funded wallet on Base Sepolia
//
// Usage:
//   PRIVATE_KEY=0x... node examples/client.js

import { wrapFetch } from "@x402/fetch";
import { createEvmClient } from "@x402/evm";

const BASE_URL = process.env.X402VPN_URL || "http://localhost:3402";

if (!process.env.PRIVATE_KEY) {
  console.error("ERROR: PRIVATE_KEY env var is required");
  console.error("Export a funded wallet private key for Base Sepolia");
  process.exit(1);
}

// Set up x402 payment client
const client = createEvmClient({ privateKey: process.env.PRIVATE_KEY });
const fetchX = wrapFetch(fetch, client);

async function main() {
  console.log("=== x402vpn Client Demo ===\n");

  // Step 1: Health check (free)
  console.log("1. Checking service health...");
  const health = await fetch(`${BASE_URL}/api/health`);
  const healthData = await health.json();
  console.log("   Status:", healthData.status);
  console.log("   Network:", healthData.network);
  console.log();

  // Step 2: Get pricing (free)
  console.log("2. Fetching pricing...");
  const pricing = await fetch(`${BASE_URL}/api/pricing`);
  const pricingData = await pricing.json();
  for (const [endpoint, info] of Object.entries(pricingData.endpoints)) {
    console.log(`   ${endpoint}: ${info.price}`);
  }
  console.log();

  // Step 3: Create VPN account (pays $2.00 USDC)
  console.log("3. Creating VPN account ($2.00 USDC)...");
  const accountRes = await fetchX(`${BASE_URL}/api/vpn/account`, {
    method: "POST",
  });
  const accountData = await accountRes.json();

  if (!accountData.success) {
    console.error("   Failed:", accountData.error);
    process.exit(1);
  }

  const { account } = accountData;
  console.log("   Username:", account.username);
  console.log("   Password:", account.password);
  console.log("   VPN ID:", account.vpn_id);
  console.log("   Status:", account.status);
  if (account.wireguard) {
    console.log("   WireGuard IP:", account.wireguard.ip);
  }
  console.log();

  // Step 4: List servers (pays $0.01 USDC)
  console.log("4. Listing servers ($0.01 USDC)...");
  const serversRes = await fetchX(`${BASE_URL}/api/vpn/servers`);
  const serversData = await serversRes.json();
  const servers = serversData.servers || [];
  console.log(`   Found ${servers.length} servers`);
  servers.slice(0, 5).forEach((s) => {
    console.log(`   - [${s.country_code}] ${s.name} (ID: ${s.id})`);
  });
  if (servers.length > 5) console.log(`   ... and ${servers.length - 5} more`);
  console.log();

  // Step 5: List ports (pays $0.01 USDC)
  console.log("5. Listing ports ($0.01 USDC)...");
  const portsRes = await fetchX(`${BASE_URL}/api/vpn/ports`);
  const portsData = await portsRes.json();
  const ports = portsData.ports || [];
  ports.forEach((p) => {
    console.log(`   - ${p.protocol.toUpperCase()} :${p.number}${p.default ? " (default)" : ""}`);
  });
  console.log();

  // Step 6: Download OpenVPN config (pays $0.50 USDC)
  if (servers.length > 0 && ports.length > 0) {
    const serverId = servers[0].id;
    const portId = ports.find((p) => p.default)?.id || ports[0].id;

    console.log(`6. Downloading OpenVPN config ($0.50 USDC)...`);
    console.log(`   Server: ${servers[0].name} (${servers[0].country_code})`);
    const configRes = await fetchX(
      `${BASE_URL}/api/vpn/config?server_id=${serverId}&port_id=${portId}`
    );
    const configBody = await configRes.text();
    console.log(`   Config size: ${configBody.length} bytes`);
    console.log(`   First line: ${configBody.split("\n")[0]}`);
    console.log();
  }

  console.log("=== Done! Total spent: ~$2.52 USDC ===");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
