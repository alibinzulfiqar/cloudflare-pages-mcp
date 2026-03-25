// Cloudflare API type definitions

export interface CloudflareConfig {
  apiToken: string;
  accountId: string;
}

export interface CloudflareResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: Array<{ code: number; message: string }>;
  result: T;
  result_info?: {
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}

// Pages types
export interface PagesProject {
  id: string;
  name: string;
  subdomain: string;
  domains: string[];
  created_on: string;
  latest_deployment?: PagesDeployment;
  canonical_deployment?: PagesDeployment;
  production_branch: string;
  source?: {
    type: string;
    config?: {
      owner: string;
      repo_name: string;
      production_branch: string;
    };
  };
  build_config?: {
    build_command: string;
    destination_dir: string;
    root_dir: string;
  };
  deployment_configs?: {
    production: DeploymentConfig;
    preview: DeploymentConfig;
  };
}

export interface DeploymentConfig {
  env_vars?: Record<string, { value: string }>;
  compatibility_date?: string;
  compatibility_flags?: string[];
}

export interface PagesDeployment {
  id: string;
  short_id: string;
  project_id: string;
  project_name: string;
  environment: string;
  url: string;
  created_on: string;
  modified_on: string;
  latest_stage: {
    name: string;
    status: string;
    started_on: string;
    ended_on: string;
  };
  deployment_trigger?: {
    type: string;
    metadata?: {
      branch: string;
      commit_hash: string;
      commit_message: string;
    };
  };
  stages: Array<{
    name: string;
    status: string;
    started_on: string;
    ended_on: string;
  }>;
  aliases: string[];
  production_branch: string;
}

// DNS types
export interface DnsZone {
  id: string;
  name: string;
  status: string;
  paused: boolean;
  type: string;
  name_servers: string[];
  created_on: string;
  modified_on: string;
}

export interface DnsRecord {
  id: string;
  zone_id: string;
  zone_name: string;
  name: string;
  type: string;
  content: string;
  proxied: boolean;
  proxiable: boolean;
  ttl: number;
  locked: boolean;
  created_on: string;
  modified_on: string;
  priority?: number;
  comment?: string;
}

// Workers types
export interface WorkerScript {
  id: string;
  tag: string;
  etag: string;
  handlers: string[];
  modified_on: string;
  created_on: string;
  usage_model: string;
  last_deployed_from?: string;
}

export interface WorkerRoute {
  id: string;
  pattern: string;
  script: string;
}

// KV types
export interface KvNamespace {
  id: string;
  title: string;
  supports_url_encoding: boolean;
}

export interface KvKey {
  name: string;
  expiration?: number;
  metadata?: Record<string, unknown>;
}

// Account types
export interface AccountInfo {
  id: string;
  name: string;
  type: string;
  created_on: string;
  settings?: Record<string, unknown>;
}
