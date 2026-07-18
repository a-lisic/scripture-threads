#!/usr/bin/env node
import http from "node:http";
import { spawn, spawnSync } from "node:child_process";

const host = process.env.SCRIPTURE_THREADS_BRIDGE_HOST || "127.0.0.1";
const port = Number(process.env.SCRIPTURE_THREADS_BRIDGE_PORT || 4517);
const codexBin = process.env.CODEX_BIN || "codex";
const timeoutMs = Number(process.env.SCRIPTURE_THREADS_CODEX_TIMEOUT_MS || 180000);
const defaultOrigins = [
  "https://threads.goodnewsco.church",
  "https://scripture-threads.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];
const allowedOrigins = (process.env.SCRIPTURE_THREADS_ALLOWED_ORIGINS || defaultOrigins.join(","))
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

function corsHeaders(origin = "") {
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Private-Network": "true",
    Vary: "Origin"
  };
}

function sendJson(res, statusCode, payload, origin) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    ...corsHeaders(origin)
  });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 200000) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    req.on("error", reject);
  });
}

function extractJson(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenced) return fenced[1];
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function checkCodex() {
  const result = spawnSync(codexBin, ["--version"], {
    encoding: "utf8",
    env: process.env
  });

  if (result.error) {
    return {
      ok: false,
      error: `Cannot run ${codexBin}: ${result.error.message}`
    };
  }

  if (result.status !== 0) {
    return {
      ok: false,
      error: result.stderr?.trim() || `${codexBin} --version exited with code ${result.status}.`
    };
  }

  return {
    ok: true,
    version: result.stdout?.trim() || "Codex CLI found"
  };
}

function runCodex(prompt) {
  return new Promise((resolve, reject) => {
    console.log(`[${new Date().toISOString()}] Starting Codex generation (${prompt.length} chars).`);
    const child = spawn(codexBin, ["exec", prompt], {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Codex CLI timed out before returning a study."));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      console.error(`[${new Date().toISOString()}] Codex launch failed: ${error.message}`);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        const message = stderr.trim() || `Codex CLI exited with code ${code}.`;
        console.error(`[${new Date().toISOString()}] Codex failed: ${message}`);
        reject(new Error(message));
        return;
      }
      console.log(`[${new Date().toISOString()}] Codex generation completed (${stdout.length} chars).`);
      resolve(stdout.trim());
    });
  });
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "";

  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders(origin));
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    const codex = checkCodex();
    sendJson(
      res,
      codex.ok ? 200 : 503,
      {
        ok: codex.ok,
        service: "scripture-threads-codex-bridge",
        codexBin,
        codexAvailable: codex.ok,
        codexVersion: codex.version,
        codexError: codex.error
      },
      origin
    );
    return;
  }

  if (req.method === "POST" && req.url === "/generate-study") {
    try {
      const body = await readJson(req);
      const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
      if (!prompt) {
        sendJson(res, 400, { error: "Missing prompt." }, origin);
        return;
      }

      const output = await runCodex(prompt);
      const study = JSON.parse(extractJson(output));
      sendJson(res, 200, { study }, origin);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Bridge request failed: ${error instanceof Error ? error.message : "Codex bridge failed."}`);
      sendJson(res, 500, { error: error instanceof Error ? error.message : "Codex bridge failed." }, origin);
    }
    return;
  }

  sendJson(res, 404, { error: "Not found." }, origin);
});

server.listen(port, host, () => {
  console.log(`Scripture Threads Codex bridge listening at http://${host}:${port}`);
  console.log(`Using Codex binary: ${codexBin}`);
  const codex = checkCodex();
  console.log(codex.ok ? `Codex check: ${codex.version}` : `Codex check failed: ${codex.error}`);
  console.log("Keep this terminal open while using Codex CLI as the desktop generation path.");
});
