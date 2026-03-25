import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CloudflareClient } from "../cloudflare-client.js";

export function registerDnsTools(server: McpServer, cf: CloudflareClient) {
  // ── List Zones ──────────────────────────────────────────
  server.tool(
    "dns_list_zones",
    "List all DNS zones (domains) in the Cloudflare account",
    {
      name: z.string().optional().describe("Filter by zone name (domain)"),
      status: z.string().optional().describe("Filter by status (active, pending, etc.)"),
    },
    async ({ name, status }) => {
      const result = await cf.listZones({ name, status });
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Get Zone Details ────────────────────────────────────
  server.tool(
    "dns_get_zone",
    "Get details of a specific DNS zone",
    { zone_id: z.string().describe("Zone ID") },
    async ({ zone_id }) => {
      const result = await cf.getZone(zone_id);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── List DNS Records ────────────────────────────────────
  server.tool(
    "dns_list_records",
    "List DNS records for a zone",
    {
      zone_id: z.string().describe("Zone ID"),
      type: z.string().optional().describe("Filter by record type (A, AAAA, CNAME, MX, TXT, etc.)"),
      name: z.string().optional().describe("Filter by record name"),
    },
    async ({ zone_id, type, name }) => {
      const result = await cf.listDnsRecords(zone_id, { type, name });
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Create DNS Record ───────────────────────────────────
  server.tool(
    "dns_create_record",
    "Create a new DNS record in a zone",
    {
      zone_id: z.string().describe("Zone ID"),
      type: z.string().describe("Record type (A, AAAA, CNAME, MX, TXT, NS, SRV, etc.)"),
      name: z.string().describe("Record name (e.g., subdomain or @ for root)"),
      content: z.string().describe("Record content (IP address, hostname, text, etc.)"),
      ttl: z.number().optional().describe("TTL in seconds (1 = auto)"),
      proxied: z.boolean().optional().describe("Whether to proxy through Cloudflare (orange cloud)"),
      priority: z.number().optional().describe("Priority (required for MX records)"),
      comment: z.string().optional().describe("Comment for the record"),
    },
    async ({ zone_id, type, name, content, ttl, proxied, priority, comment }) => {
      const result = await cf.createDnsRecord(zone_id, {
        type, name, content, ttl, proxied, priority, comment,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Update DNS Record ───────────────────────────────────
  server.tool(
    "dns_update_record",
    "Update an existing DNS record",
    {
      zone_id: z.string().describe("Zone ID"),
      record_id: z.string().describe("DNS Record ID to update"),
      type: z.string().describe("Record type"),
      name: z.string().describe("Record name"),
      content: z.string().describe("New record content"),
      ttl: z.number().optional().describe("TTL in seconds (1 = auto)"),
      proxied: z.boolean().optional().describe("Whether to proxy through Cloudflare"),
      priority: z.number().optional().describe("Priority (for MX records)"),
      comment: z.string().optional().describe("Comment"),
    },
    async ({ zone_id, record_id, type, name, content, ttl, proxied, priority, comment }) => {
      const result = await cf.updateDnsRecord(zone_id, record_id, {
        type, name, content, ttl, proxied, priority, comment,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Delete DNS Record ───────────────────────────────────
  server.tool(
    "dns_delete_record",
    "Delete a DNS record from a zone",
    {
      zone_id: z.string().describe("Zone ID"),
      record_id: z.string().describe("DNS Record ID to delete"),
    },
    async ({ zone_id, record_id }) => {
      await cf.deleteDnsRecord(zone_id, record_id);
      return {
        content: [{ type: "text", text: `DNS record ${record_id} deleted.` }],
      };
    }
  );
}
