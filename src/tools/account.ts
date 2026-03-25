import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CloudflareClient } from "../cloudflare-client.js";

export function registerAccountTools(server: McpServer, cf: CloudflareClient) {
  // ── Get Account Details ─────────────────────────────────
  server.tool(
    "account_get_details",
    "Get Cloudflare account details and info",
    {},
    async () => {
      const result = await cf.getAccountDetails();
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Verify API Token ───────────────────────────────────
  server.tool(
    "account_verify_token",
    "Verify that the configured API token is valid",
    {},
    async () => {
      const result = await cf.verifyToken();
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── List API Tokens ────────────────────────────────────
  server.tool(
    "account_list_tokens",
    "List all API tokens associated with the user",
    {},
    async () => {
      const result = await cf.listAccountTokens();
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );
}
