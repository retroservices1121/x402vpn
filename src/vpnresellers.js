// VPNResellers API v3.2 client wrapper
// Internal module, not user-facing

const BASE_URL = "https://api.vpnresellers.com/v3_2";

class VPNResellersClient {
  constructor(apiToken) {
    if (!apiToken) {
      throw new Error("VPNResellers API token is required");
    }
    this.apiToken = apiToken;
  }

  async request(method, path, body = null) {
    const url = `${BASE_URL}${path}`;
    const options = {
      method,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);

    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      throw new Error(`VPN backend error (${res.status}): ${text}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return res.json();
    }
    return res.text();
  }

  // --- Accounts ---

  async checkUsername(username) {
    return this.request("GET", `/accounts/check_username?username=${encodeURIComponent(username)}`);
  }

  async createAccount(username, password) {
    return this.request("POST", "/accounts", { username, password });
  }

  async getAccount(accountId) {
    return this.request("GET", `/accounts/${accountId}`);
  }

  async deleteAccount(accountId) {
    return this.request("DELETE", `/accounts/${accountId}`);
  }

  async enableAccount(accountId) {
    return this.request("PUT", `/accounts/${accountId}/enable`);
  }

  async disableAccount(accountId) {
    return this.request("PUT", `/accounts/${accountId}/disable`);
  }

  async changePassword(accountId, password) {
    return this.request("PUT", `/accounts/${accountId}/change_password`, { password });
  }

  async setExpiration(accountId, expireAt) {
    return this.request("PUT", `/accounts/${accountId}/expire`, { expire_at: expireAt });
  }

  async validateCredentials(username, password) {
    return this.request("POST", "/accounts/validate", { username, password });
  }

  // --- Servers ---

  async listServers() {
    return this.request("GET", "/servers");
  }

  // --- Configuration ---

  async listPorts() {
    return this.request("GET", "/ports");
  }

  async getOpenVPNConfig(serverId, portId) {
    return this.request("GET", `/configuration?server_id=${serverId}&port_id=${portId}`);
  }

  async downloadOpenVPNConfig(serverId, portId) {
    const url = `${BASE_URL}/configuration/download?server_id=${serverId}&port_id=${portId}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`VPN backend error (${res.status})`);
    }

    return {
      body: await res.text(),
      filename: res.headers.get("content-disposition")?.match(/filename="?(.+?)"?$/)?.[1] || "config.ovpn",
    };
  }

  async getWireGuardConfig(accountId, serverId) {
    return this.request("GET", `/accounts/${accountId}/wireguard-configuration?server_id=${serverId}`);
  }

  async downloadWireGuardConfig(accountId, serverId) {
    const url = `${BASE_URL}/accounts/${accountId}/wireguard-configuration/download?server_id=${serverId}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`VPN backend error (${res.status})`);
    }

    return {
      body: await res.text(),
      filename: res.headers.get("content-disposition")?.match(/filename="?(.+?)"?$/)?.[1] || "wireguard.conf",
    };
  }

  // --- Geo ---

  async getGeoIP() {
    const url = `${BASE_URL}/geoip`;
    const res = await fetch(url);
    return res.json();
  }
}

export default VPNResellersClient;
