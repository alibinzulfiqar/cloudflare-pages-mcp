import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CloudflareClient } from "../cloudflare-client.js";

export function registerKvTools(server: McpServer, cf: CloudflareClient) {
  // ── List KV Namespaces ──────────────────────────────────
  server.tool(
    "kv_list_namespaces",
    "List all KV namespaces in the account",
    {},
    async () => {
      const result = await cf.listKvNamespaces();
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Create KV Namespace ─────────────────────────────────
  server.tool(
    "kv_create_namespace",
    "Create a new KV namespace",
    { title: z.string().describe("Namespace title/name") },
    async ({ title }) => {
      const result = await cf.createKvNamespace(title);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Delete KV Namespace ─────────────────────────────────
  server.tool(
    "kv_delete_namespace",
    "Delete a KV namespace",
    { namespace_id: z.string().describe("Namespace ID to delete") },
    async ({ namespace_id }) => {
      await cf.deleteKvNamespace(namespace_id);
      return {
        content: [{ type: "text", text: `KV namespace ${namespace_id} deleted.` }],
      };
    }
  );

  // ── List KV Keys ────────────────────────────────────────
  server.tool(
    "kv_list_keys",
    "List keys in a KV namespace",
    {
      namespace_id: z.string().describe("Namespace ID"),
      prefix: z.string().optional().describe("Filter keys by prefix"),
    },
    async ({ namespace_id, prefix }) => {
      const result = await cf.listKvKeys(namespace_id, prefix);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Get KV Value ────────────────────────────────────────
  server.tool(
    "kv_get_value",
    "Read a value from KV storage",
    {
      namespace_id: z.string().describe("Namespace ID"),
      key: z.string().describe("Key to read"),
    },
    async ({ namespace_id, key }) => {
      const value = await cf.getKvValue(namespace_id, key);
      return {
        content: [{ type: "text", text: value }],
      };
    }
  );

  // ── Put KV Value ────────────────────────────────────────
  server.tool(
    "kv_put_value",
    "Write a value to KV storage",
    {
      namespace_id: z.string().describe("Namespace ID"),
      key: z.string().describe("Key to write"),
      value: z.string().describe("Value to store"),
    },
    async ({ namespace_id, key, value }) => {
      await cf.putKvValue(namespace_id, key, value);
      return {
        content: [{ type: "text", text: `Key '${key}' written successfully.` }],
      };
    }
  );

  // ── Delete KV Key ───────────────────────────────────────
  server.tool(
    "kv_delete_key",
    "Delete a key from KV storage",
    {
      namespace_id: z.string().describe("Namespace ID"),
      key: z.string().describe("Key to delete"),
    },
    async ({ namespace_id, key }) => {
      await cf.deleteKvKey(namespace_id, key);
      return {
        content: [{ type: "text", text: `Key '${key}' deleted.` }],
      };
    }
  );
}
