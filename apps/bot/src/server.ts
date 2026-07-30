import "./loadEnv.js";
import http from "node:http";
import { handleApplicationSubmitted, processFormReminders } from "./lib/applications.js";
import { handleAppealSubmitted } from "./lib/appeals.js";
import { handleDiscordInteraction } from "./lib/interactions.js";

const PORT = Number(process.env.PORT ?? process.env.BOT_PORT ?? 8787);

function json(res: http.ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function isInternalAuthorized(req: http.IncomingMessage): boolean {
  const secret = process.env.INTERNAL_BOT_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers["x-internal-bot-secret"];
  const value = Array.isArray(header) ? header[0] : header;
  return value === secret;
}

function isCronAuthorized(req: http.IncomingMessage): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.authorization;
  return auth === `Bearer ${secret}`;
}

function toWebRequest(
  req: http.IncomingMessage,
  body: Buffer,
): Request {
  const host = req.headers.host ?? `127.0.0.1:${PORT}`;
  const url = new URL(req.url ?? "/", `http://${host}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }
  return new Request(url, {
    method: req.method,
    headers,
    body:
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : new Uint8Array(body),
  });
}

async function handleRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<void> {
  const method = req.method ?? "GET";
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const path = url.pathname;

  if (method === "GET" && path === "/health") {
    json(res, 200, { ok: true, service: "ralevel-applications-bot" });
    return;
  }

  if (method === "GET" && path === "/cron/form-reminders") {
    if (!isCronAuthorized(req)) {
      json(res, 401, { error: "Unauthorized" });
      return;
    }
    try {
      const result = await processFormReminders();
      json(res, 200, { ok: true, ...result });
    } catch (err) {
      console.error("[cron/form-reminders]", err);
      json(res, 500, { error: "Failed to process form reminders" });
    }
    return;
  }

  if (method === "POST" && path === "/internal/application-submitted") {
    if (!isInternalAuthorized(req)) {
      json(res, 401, { error: "Unauthorized" });
      return;
    }
    try {
      const raw = await readBody(req);
      const data = JSON.parse(raw.toString("utf8"));
      const result = await handleApplicationSubmitted(data);
      json(res, 200, result);
    } catch (err) {
      console.error("[internal/application-submitted]", err);
      json(res, 500, { error: "Failed to notify Discord" });
    }
    return;
  }

  if (method === "POST" && path === "/internal/appeal-submitted") {
    if (!isInternalAuthorized(req)) {
      json(res, 401, { error: "Unauthorized" });
      return;
    }
    try {
      const raw = await readBody(req);
      const data = JSON.parse(raw.toString("utf8"));
      const result = await handleAppealSubmitted(data);
      json(res, 200, result);
    } catch (err) {
      console.error("[internal/appeal-submitted]", err);
      json(res, 500, { error: "Failed to post appeal review" });
    }
    return;
  }

  if (method === "POST" && path === "/interactions") {
    try {
      const raw = await readBody(req);
      const webReq = toWebRequest(req, raw);
      const response = await handleDiscordInteraction(webReq);
      const responseBody = Buffer.from(await response.arrayBuffer());
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      res.writeHead(response.status, headers);
      res.end(responseBody);
    } catch (err) {
      console.error("[interactions]", err);
      json(res, 500, { error: "Interaction handler failed" });
    }
    return;
  }

  json(res, 404, { error: "Not found" });
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((err) => {
    console.error("[server]", err);
    if (!res.headersSent) {
      json(res, 500, { error: "Internal server error" });
    }
  });
});

server.listen(PORT, () => {
  console.log(`[applications-bot] listening on :${PORT}`);
});

function shutdown(signal: string) {
  console.log(`[applications-bot] received ${signal}, shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
