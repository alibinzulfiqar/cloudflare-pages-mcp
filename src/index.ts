#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CloudflareClient } from "./cloudflare-client.js";
import { registerPagesTools } from "./tools/pages.js";
import { registerDnsTools } from "./tools/dns.js";
import { registerWorkersTools } from "./tools/workers.js";
import { registerKvTools } from "./tools/kv.js";
import { registerAccountTools } from "./tools/account.js";

function getConfig() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!apiToken) {
    console.error("Error: CLOUDFLARE_API_TOKEN environment variable is required.");
    console.error("Create one at: https://dash.cloudflare.com/profile/api-tokens");
    process.exit(1);
  }

  if (!accountId) {
    console.error("Error: CLOUDFLARE_ACCOUNT_ID environment variable is required.");
    console.error("Find it in the Cloudflare dashboard URL or account overview page.");
    process.exit(1);
  }

  return { apiToken, accountId };
}

async function main() {
  const config = getConfig();
  const cf = new CloudflareClient(config);

  const server = new McpServer({
    name: "cloudflare-pages-mcp",
    version: "1.0.0",
  });

  // Register all tool groups
  registerAccountTools(server, cf);
  registerPagesTools(server, cf);
  registerDnsTools(server, cf);
  registerWorkersTools(server, cf);
  registerKvTools(server, cf);

  // Start the server on stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
