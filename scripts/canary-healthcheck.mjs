const baseUrl = process.env.CANARY_BASE_URL ?? "http://127.0.0.1:3000";
const routes = ["/dashboard", "/checkin", "/analytics", "/profile", "/offline"];
const timeoutMs = 10_000;

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, redirect: "manual" });
  } finally {
    clearTimeout(timeout);
  }
}

let hasFailure = false;
for (const route of routes) {
  const url = new URL(route, baseUrl);
  try {
    const response = await fetchWithTimeout(url);
    const status = response.status;
    const ok = status >= 200 && status < 400;
    console.log(`${ok ? "PASS" : "FAIL"} ${route} -> ${status}`);
    if (!ok) hasFailure = true;
  } catch (error) {
    hasFailure = true;
    console.log(`FAIL ${route} -> ${(error && error.message) || "request failed"}`);
  }
}

if (hasFailure) {
  process.exit(1);
}
