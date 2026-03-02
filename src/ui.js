// Terminal-themed landing page for x402vpn
// Returns full HTML string with inline CSS and JS

export function buildLandingPage({ network, payTo, pricing }) {
  const baseUrl = "https://your-domain.com"; // Replaced dynamically or by user

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>x402vpn - VPN Access via Micropayments</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg: #030508;
      --blue: #0af;
      --cyan: #00e5ff;
      --green: #00ff88;
      --dim: #3a4a5a;
      --text: #c0d0e0;
      --card-bg: rgba(0, 170, 255, 0.04);
      --border: rgba(0, 170, 255, 0.15);
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'IBM Plex Mono', monospace;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
      line-height: 1.6;
    }

    /* CRT Grid Background */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        linear-gradient(rgba(0,170,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,170,255,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
      z-index: 0;
    }

    /* Scanlines */
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0,0,0,0.08) 2px,
        rgba(0,0,0,0.08) 4px
      );
      pointer-events: none;
      z-index: 9999;
    }

    /* Vignette */
    .vignette {
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%);
      pointer-events: none;
      z-index: 9998;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px;
      position: relative;
      z-index: 1;
    }

    /* NAV */
    nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      background: rgba(3,5,8,0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 0 24px;
    }
    nav .nav-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 56px;
    }
    nav .logo {
      font-family: 'Share Tech Mono', monospace;
      font-size: 1.2rem;
      color: var(--blue);
      text-decoration: none;
      letter-spacing: 2px;
    }
    nav .logo span { color: var(--green); }
    nav .links { display: flex; gap: 24px; }
    nav .links a {
      color: var(--dim);
      text-decoration: none;
      font-size: 0.75rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      transition: color 0.2s;
    }
    nav .links a:hover { color: var(--blue); }

    /* HERO */
    .hero {
      padding: 120px 0 80px;
      text-align: center;
    }
    .hero h1 {
      font-family: 'Share Tech Mono', monospace;
      font-size: clamp(2rem, 5vw, 3.5rem);
      color: #fff;
      margin-bottom: 16px;
    }
    .hero h1 .accent { color: var(--blue); }
    .hero p {
      color: var(--dim);
      font-size: 1rem;
      max-width: 600px;
      margin: 0 auto 40px;
    }

    /* Terminal Window */
    .terminal {
      background: rgba(3,5,8,0.95);
      border: 1px solid var(--border);
      border-radius: 8px;
      max-width: 680px;
      margin: 0 auto;
      text-align: left;
      overflow: hidden;
    }
    .terminal-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: rgba(0,170,255,0.06);
      border-bottom: 1px solid var(--border);
    }
    .terminal-dot {
      width: 12px; height: 12px;
      border-radius: 50%;
    }
    .terminal-dot.r { background: #ff5f57; }
    .terminal-dot.y { background: #ffbd2e; }
    .terminal-dot.g { background: #28ca41; }
    .terminal-title {
      margin-left: auto;
      font-size: 0.7rem;
      color: var(--dim);
      letter-spacing: 1px;
    }
    .terminal-body {
      padding: 20px;
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.85rem;
      min-height: 200px;
    }
    .terminal-line {
      opacity: 0;
      animation: typeLine 0.3s ease forwards;
      margin-bottom: 4px;
    }
    .terminal-line .prompt { color: var(--green); }
    .terminal-line .cmd { color: #fff; }
    .terminal-line .out { color: var(--dim); }
    .terminal-line .val { color: var(--cyan); }
    .terminal-line .ok { color: var(--green); }
    .cursor {
      display: inline-block;
      width: 8px;
      height: 16px;
      background: var(--green);
      animation: blink 1s step-end infinite;
      vertical-align: text-bottom;
    }

    @keyframes typeLine {
      to { opacity: 1; }
    }
    @keyframes blink {
      50% { opacity: 0; }
    }

    /* Sections */
    section {
      padding: 80px 0;
    }
    .section-label {
      font-size: 0.7rem;
      color: var(--blue);
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .section-title {
      font-family: 'Share Tech Mono', monospace;
      font-size: 1.8rem;
      color: #fff;
      margin-bottom: 40px;
    }

    /* Flow Steps */
    .flow-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }
    .flow-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 24px;
      position: relative;
    }
    .flow-num {
      font-family: 'Share Tech Mono', monospace;
      font-size: 2rem;
      color: var(--blue);
      opacity: 0.3;
      position: absolute;
      top: 12px;
      right: 16px;
    }
    .flow-card h3 {
      color: var(--cyan);
      font-size: 0.9rem;
      margin-bottom: 8px;
    }
    .flow-card p {
      font-size: 0.8rem;
      color: var(--dim);
    }

    /* Pricing Table */
    .price-table {
      width: 100%;
      border-collapse: collapse;
    }
    .price-table th, .price-table td {
      text-align: left;
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      font-size: 0.85rem;
    }
    .price-table th {
      color: var(--dim);
      font-weight: 500;
      font-size: 0.7rem;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .price-table td.method {
      color: var(--cyan);
      font-family: 'Share Tech Mono', monospace;
    }
    .price-table td.path {
      color: #fff;
      font-family: 'Share Tech Mono', monospace;
    }
    .price-table td.price {
      color: var(--green);
      font-family: 'Share Tech Mono', monospace;
    }

    /* Code Block */
    .code-block {
      background: rgba(3,5,8,0.95);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 24px;
      overflow-x: auto;
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.82rem;
      line-height: 1.7;
    }
    .code-block .kw { color: var(--cyan); }
    .code-block .str { color: var(--green); }
    .code-block .cm { color: var(--dim); }
    .code-block .fn { color: var(--blue); }

    /* Agent Cards */
    .agent-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    .agent-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 24px;
    }
    .agent-card h3 {
      color: var(--blue);
      font-size: 0.95rem;
      margin-bottom: 8px;
    }
    .agent-card p {
      color: var(--dim);
      font-size: 0.82rem;
    }

    /* Tabs */
    .tabs {
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .tab-nav {
      display: flex;
      background: rgba(0,170,255,0.06);
      border-bottom: 1px solid var(--border);
      overflow-x: auto;
    }
    .tab-btn {
      background: none;
      border: none;
      color: var(--dim);
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.75rem;
      padding: 12px 20px;
      cursor: pointer;
      letter-spacing: 1px;
      text-transform: uppercase;
      white-space: nowrap;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .tab-btn:hover { color: var(--text); }
    .tab-btn.active {
      color: var(--blue);
      border-bottom-color: var(--blue);
    }
    .tab-panel {
      display: none;
      padding: 24px;
      font-size: 0.82rem;
      line-height: 1.8;
    }
    .tab-panel.active { display: block; }
    .tab-panel h4 {
      color: var(--cyan);
      font-size: 0.9rem;
      margin: 20px 0 8px;
    }
    .tab-panel h4:first-child { margin-top: 0; }
    .tab-panel code {
      background: rgba(0,170,255,0.1);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Share Tech Mono', monospace;
      color: var(--green);
      font-size: 0.8rem;
    }
    .tab-panel pre {
      background: rgba(3,5,8,0.9);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
      margin: 12px 0;
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.78rem;
      line-height: 1.6;
      color: var(--text);
    }
    .tab-panel ul, .tab-panel ol {
      margin: 8px 0 8px 20px;
    }
    .tab-panel li { margin-bottom: 4px; }

    /* Network Strip */
    .network-strip {
      background: rgba(0,170,255,0.06);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 20px 0;
    }
    .network-inner {
      display: flex;
      justify-content: center;
      gap: 40px;
      flex-wrap: wrap;
      font-size: 0.78rem;
    }
    .network-item .label {
      color: var(--dim);
      font-size: 0.65rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      display: block;
      margin-bottom: 4px;
    }
    .network-item .value {
      color: var(--cyan);
      font-family: 'Share Tech Mono', monospace;
    }

    /* Footer */
    footer {
      padding: 40px 0;
      text-align: center;
      font-size: 0.75rem;
      color: var(--dim);
    }
    footer a {
      color: var(--blue);
      text-decoration: none;
    }
    footer a:hover { text-decoration: underline; }

    /* Responsive */
    @media (max-width: 768px) {
      nav .links { display: none; }
      .hero { padding: 100px 0 60px; }
      section { padding: 60px 0; }
      .network-inner { gap: 20px; }
      .price-table { font-size: 0.75rem; }
      .price-table th, .price-table td { padding: 10px 8px; }
    }

    /* Mobile nav toggle */
    .nav-toggle {
      display: none;
      background: none;
      border: 1px solid var(--border);
      color: var(--blue);
      padding: 6px 10px;
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.8rem;
      cursor: pointer;
      border-radius: 4px;
    }
    @media (max-width: 768px) {
      .nav-toggle { display: block; }
      nav .links.open {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 56px;
        left: 0;
        right: 0;
        background: rgba(3,5,8,0.97);
        padding: 16px 24px;
        border-bottom: 1px solid var(--border);
        gap: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="vignette"></div>

  <!-- NAV -->
  <nav>
    <div class="nav-inner">
      <a href="#" class="logo">x402<span>vpn</span></a>
      <button class="nav-toggle" onclick="document.querySelector('.links').classList.toggle('open')">MENU</button>
      <div class="links">
        <a href="#flow">FLOW</a>
        <a href="#pricing">PRICING</a>
        <a href="#code">CODE</a>
        <a href="#agents">AGENTS</a>
        <a href="#docs">DOCS</a>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero">
    <div class="container">
      <h1>Pay. <span class="accent">Connect.</span> Done.</h1>
      <p>VPN access through x402 micropayments. No signups, no API keys, no KYC. Send USDC on Base, get VPN credentials.</p>

      <div class="terminal">
        <div class="terminal-header">
          <div class="terminal-dot r"></div>
          <div class="terminal-dot y"></div>
          <div class="terminal-dot g"></div>
          <span class="terminal-title">x402vpn boot</span>
        </div>
        <div class="terminal-body" id="boot-terminal">
        </div>
      </div>
    </div>
  </section>

  <!-- FLOW -->
  <section id="flow">
    <div class="container">
      <div class="section-label">Protocol</div>
      <div class="section-title">How it works</div>
      <div class="flow-grid">
        <div class="flow-card">
          <div class="flow-num">01</div>
          <h3>Request</h3>
          <p>Call any paid endpoint. The server responds with HTTP 402 and payment requirements.</p>
        </div>
        <div class="flow-card">
          <div class="flow-num">02</div>
          <h3>Pay</h3>
          <p>Your client signs a USDC payment on Base and resubmits the request with a payment header.</p>
        </div>
        <div class="flow-card">
          <div class="flow-num">03</div>
          <h3>Verify</h3>
          <p>The x402 facilitator verifies the payment on-chain and settles USDC to the server wallet.</p>
        </div>
        <div class="flow-card">
          <div class="flow-num">04</div>
          <h3>Access</h3>
          <p>Payment confirmed. Server delivers VPN credentials, server lists, or config files.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- PRICING -->
  <section id="pricing">
    <div class="container">
      <div class="section-label">Pricing</div>
      <div class="section-title">Pay per action</div>
      <table class="price-table">
        <thead>
          <tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Price</th></tr>
        </thead>
        <tbody>
          <tr>
            <td class="method">POST</td>
            <td class="path">/api/vpn/account</td>
            <td>Create VPN account</td>
            <td class="price">$${pricing.create}</td>
          </tr>
          <tr>
            <td class="method">GET</td>
            <td class="path">/api/vpn/servers</td>
            <td>List server locations</td>
            <td class="price">$${pricing.servers}</td>
          </tr>
          <tr>
            <td class="method">GET</td>
            <td class="path">/api/vpn/ports</td>
            <td>List protocols and ports</td>
            <td class="price">$${pricing.ports}</td>
          </tr>
          <tr>
            <td class="method">GET</td>
            <td class="path">/api/vpn/config</td>
            <td>Download OpenVPN config</td>
            <td class="price">$${pricing.config}</td>
          </tr>
          <tr>
            <td class="method">GET</td>
            <td class="path">/api/vpn/wireguard-config</td>
            <td>Download WireGuard config</td>
            <td class="price">$${pricing.wgConfig}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- CODE -->
  <section id="code">
    <div class="container">
      <div class="section-label">Integration</div>
      <div class="section-title">Five lines to VPN access</div>
      <div class="code-block">
<span class="kw">import</span> { wrapFetch } <span class="kw">from</span> <span class="str">"@x402/fetch"</span>;
<span class="kw">import</span> { createEvmClient } <span class="kw">from</span> <span class="str">"@x402/evm"</span>;

<span class="kw">const</span> client = <span class="fn">createEvmClient</span>({ <span class="str">privateKey</span>: process.env.PRIVATE_KEY });
<span class="kw">const</span> fetchX = <span class="fn">wrapFetch</span>(fetch, client);

<span class="cm">// Create a VPN account, pay $2.00 USDC automatically</span>
<span class="kw">const</span> res = <span class="kw">await</span> <span class="fn">fetchX</span>(<span class="str">"https://x402vpn.com/api/vpn/account"</span>, { <span class="str">method</span>: <span class="str">"POST"</span> });
<span class="kw">const</span> { account } = <span class="kw">await</span> res.<span class="fn">json</span>();
      </div>
    </div>
  </section>

  <!-- AGENTS -->
  <section id="agents">
    <div class="container">
      <div class="section-label">AI Native</div>
      <div class="section-title">Built for agents</div>
      <div class="agent-grid">
        <div class="agent-card">
          <h3>No Authentication</h3>
          <p>No API keys, no OAuth, no sessions. Payment IS authentication. Any agent with a wallet can use the API immediately.</p>
        </div>
        <div class="agent-card">
          <h3>Machine-Readable Docs</h3>
          <p>Serve /skill.md or /llms.txt for structured docs any LLM can parse. Endpoints, costs, and workflows in one file.</p>
        </div>
        <div class="agent-card">
          <h3>Deterministic Pricing</h3>
          <p>Every endpoint has a fixed USDC cost. Agents can budget exactly: $2.52 for full VPN setup with config download.</p>
        </div>
        <div class="agent-card">
          <h3>Standard Protocol</h3>
          <p>Uses HTTP 402 status code as intended. x402 libraries handle payment negotiation automatically.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- DOCS -->
  <section id="docs">
    <div class="container">
      <div class="section-label">Documentation</div>
      <div class="section-title">Agent integration</div>
      <div class="tabs">
        <div class="tab-nav">
          <button class="tab-btn active" onclick="switchTab(event, 'tab-overview')">Overview</button>
          <button class="tab-btn" onclick="switchTab(event, 'tab-endpoints')">Endpoints</button>
          <button class="tab-btn" onclick="switchTab(event, 'tab-integration')">Integration</button>
          <button class="tab-btn" onclick="switchTab(event, 'tab-workflow')">Workflow</button>
          <button class="tab-btn" onclick="switchTab(event, 'tab-usecases')">Use Cases</button>
        </div>

        <div id="tab-overview" class="tab-panel active">
          <h4>What is x402vpn?</h4>
          <p>x402vpn sells VPN access through the x402 payment protocol. Pay USDC on Base, get VPN credentials, server lists, and config files. No signups, no API keys.</p>

          <h4>Network</h4>
          <ul>
            <li>Chain: <code>${network}</code></li>
            <li>Token: USDC</li>
            <li>Protocol: x402 (HTTP 402)</li>
            <li>Settlement: On-chain via facilitator</li>
          </ul>

          <h4>Authentication</h4>
          <p>None required. Payment is authentication. Any x402-compatible client with a funded wallet can access paid endpoints.</p>
        </div>

        <div id="tab-endpoints" class="tab-panel">
          <h4>Free Endpoints</h4>
          <pre>GET /api/health       Health check
GET /api/pricing      Pricing info
GET /skill.md         Agent docs (markdown)
GET /llms.txt         Agent docs (plain text)</pre>

          <h4>Paid Endpoints</h4>
          <pre>POST /api/vpn/account              $${pricing.create}    Create VPN account
GET  /api/vpn/servers              $${pricing.servers}    List server locations
GET  /api/vpn/ports                $${pricing.ports}    List protocols/ports
GET  /api/vpn/config               $${pricing.config}    OpenVPN config
     ?server_id={id}&port_id={id}
GET  /api/vpn/wireguard-config     $${pricing.wgConfig}    WireGuard config
     ?server_id={id}&account_id={id}</pre>

          <h4>Example Response: Create Account</h4>
          <pre>{
  "success": true,
  "account": {
    "username": "x402_a1b2c3d4e5f6g7h8",
    "password": "random-base64url-password",
    "vpn_id": 12345,
    "status": "active",
    "wireguard": {
      "ip": "10.x.x.x",
      "public_key": "..."
    },
    "expires_at": null,
    "created_at": "2025-01-01 00:00:00"
  }
}</pre>
        </div>

        <div id="tab-integration" class="tab-panel">
          <h4>Using @x402/fetch</h4>
          <pre>import { wrapFetch } from "@x402/fetch";
import { createEvmClient } from "@x402/evm";

const client = createEvmClient({
  privateKey: process.env.PRIVATE_KEY
});
const fetchX = wrapFetch(fetch, client);

// Payments are handled automatically
const res = await fetchX(
  "https://x402vpn.com/api/vpn/account",
  { method: "POST" }
);
const data = await res.json();</pre>

          <h4>Using @x402/axios</h4>
          <pre>import { wrapAxios } from "@x402/axios";
import { createEvmClient } from "@x402/evm";
import axios from "axios";

const client = createEvmClient({
  privateKey: process.env.PRIVATE_KEY
});
const axiosX = wrapAxios(axios, client);

const { data } = await axiosX.post(
  "https://x402vpn.com/api/vpn/account"
);</pre>
        </div>

        <div id="tab-workflow" class="tab-panel">
          <h4>Recommended Agent Workflow</h4>
          <ol>
            <li><strong>Check health</strong> - <code>GET /api/health</code> (free)</li>
            <li><strong>Check pricing</strong> - <code>GET /api/pricing</code> (free)</li>
            <li><strong>Create account</strong> - <code>POST /api/vpn/account</code> ($${pricing.create})</li>
            <li><strong>List servers</strong> - <code>GET /api/vpn/servers</code> ($${pricing.servers})</li>
            <li><strong>List ports</strong> - <code>GET /api/vpn/ports</code> ($${pricing.ports})</li>
            <li><strong>Download config</strong> - <code>GET /api/vpn/config</code> ($${pricing.config})</li>
          </ol>
          <p style="margin-top: 16px; color: var(--green);">Total cost: $2.52 USDC for full VPN setup</p>
        </div>

        <div id="tab-usecases" class="tab-panel">
          <h4>Use Cases</h4>
          <ul>
            <li><strong>Geo-routing</strong> - Route traffic through specific countries for location-dependent tasks</li>
            <li><strong>Privacy research</strong> - Agents that need anonymous connectivity for OSINT or web scraping</li>
            <li><strong>Distributed access</strong> - Multiple agents, each with unique VPN identities</li>
            <li><strong>Censorship circumvention</strong> - Access resources restricted by network policy</li>
            <li><strong>Testing and QA</strong> - Verify application behavior from different geographic locations</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- NETWORK STRIP -->
  <div class="network-strip">
    <div class="container">
      <div class="network-inner">
        <div class="network-item">
          <span class="label">Network</span>
          <span class="value">${network}</span>
        </div>
        <div class="network-item">
          <span class="label">Token</span>
          <span class="value">USDC</span>
        </div>
        <div class="network-item">
          <span class="label">Protocol</span>
          <span class="value">x402</span>
        </div>
        <div class="network-item">
          <span class="label">Pay To</span>
          <span class="value" style="font-size:0.72rem;">${payTo}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <footer>
    <div class="container">
      Built on x402 protocol. Payments on Base. <a href="https://x.com/x402vpn" target="_blank" rel="noopener">@x402vpn</a>
    </div>
  </footer>

  <script>
    // Tab switching
    function switchTab(e, tabId) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    }

    // Boot sequence animation
    const lines = [
      { type: 'cmd', text: '> x402vpn init' },
      { type: 'out', text: '[boot] Loading x402 payment middleware...' },
      { type: 'out', text: '[boot] Registering EVM scheme on ${network}...' },
      { type: 'ok',  text: '[  ok] Payment layer active' },
      { type: 'out', text: '[boot] Connecting VPN backend...' },
      { type: 'ok',  text: '[  ok] VPN backend connected' },
      { type: 'out', text: '[boot] Mounting routes...' },
      { type: 'val', text: '       POST /api/vpn/account          $${pricing.create}' },
      { type: 'val', text: '       GET  /api/vpn/servers          $${pricing.servers}' },
      { type: 'val', text: '       GET  /api/vpn/config           $${pricing.config}' },
      { type: 'ok',  text: '[  ok] Server ready on :3402' },
      { type: 'cmd', text: '> _' },
    ];

    const terminal = document.getElementById('boot-terminal');
    lines.forEach((line, i) => {
      const div = document.createElement('div');
      div.className = 'terminal-line';
      div.style.animationDelay = (i * 0.25) + 's';

      if (line.type === 'cmd') {
        const isLast = i === lines.length - 1;
        div.innerHTML = '<span class="prompt">' + line.text.replace('_', '') + '</span>' +
          (isLast ? '<span class="cursor"></span>' : '');
      } else {
        const cls = line.type === 'ok' ? 'ok' : line.type === 'val' ? 'val' : 'out';
        div.innerHTML = '<span class="' + cls + '">' + line.text + '</span>';
      }

      terminal.appendChild(div);
    });
  </script>
</body>
</html>`;
}
