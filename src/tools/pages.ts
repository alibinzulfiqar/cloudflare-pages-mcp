import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CloudflareClient } from "../cloudflare-client.js";

export function registerPagesTools(server: McpServer, cf: CloudflareClient) {
  // ── List Pages Projects ─────────────────────────────────
  server.tool(
    "pages_list_projects",
    "List all Cloudflare Pages projects in the account",
    {},
    async () => {
      const result = await cf.listPagesProjects();
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Get Pages Project ───────────────────────────────────
  server.tool(
    "pages_get_project",
    "Get details of a specific Cloudflare Pages project",
    { project_name: z.string().describe("Name of the Pages project") },
    async ({ project_name }) => {
      const result = await cf.getPagesProject(project_name);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Create Pages Project ────────────────────────────────
  server.tool(
    "pages_create_project",
    "Create a new Cloudflare Pages project",
    {
      name: z.string().describe("Project name (used in subdomain: name.pages.dev)"),
      production_branch: z.string().optional().describe("Production branch name (default: main)"),
      build_command: z.string().optional().describe("Build command (e.g., npm run build)"),
      destination_dir: z.string().optional().describe("Output directory (e.g., dist, build, out)"),
      root_dir: z.string().optional().describe("Root directory for build"),
    },
    async ({ name, production_branch, build_command, destination_dir, root_dir }) => {
      const body: Parameters<typeof cf.createPagesProject>[0] = { name };
      if (production_branch) body.production_branch = production_branch;
      if (build_command || destination_dir || root_dir) {
        body.build_config = {};
        if (build_command) body.build_config.build_command = build_command;
        if (destination_dir) body.build_config.destination_dir = destination_dir;
        if (root_dir) body.build_config.root_dir = root_dir;
      }
      const result = await cf.createPagesProject(body);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Delete Pages Project ────────────────────────────────
  server.tool(
    "pages_delete_project",
    "Delete a Cloudflare Pages project (irreversible)",
    { project_name: z.string().describe("Name of the Pages project to delete") },
    async ({ project_name }) => {
      await cf.deletePagesProject(project_name);
      return {
        content: [{ type: "text", text: `Project '${project_name}' deleted successfully.` }],
      };
    }
  );

  // ── Update Pages Project Settings ───────────────────────
  server.tool(
    "pages_update_project",
    "Update settings for a Cloudflare Pages project (build config, env vars, etc.)",
    {
      project_name: z.string().describe("Name of the Pages project"),
      production_branch: z.string().optional().describe("New production branch"),
      build_command: z.string().optional().describe("New build command"),
      destination_dir: z.string().optional().describe("New output directory"),
      env_vars: z.string().optional().describe("JSON object of environment variables, e.g. {\"KEY\":\"value\"}"),
    },
    async ({ project_name, production_branch, build_command, destination_dir, env_vars }) => {
      const body: Record<string, unknown> = {};
      if (production_branch) body.production_branch = production_branch;
      if (build_command || destination_dir) {
        body.build_config = {
          ...(build_command ? { build_command } : {}),
          ...(destination_dir ? { destination_dir } : {}),
        };
      }
      if (env_vars) {
        const parsed = JSON.parse(env_vars);
        const envMap: Record<string, { value: string }> = {};
        for (const [k, v] of Object.entries(parsed)) {
          envMap[k] = { value: String(v) };
        }
        body.deployment_configs = {
          production: { env_vars: envMap },
          preview: { env_vars: envMap },
        };
      }
      const result = await cf.updatePagesProject(project_name, body);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── List Deployments ────────────────────────────────────
  server.tool(
    "pages_list_deployments",
    "List all deployments for a Cloudflare Pages project",
    { project_name: z.string().describe("Name of the Pages project") },
    async ({ project_name }) => {
      const result = await cf.listPagesDeployments(project_name);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Get Deployment ──────────────────────────────────────
  server.tool(
    "pages_get_deployment",
    "Get details of a specific deployment",
    {
      project_name: z.string().describe("Name of the Pages project"),
      deployment_id: z.string().describe("Deployment ID"),
    },
    async ({ project_name, deployment_id }) => {
      const result = await cf.getPagesDeployment(project_name, deployment_id);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Deploy to Pages (direct upload) ────────────────────
  server.tool(
    "pages_deploy",
    "Deploy files to Cloudflare Pages via direct upload. Provide a mapping of file paths to their content.",
    {
      project_name: z.string().describe("Name of the Pages project"),
      files: z.string().describe(
        "JSON object mapping file paths to file contents, e.g. {\"index.html\":\"<h1>Hello</h1>\",\"style.css\":\"body{margin:0}\"}"
      ),
      branch: z.string().optional().describe("Branch name for this deployment (default: main)"),
    },
    async ({ project_name, files, branch }) => {
      const fileMap: Record<string, string> = JSON.parse(files);
      const formData = new FormData();

      for (const [filePath, content] of Object.entries(fileMap)) {
        const blob = new Blob([content], { type: "application/octet-stream" });
        formData.append(filePath, blob, filePath);
      }

      if (branch) {
        formData.append("branch", branch);
      }

      const result = await cf.createPagesDeployment(project_name, formData);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Delete Deployment ───────────────────────────────────
  server.tool(
    "pages_delete_deployment",
    "Delete a specific deployment",
    {
      project_name: z.string().describe("Name of the Pages project"),
      deployment_id: z.string().describe("Deployment ID to delete"),
    },
    async ({ project_name, deployment_id }) => {
      await cf.deletePagesDeployment(project_name, deployment_id);
      return {
        content: [{ type: "text", text: `Deployment ${deployment_id} deleted.` }],
      };
    }
  );

  // ── Retry Deployment ────────────────────────────────────
  server.tool(
    "pages_retry_deployment",
    "Retry a failed deployment",
    {
      project_name: z.string().describe("Name of the Pages project"),
      deployment_id: z.string().describe("Deployment ID to retry"),
    },
    async ({ project_name, deployment_id }) => {
      const result = await cf.retryPagesDeployment(project_name, deployment_id);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Rollback Deployment ─────────────────────────────────
  server.tool(
    "pages_rollback_deployment",
    "Rollback to a specific deployment",
    {
      project_name: z.string().describe("Name of the Pages project"),
      deployment_id: z.string().describe("Deployment ID to rollback to"),
    },
    async ({ project_name, deployment_id }) => {
      const result = await cf.rollbackPagesDeployment(project_name, deployment_id);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Get Deployment Logs ─────────────────────────────────
  server.tool(
    "pages_get_deployment_logs",
    "Get build logs for a deployment",
    {
      project_name: z.string().describe("Name of the Pages project"),
      deployment_id: z.string().describe("Deployment ID"),
    },
    async ({ project_name, deployment_id }) => {
      const result = await cf.getPagesDeploymentLogs(project_name, deployment_id);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── List Custom Domains ─────────────────────────────────
  server.tool(
    "pages_list_domains",
    "List custom domains for a Pages project",
    { project_name: z.string().describe("Name of the Pages project") },
    async ({ project_name }) => {
      const result = await cf.listPagesDomains(project_name);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Add Custom Domain ───────────────────────────────────
  server.tool(
    "pages_add_domain",
    "Add a custom domain to a Pages project",
    {
      project_name: z.string().describe("Name of the Pages project"),
      domain: z.string().describe("Domain name to add (e.g., example.com)"),
    },
    async ({ project_name, domain }) => {
      const result = await cf.addPagesDomain(project_name, domain);
      return {
        content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }],
      };
    }
  );

  // ── Remove Custom Domain ────────────────────────────────
  server.tool(
    "pages_remove_domain",
    "Remove a custom domain from a Pages project",
    {
      project_name: z.string().describe("Name of the Pages project"),
      domain: z.string().describe("Domain name to remove"),
    },
    async ({ project_name, domain }) => {
      await cf.deletePagesDomain(project_name, domain);
      return {
        content: [{ type: "text", text: `Domain '${domain}' removed from project '${project_name}'.` }],
      };
    }
  );
}
