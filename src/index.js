import "dotenv/config";
import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import VPNResellersClient from "./vpnresellers.js";
import { buildLandingPage } from "./ui.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Config ---
const PORT = process.env.PORT || 3402;
const PAY_TO = process.env.PAY_TO_ADDRESS;
const NETWORK = process.env.NETWORK || "eip155:84532";
const VPN_TOKEN = process.env.VPNRESELLERS_API_TOKEN;

if (!PAY_TO) {
  console.error("ERROR: PAY_TO_ADDRESS env var is required");
  process.exit(1);
}
if (!VPN_TOKEN) {
  console.error("ERROR: VPNRESELLERS_API_TOKEN env var is required");
  process.exit(1);
}

// Pricing from env (defaults match spec)
const PRICING = {
  create: process.env.PRICE_CREATE || "2.00",
  servers: process.env.PRICE_SERVERS || "0.01",
  config: process.env.PRICE_CONFIG || "0.50",
  ports: process.env.PRICE_PORTS || "0.01",
  wgConfig: process.env.PRICE_WG_CONFIG || "0.50",
};

// --- VPN Client ---
const vpn = new VPNResellersClient(VPN_TOKEN);

// --- Express App ---
const app = express();
app.use(express.json());

// --- x402 Payment Middleware ---
const isMainnet = NETWORK === "eip155:8453";
const facilitatorUrl = isMainnet
  ? "https://x402.coinbase.com/facilitator"
  : "https://www.x402.org/facilitator";

const facilitatorClient = new HTTPFacilitatorClient({
  url: facilitatorUrl,
});

const resourceServer = new x402ResourceServer(facilitatorClient)
  .register(NETWORK, new ExactEvmScheme());

const routes = {
  "POST /api/vpn/account": {
    accepts: {
      scheme: "exact",
      price: `$${PRICING.create}`,
      network: NETWORK,
      payTo: PAY_TO,
    },
    description: "Create a new VPN account with credentials",
  },
  "GET /api/vpn/servers": {
    accepts: {
      scheme: "exact",
      price: `$${PRICING.servers}`,
      network: NETWORK,
      payTo: PAY_TO,
    },
    description: "List all available VPN server locations",
  },
  "GET /api/vpn/config": {
    accepts: {
      scheme: "exact",
      price: `$${PRICING.config}`,
      network: NETWORK,
      payTo: PAY_TO,
    },
    description: "Download OpenVPN configuration file",
  },
  "GET /api/vpn/ports": {
    accepts: {
      scheme: "exact",
      price: `$${PRICING.ports}`,
      network: NETWORK,
      payTo: PAY_TO,
    },
    description: "List available VPN protocols and ports",
  },
  "GET /api/vpn/wireguard-config": {
    accepts: {
      scheme: "exact",
      price: `$${PRICING.wgConfig}`,
      network: NETWORK,
      payTo: PAY_TO,
    },
    description: "Download WireGuard configuration file",
  },
};

app.use(paymentMiddleware(routes, resourceServer));

// --- Free Endpoints ---

// Landing page
app.get("/", (req, res) => {
  const html = buildLandingPage({ network: NETWORK, payTo: PAY_TO, pricing: PRICING });
  res.type("html").send(html);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "operational",
    service: "x402-vpn",
    protocol: "x402",
    network: NETWORK,
  });
});

// Pricing info
app.get("/api/pricing", (req, res) => {
  res.json({
    currency: "USDC",
    network: NETWORK,
    endpoints: {
      "POST /api/vpn/account": { price: `$${PRICING.create}`, description: "Create VPN account" },
      "GET /api/vpn/servers": { price: `$${PRICING.servers}`, description: "List server locations" },
      "GET /api/vpn/ports": { price: `$${PRICING.ports}`, description: "List protocols and ports" },
      "GET /api/vpn/config": { price: `$${PRICING.config}`, description: "Download OpenVPN config" },
      "GET /api/vpn/wireguard-config": { price: `$${PRICING.wgConfig}`, description: "Download WireGuard config" },
    },
  });
});

// SKILL.md / llms.txt
const skillPath = path.join(__dirname, "..", "SKILL.md");

app.get("/skill.md", (req, res) => {
  const content = fs.readFileSync(skillPath, "utf-8");
  res.type("text/markdown").send(content);
});

app.get("/llms.txt", (req, res) => {
  const content = fs.readFileSync(skillPath, "utf-8");
  res.type("text/plain").send(content);
});

// --- Paid Endpoints ---

// Create VPN account
app.post("/api/vpn/account", async (req, res) => {
  try {
    const username = "x402_" + crypto.randomBytes(8).toString("hex");
    const password = crypto.randomBytes(16).toString("base64url");

    const result = await vpn.createAccount(username, password);
    const account = result.data;

    res.json({
      success: true,
      account: {
        username,
        password,
        vpn_id: account.id,
        status: account.status,
        wireguard: account.wg_public_key
          ? { ip: account.wg_ip, public_key: account.wg_public_key }
          : null,
        expires_at: account.expired_at || null,
        created_at: account.created,
      },
    });
  } catch (err) {
    console.error("Account creation failed:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to create VPN account",
      detail: "Internal service error. Please try again.",
    });
  }
});

// List servers
app.get("/api/vpn/servers", async (req, res) => {
  try {
    const result = await vpn.listServers();
    const servers = (result.data || []).map((s) => ({
      id: s.id,
      name: s.city || s.name,
      country_code: s.country_code,
      city: s.city,
    }));

    res.json({ success: true, servers });
  } catch (err) {
    console.error("List servers failed:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve server list",
      detail: "Internal service error. Please try again.",
    });
  }
});

// List ports
app.get("/api/vpn/ports", async (req, res) => {
  try {
    const result = await vpn.listPorts();
    res.json({ success: true, ports: result.data || [] });
  } catch (err) {
    console.error("List ports failed:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve port list",
      detail: "Internal service error. Please try again.",
    });
  }
});

// Download OpenVPN config
app.get("/api/vpn/config", async (req, res) => {
  try {
    const { server_id, port_id } = req.query;
    if (!server_id || !port_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: server_id and port_id",
      });
    }

    const result = await vpn.getOpenVPNConfig(server_id, port_id);
    const fileBody = result.data?.file_body || result.file_body;
    const fileName = result.data?.file_name || result.file_name || "config.ovpn";

    if (!fileBody) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate OpenVPN configuration",
      });
    }

    res.set("Content-Type", "application/x-openvpn-profile");
    res.set("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(fileBody);
  } catch (err) {
    console.error("OpenVPN config failed:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to generate OpenVPN configuration",
      detail: "Internal service error. Please try again.",
    });
  }
});

// Download WireGuard config
app.get("/api/vpn/wireguard-config", async (req, res) => {
  try {
    const { server_id, account_id } = req.query;
    if (!server_id || !account_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: server_id and account_id",
      });
    }

    const result = await vpn.getWireGuardConfig(account_id, server_id);
    const fileBody = result.data?.file_body || result.file_body;
    const fileName = result.data?.file_name || result.file_name || "wireguard.conf";

    if (!fileBody) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate WireGuard configuration",
      });
    }

    res.set("Content-Type", "application/x-wireguard-profile");
    res.set("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(fileBody);
  } catch (err) {
    console.error("WireGuard config failed:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to generate WireGuard configuration",
      detail: "Internal service error. Please try again.",
    });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                   x402vpn                            ║
║           VPN access via x402 micropayments          ║
╠══════════════════════════════════════════════════════╣
║  Network:  ${NETWORK.padEnd(40)}║
║  Pay To:   ${PAY_TO.padEnd(40)}║
╠══════════════════════════════════════════════════════╣
║  FREE ENDPOINTS                                      ║
║  GET  /               Landing page                   ║
║  GET  /api/health     Health check                   ║
║  GET  /api/pricing    Pricing info                   ║
║  GET  /skill.md       Agent docs (markdown)          ║
║  GET  /llms.txt       Agent docs (plain text)        ║
╠══════════════════════════════════════════════════════╣
║  PAID ENDPOINTS                                      ║
║  POST /api/vpn/account          $${PRICING.create.padEnd(22)}║
║  GET  /api/vpn/servers          $${PRICING.servers.padEnd(22)}║
║  GET  /api/vpn/ports            $${PRICING.ports.padEnd(22)}║
║  GET  /api/vpn/config           $${PRICING.config.padEnd(22)}║
║  GET  /api/vpn/wireguard-config $${PRICING.wgConfig.padEnd(22)}║
╠══════════════════════════════════════════════════════╣
║  Server running on port ${String(PORT).padEnd(29)}║
╚══════════════════════════════════════════════════════╝
  `);
});
