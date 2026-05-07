import express from "express";
import http from "http";
import https from "https";
import { URL } from "url";
import dotenv from "dotenv";

import { auth } from "../middleware/authMiddleware";
import { createProxy } from "../utils/createProxy";

dotenv.config();

const router = express.Router();
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL as string;
const backendUrl = new URL(ORDER_SERVICE_URL);

// ---------------------------------------------------------
// 🔥 1. SPECIAL STREAMING ROUTE FOR /order/stream (SSE)
// ---------------------------------------------------------
router.get("/stream", auth as any, (req, res) => {
  try {
    // Build full URL for backend
    const targetUrl = new URL(req.originalUrl, ORDER_SERVICE_URL);

    // Forward headers (auth + cookies)
    const headers = {
      ...req.headers,
      host: backendUrl.host
    };

    const client = backendUrl.protocol === "https:" ? https : http;

    const proxyReq = client.request(
      targetUrl,
      { method: "GET", headers },
      (proxyRes) => {
        // Remove content-length to allow chunk streaming
        const h = { ...proxyRes.headers };
        delete h["content-length"];

        res.writeHead(proxyRes.statusCode || 200, h);

        // Pipe SSE from order service → client
        proxyRes.pipe(res);

        proxyRes.on("end", () => res.end());
        proxyRes.on("error", () => res.end());
      }
    );

    proxyReq.on("error", (err) => {
      console.error("SSE Proxy Error:", err);
      res.status(502).end("SSE Proxy Failed");
    });

    proxyReq.end();
  } catch (err) {
    console.error("SSE Exception:", err);
    res.status(500).end("Internal Error");
  }
});

// ---------------------------------------------------------
// ⭐ 2. ALL OTHER ORDER ROUTES USE NORMAL PROXY
// ---------------------------------------------------------
router.use("/", auth as any, createProxy(ORDER_SERVICE_URL));

export default router;
