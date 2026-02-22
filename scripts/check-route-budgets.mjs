import { statSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";

const workspaceRoot = process.cwd();

const budgets = [
  {
    route: "/dashboard",
    limitKb: 460,
    manifestPath: ".next/server/app/(protected)/dashboard/page_client-reference-manifest.js",
  },
  {
    route: "/checkin",
    limitKb: 320,
    manifestPath: ".next/server/app/(protected)/checkin/page_client-reference-manifest.js",
  },
  {
    route: "/analytics",
    limitKb: 840,
    manifestPath: ".next/server/app/(protected)/analytics/page_client-reference-manifest.js",
  },
  {
    route: "/profile",
    limitKb: 460,
    manifestPath: ".next/server/app/(protected)/profile/page_client-reference-manifest.js",
  },
];

function sumBytesForRoute(manifestRelativePath) {
  const manifestFile = path.join(workspaceRoot, manifestRelativePath);
  if (!existsSync(manifestFile)) {
    return null;
  }
  const content = readFileSync(manifestFile, "utf8");
  const chunkMatches = content.match(/static\/chunks\/[^"']+\.js/g) ?? [];
  const uniqueAssets = [...new Set(chunkMatches)];

  let bytes = 0;
  for (const asset of uniqueAssets) {
    const filePath = path.join(workspaceRoot, ".next", asset);
    if (!existsSync(filePath)) continue;
    bytes += statSync(filePath).size;
  }
  return bytes;
}

let failed = false;
console.log("Route JS budget check");
for (const budget of budgets) {
  const bytes = sumBytesForRoute(budget.manifestPath);
  if (bytes == null) {
    console.log(`- FAIL ${budget.route}: missing ${budget.manifestPath}`);
    failed = true;
    continue;
  }
  const kb = bytes / 1024;
  const status = kb <= budget.limitKb ? "PASS" : "FAIL";
  console.log(`- ${status} ${budget.route}: ${kb.toFixed(1)}KB (limit ${budget.limitKb}KB)`);
  if (kb > budget.limitKb) {
    failed = true;
  }
}

if (failed) {
  console.error("One or more route budgets exceeded.");
  process.exit(1);
}
