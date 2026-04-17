/**
 * Cloudflare Worker: Route status.{domain} to app.crontinel.com/{domain}/status
 *
 * User adds CNAME: status.acme.com → app.crontinel.com
 * This worker detects the Host header, extracts the domain, and rewrites:
 *   status.acme.com → app.crontinel.com/acme.com/status
 *
 * Routes:
 *   GET /               → rewrite to /{domain}/status
 *   GET /{path}        → passthrough for app.crontinel.com paths
 */
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

function handleRequest(request) {
  const url = new URL(request.url);
  const host = request.headers.get("Host") || "";

  // Only route status.* hosts through this worker
  if (!host.startsWith("status.")) {
    // Passthrough for app.crontinel.com
    return fetch(request);
  }

  // Extract domain from host: status.acme.com → acme.com
  const domain = host.replace(/^status\./, "");

  // Rewrite URL to app.crontinel.com/{domain}/status
  const newUrl = new URL(`https://app.crontinel.com/${domain}/status`);
  url.pathname = newUrl.pathname;
  url.hostname = newUrl.hostname; // Route to app.crontinel.com, not status.crontinel.com

  // Clone request with rewritten URL
  const newRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: request.redirect,
  });

  return fetch(newRequest);
}
