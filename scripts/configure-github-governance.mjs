#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const item = process.argv[index];
  if (item.startsWith("--")) {
    const key = item.slice(2);
    const next = process.argv[index + 1];
    if (!next || next.startsWith("--")) {
      args.set(key, true);
    } else {
      args.set(key, next);
      index += 1;
    }
  }
}

const repository = String(args.get("repo") ?? process.env.GITHUB_REPOSITORY ?? "aolingge/agent-secret-guard");
const [owner, repo] = repository.includes("/") ? repository.split("/") : [String(args.get("owner") ?? "aolingge"), repository];
const branch = String(args.get("branch") ?? "main");
const apply = args.has("apply");
const token = readToken();
const apiBase = "https://api.github.com";

const labels = [
  ["dependencies", "0366d6", "Dependency update pull requests."],
  ["automated-pr", "0e8a16", "Created by repository automation."],
  ["github-actions", "1d76db", "GitHub Actions workflow or action dependency changes."],
  ["agent-ready", "5319e7", "Well-scoped issue that can be assigned to a coding agent."],
  ["needs-human-review", "d93f0b", "Requires maintainer review before merge."],
  ["maintenance", "5319e7", "Repository health and automation follow-up."],
  ["rules", "fbca04", "Scanner rule request or rule behavior change."],
  ["security", "b60205", "Security-sensitive issue or pull request."]
];

const requiredStatusChecks = ["test (20)", "test (22)", "test (24)", "scan", "analyze"];

function readToken() {
  const envToken = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (envToken) {
    return envToken;
  }

  try {
    return execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "";
  }
}

async function api(method, path, body) {
  if (!token) {
    throw new Error("Set GH_TOKEN or GITHUB_TOKEN before running with --apply.");
  }

  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "agent-secret-guard-governance"
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message ?? response.statusText;
    throw new Error(`${method} ${path}: ${response.status} ${message}`);
  }

  return data;
}

function printPlan() {
  console.log(`Repository: ${owner}/${repo}`);
  console.log(`Branch: ${branch}`);
  console.log("");
  console.log("Planned GitHub governance changes:");
  console.log("- Enable auto-merge and delete branches on merge.");
  console.log("- Keep squash and rebase merge available; disable merge commits for cleaner history.");
  console.log("- Set default workflow token permissions to read-only and allow GitHub Actions PR approvals.");
  console.log("- Create/update workflow labels used by Dependabot, issue forms, and maintenance digest.");
  console.log("- Enable Dependabot vulnerability alerts and automated security fixes where the API permits it.");
  console.log("- Protect main with required status checks: " + requiredStatusChecks.join(", "));
  console.log("- Require one approving PR review, stale review dismissal, conversation resolution, and linear history.");
  console.log("");
  if (!apply) {
    console.log("Dry run only. Re-run with --apply after gh/auth token is ready.");
  }
}

async function upsertLabel(name, color, description) {
  try {
    await api("PATCH", `/repos/${owner}/${repo}/labels/${encodeURIComponent(name)}`, { color, description });
    console.log(`Updated label: ${name}`);
  } catch (error) {
    if (!String(error.message).includes("404")) {
      throw error;
    }

    await api("POST", `/repos/${owner}/${repo}/labels`, { name, color, description });
    console.log(`Created label: ${name}`);
  }
}

async function enableOptional(method, path, label) {
  try {
    await api(method, path);
    console.log(`Enabled: ${label}`);
  } catch (error) {
    console.warn(`Skipped ${label}: ${error.message}`);
  }
}

async function main() {
  printPlan();
  if (!apply) {
    return;
  }

  await api("PATCH", `/repos/${owner}/${repo}`, {
    allow_auto_merge: true,
    delete_branch_on_merge: true,
    allow_squash_merge: true,
    allow_merge_commit: false,
    allow_rebase_merge: true
  });
  console.log("Updated repository merge settings.");

  await api("PUT", `/repos/${owner}/${repo}/actions/permissions/workflow`, {
    default_workflow_permissions: "read",
    can_approve_pull_request_reviews: true
  });
  console.log("Updated Actions workflow token settings.");

  for (const [name, color, description] of labels) {
    await upsertLabel(name, color, description);
  }

  await enableOptional("PUT", `/repos/${owner}/${repo}/vulnerability-alerts`, "Dependabot alerts");
  await enableOptional("PUT", `/repos/${owner}/${repo}/automated-security-fixes`, "Dependabot security updates");

  await api("PUT", `/repos/${owner}/${repo}/branches/${branch}/protection`, {
    required_status_checks: {
      strict: true,
      contexts: requiredStatusChecks
    },
    enforce_admins: false,
    required_pull_request_reviews: {
      dismiss_stale_reviews: true,
      require_code_owner_reviews: false,
      required_approving_review_count: 1
    },
    restrictions: null,
    required_linear_history: true,
    allow_force_pushes: false,
    allow_deletions: false,
    required_conversation_resolution: true
  });
  console.log(`Protected branch: ${branch}`);
}

await main();
