import type { CloudflareConfig, CloudflareResponse } from "./types.js";

const CF_API_BASE = "https://api.cloudflare.com/client/v4";

export class CloudflareClient {
  private apiToken: string;
  private accountId: string;

  constructor(config: CloudflareConfig) {
    this.apiToken = config.apiToken;
    this.accountId = config.accountId;
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiToken}`,
      "Content-Type": "application/json",
    };
  }

  private get uploadHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiToken}`,
    };
  }

  async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<CloudflareResponse<T>> {
    const url = `${CF_API_BASE}${path}`;
    const isFormData = options.body instanceof FormData;

    const response = await fetch(url, {
      ...options,
      headers: isFormData ? this.uploadHeaders : this.headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Cloudflare API error (${response.status}): ${errorBody}`
      );
    }

    return response.json() as Promise<CloudflareResponse<T>>;
  }

  // ── Account ──────────────────────────────────────────────

  async getAccountDetails() {
    return this.request(`/accounts/${this.accountId}`);
  }

  async listAccountTokens() {
    return this.request("/user/tokens");
  }

  async verifyToken() {
    return this.request("/user/tokens/verify");
  }

  // ── Pages Projects ──────────────────────────────────────

  async listPagesProjects() {
    return this.request(`/accounts/${this.accountId}/pages/projects`);
  }

  async getPagesProject(projectName: string) {
    return this.request(
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}`
    );
  }

  async createPagesProject(body: {
    name: string;
    production_branch?: string;
    build_config?: {
      build_command?: string;
      destination_dir?: string;
      root_dir?: string;
    };
  }) {
    return this.request(`/accounts/${this.accountId}/pages/projects`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async deletePagesProject(projectName: string) {
    return this.request(
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}`,
      { method: "DELETE" }
    );
  }

  async updatePagesProject(
    projectName: string,
    body: Record<string, unknown>
  ) {
    return this.request(
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}`,
      { method: "PATCH", body: JSON.stringify(body) }
    );
  }

  // ── Pages Deployments ───────────────────────────────────

  async listPagesDeployments(projectName: string) {
    return this.request(
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}/deployments`
    );
  }

  async getPagesDeployment(projectName: string, deploymentId: string) {
    return this.request(
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}/deployments/${deploymentId}`
    );
  }

  async createPagesDeployment(projectName: string, formData: FormData) {
    return this.request(
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}/deployments`,
      { method: "POST", body: formData }
    );
  }

  async deletePagesDeployment(projectName: string, deploymentId: string) {
    return this.request(
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}/deployments/${deploymentId}`,
      { method: "DELETE" }
    );
  }

  async retryPagesDeployment(projectName: string, deploymentId: string) {
    return this.request(
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}/deployments/${deploymentId}/retry`,
      { method: "POST" }
    );
  }

  async rollbackPagesDeployment(projectName: string, deploymentId: string) {
    return this.request(
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}/deployments/${deploymentId}/rollback`,
      { method: "POST" }
    );
  }

  async getPagesDeploymentLogs(projectName: string, deploymentId: string) {
    return this.request(
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}/deployments/${deploymentId}/history/logs`
    );
  }

  // ── Pages Domains ───────────────────────────────────────

  async listPagesDomains(projectName: string) {
    return this.request(
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}/domains`
    );
  }

  async addPagesDomain(projectName: string, domain: string) {
    return this.request(
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}/domains`,
      { method: "POST", body: JSON.stringify({ name: domain }) }
    );
  }

  async deletePagesDomain(projectName: string, domain: string) {
    return this.request(
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}/domains/${encodeURIComponent(domain)}`,
      { method: "DELETE" }
    );
  }

  // ── DNS Zones ───────────────────────────────────────────

  async listZones(params?: { name?: string; status?: string; page?: number }) {
    const query = new URLSearchParams();
    if (params?.name) query.set("name", params.name);
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", params.page.toString());
    const qs = query.toString();
    return this.request(`/zones${qs ? `?${qs}` : ""}`);
  }

  async getZone(zoneId: string) {
    return this.request(`/zones/${zoneId}`);
  }

  // ── DNS Records ─────────────────────────────────────────

  async listDnsRecords(
    zoneId: string,
    params?: { type?: string; name?: string }
  ) {
    const query = new URLSearchParams();
    if (params?.type) query.set("type", params.type);
    if (params?.name) query.set("name", params.name);
    const qs = query.toString();
    return this.request(`/zones/${zoneId}/dns_records${qs ? `?${qs}` : ""}`);
  }

  async createDnsRecord(
    zoneId: string,
    body: {
      type: string;
      name: string;
      content: string;
      ttl?: number;
      proxied?: boolean;
      priority?: number;
      comment?: string;
    }
  ) {
    return this.request(`/zones/${zoneId}/dns_records`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updateDnsRecord(
    zoneId: string,
    recordId: string,
    body: {
      type: string;
      name: string;
      content: string;
      ttl?: number;
      proxied?: boolean;
      priority?: number;
      comment?: string;
    }
  ) {
    return this.request(`/zones/${zoneId}/dns_records/${recordId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async deleteDnsRecord(zoneId: string, recordId: string) {
    return this.request(`/zones/${zoneId}/dns_records/${recordId}`, {
      method: "DELETE",
    });
  }

  // ── Workers ─────────────────────────────────────────────

  async listWorkers() {
    return this.request(
      `/accounts/${this.accountId}/workers/scripts`
    );
  }

  async getWorker(scriptName: string) {
    return this.request(
      `/accounts/${this.accountId}/workers/scripts/${encodeURIComponent(scriptName)}`
    );
  }

  async deleteWorker(scriptName: string) {
    return this.request(
      `/accounts/${this.accountId}/workers/scripts/${encodeURIComponent(scriptName)}`,
      { method: "DELETE" }
    );
  }

  async putWorkerScript(scriptName: string, scriptContent: string) {
    return this.request(
      `/accounts/${this.accountId}/workers/scripts/${encodeURIComponent(scriptName)}`,
      {
        method: "PUT",
        body: scriptContent,
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/javascript",
        },
      }
    );
  }

  // ── Workers Routes ──────────────────────────────────────

  async listWorkerRoutes(zoneId: string) {
    return this.request(`/zones/${zoneId}/workers/routes`);
  }

  async createWorkerRoute(
    zoneId: string,
    body: { pattern: string; script: string }
  ) {
    return this.request(`/zones/${zoneId}/workers/routes`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async deleteWorkerRoute(zoneId: string, routeId: string) {
    return this.request(`/zones/${zoneId}/workers/routes/${routeId}`, {
      method: "DELETE",
    });
  }

  // ── KV Namespaces ───────────────────────────────────────

  async listKvNamespaces() {
    return this.request(
      `/accounts/${this.accountId}/storage/kv/namespaces`
    );
  }

  async createKvNamespace(title: string) {
    return this.request(
      `/accounts/${this.accountId}/storage/kv/namespaces`,
      { method: "POST", body: JSON.stringify({ title }) }
    );
  }

  async deleteKvNamespace(namespaceId: string) {
    return this.request(
      `/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}`,
      { method: "DELETE" }
    );
  }

  async listKvKeys(namespaceId: string, prefix?: string) {
    const query = prefix ? `?prefix=${encodeURIComponent(prefix)}` : "";
    return this.request(
      `/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/keys${query}`
    );
  }

  async getKvValue(namespaceId: string, key: string) {
    const url = `${CF_API_BASE}/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`;
    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      throw new Error(`KV read error (${response.status}): ${await response.text()}`);
    }
    return response.text();
  }

  async putKvValue(namespaceId: string, key: string, value: string) {
    const url = `${CF_API_BASE}/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "text/plain",
      },
      body: value,
    });
    if (!response.ok) {
      throw new Error(`KV write error (${response.status}): ${await response.text()}`);
    }
    return response.json();
  }

  async deleteKvKey(namespaceId: string, key: string) {
    return this.request(
      `/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`,
      { method: "DELETE" }
    );
  }
}
