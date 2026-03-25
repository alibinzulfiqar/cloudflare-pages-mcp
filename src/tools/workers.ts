import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CloudflareClient } from "../cloudflare-client.js";

export function registerWorkersTools(server: McpServer, cf: CloudflareClient) {
  // ── List Workers ────────────────────────────────────────
  server.tool(
    "workers_list",
    "List all Workers scripts in the account",
    {},
    async () => {
      const result = await cf.listWorkers();
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Get Worker Details ──────────────────────────────────
  server.tool(
    "workers_get",
    "Get details of a specific Worker script",
    { script_name: z.string().describe("Worker script name") },
    async ({ script_name }) => {
      const result = await cf.getWorker(script_name);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Deploy Worker Script ────────────────────────────────
  server.tool(
    "workers_deploy",
    "Deploy (create or update) a Worker script with JavaScript code",
    {
      script_name: z.string().describe("Worker script name"),
      script_content: z.string().describe("JavaScript source code for the Worker"),
    },
    async ({ script_name, script_content }) => {
      const result = await cf.putWorkerScript(script_name, script_content);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Delete Worker ───────────────────────────────────────
  server.tool(
    "workers_delete",
    "Delete a Worker script",
    { script_name: z.string().describe("Worker script name to delete") },
    async ({ script_name }) => {
      await cf.deleteWorker(script_name);
      return {
        content: [{ type: "text", text: `Worker '${script_name}' deleted.` }],
      };
    }
  );

  // ── List Worker Routes ──────────────────────────────────
  server.tool(
    "workers_list_routes",
    "List Worker routes for a zone",
    { zone_id: z.string().describe("Zone ID") },
    async ({ zone_id }) => {
      const result = await cf.listWorkerRoutes(zone_id);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Create Worker Route ─────────────────────────────────
  server.tool(
    "workers_create_route",
    "Create a Worker route that maps a URL pattern to a Worker script",
    {
      zone_id: z.string().describe("Zone ID"),
      pattern: z.string().describe("URL pattern (e.g., example.com/api/*)"),
      script: z.string().describe("Worker script name to bind"),
    },
    async ({ zone_id, pattern, script }) => {
      const result = await cf.createWorkerRoute(zone_id, { pattern, script });
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Delete Worker Route ─────────────────────────────────
  server.tool(
    "workers_delete_route",
    "Delete a Worker route",
    {
      zone_id: z.string().describe("Zone ID"),
      route_id: z.string().describe("Route ID to delete"),
    },
    async ({ zone_id, route_id }) => {
      await cf.deleteWorkerRoute(zone_id, route_id);
      return {
        content: [{ type: "text", text: `Worker route ${route_id} deleted.` }],
      };
    }
  );
}
