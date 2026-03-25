# Cloudflare Pages MCP Server

An MCP (Model Context Protocol) server that connects to your Cloudflare account, enabling AI assistants to deploy websites to Cloudflare Pages and manage your Cloudflare resources directly.

## Features

| Category | Tools |
|----------|-------|
| **Pages** | Create/delete projects, deploy files, list deployments, rollback, retry, manage custom domains, view build logs |
| **DNS** | List zones, create/update/delete DNS records (A, CNAME, MX, TXT, etc.) |
| **Workers** | Deploy/delete Worker scripts, manage routes |
| **KV Storage** | Create namespaces, read/write/delete key-value pairs |
| **Account** | Verify API token, get account details, list tokens |

## 38 Tools Available

### Pages (15 tools)
- `pages_list_projects` — List all Pages projects
- `pages_get_project` — Get project details
- `pages_create_project` — Create a new project
- `pages_delete_project` — Delete a project
- `pages_update_project` — Update project settings (env vars, build config)
- `pages_list_deployments` — List deployments
- `pages_get_deployment` — Get deployment details
- `pages_deploy` — Deploy files directly to Pages
- `pages_delete_deployment` — Delete a deployment
- `pages_retry_deployment` — Retry a failed deployment
- `pages_rollback_deployment` — Rollback to a deployment
- `pages_get_deployment_logs` — Get build logs
- `pages_list_domains` — List custom domains
- `pages_add_domain` — Add a custom domain
- `pages_remove_domain` — Remove a custom domain

### DNS (6 tools)
- `dns_list_zones` — List all zones/domains
- `dns_get_zone` — Get zone details
- `dns_list_records` — List DNS records
- `dns_create_record` — Create a DNS record
- `dns_update_record` — Update a DNS record
- `dns_delete_record` — Delete a DNS record

### Workers (7 tools)
- `workers_list` — List all Worker scripts
- `workers_get` — Get Worker details
- `workers_deploy` — Deploy a Worker script
- `workers_delete` — Delete a Worker
- `workers_list_routes` — List routes
- `workers_create_route` — Create a route
- `workers_delete_route` — Delete a route

### KV Storage (7 tools)
- `kv_list_namespaces` — List namespaces
- `kv_create_namespace` — Create a namespace
- `kv_delete_namespace` — Delete a namespace
- `kv_list_keys` — List keys
- `kv_get_value` — Read a value
- `kv_put_value` — Write a value
- `kv_delete_key` — Delete a key

### Account (3 tools)
- `account_get_details` — Get account info
- `account_verify_token` — Verify API token
- `account_list_tokens` — List API tokens

## Prerequisites

1. **Node.js** >= 18
2. **Cloudflare API Token** — Create one at [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
3. **Cloudflare Account ID** — Found on the account overview page or in the dashboard URL

### Recommended Token Permissions

When creating your API token, include these permissions:

| Permission | Access |
|-----------|--------|
| Account → Cloudflare Pages | Edit |
| Account → Workers Scripts | Edit |
| Account → Workers KV Storage | Edit |
| Zone → DNS | Edit |
| Zone → Zone | Read |

## Setup

```bash
git clone https://github.com/alibinzulfiqar/cloudflare-pages-mcp.git
cd cloudflare-pages-mcp
npm install
npm run build
```

## Configuration

### VS Code (Copilot / Claude)

Add to your `.vscode/settings.json` or `.vscode/mcp.json`:

```json
{
  "mcp": {
    "servers": {
      "cloudflare-pages": {
        "command": "node",
        "args": ["/absolute/path/to/cloudflare-pages-mcp/dist/index.js"],
        "env": {
          "CLOUDFLARE_API_TOKEN": "your-api-token-here",
          "CLOUDFLARE_ACCOUNT_ID": "your-account-id-here"
        }
      }
    }
  }
}
```

### Claude Desktop

Add to `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cloudflare-pages": {
      "command": "node",
      "args": ["/absolute/path/to/cloudflare-pages-mcp/dist/index.js"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "your-api-token-here",
        "CLOUDFLARE_ACCOUNT_ID": "your-account-id-here"
      }
    }
  }
}
```

## Usage Examples

Once configured, ask your AI assistant things like:

- *"List all my Cloudflare Pages projects"*
- *"Create a new Pages project called my-portfolio"*
- *"Deploy this HTML to my-portfolio on Cloudflare Pages"*
- *"Show me DNS records for example.com"*
- *"Add a CNAME record pointing blog.example.com to my-blog.pages.dev"*
- *"List all my Workers scripts"*
- *"Deploy this Worker script to handle API requests"*
- *"Create a KV namespace called user-sessions"*
- *"Rollback my-site to the previous deployment"*
- *"Show me the build logs for the latest deployment"*

## How Pages Deploy Works

The `pages_deploy` tool accepts a JSON object mapping file paths to content:

```json
{
  "index.html": "<!DOCTYPE html><html><body><h1>Hello World</h1></body></html>",
  "styles/main.css": "body { font-family: sans-serif; }",
  "scripts/app.js": "console.log('deployed!');"
}
```

The server creates a FormData upload and sends it to the Cloudflare Pages direct upload API. Your site will be live at `project-name.pages.dev` within seconds.

## Development

```bash
npm run dev    # Watch mode — recompiles on changes
npm run build  # One-time build
npm start      # Run the server
```

## License

MIT
