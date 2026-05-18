const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

import routes from "./routes/index";
import client from "prom-client";
import responseTime from "response-time";
import { Request, Response } from "express";

const app: any = express();

/* =====================================================
   PROMETHEUS DEFAULT METRICS (CPU, MEMORY, ETC)
===================================================== */
client.collectDefaultMetrics({
  register: client.register,
  labels: {
    service: "api-gateway",
  },
});

/* =====================================================
   MIDDLEWARES
===================================================== */
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:5175",
      "http://localhost:8081",
      "exp://192.168.90.87:8081",
    ],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());

/* =====================================================
   LATENCY HISTOGRAM
===================================================== */
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "status_code"],
  buckets: [50, 100, 200, 300, 400, 500],
});

/* =====================================================
   REQUEST COUNTER (🔥 REQUIRED FOR DASHBOARDS)
===================================================== */
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code", "service"],
});

/* =====================================================
   METRICS MIDDLEWARE (IMPORTANT FIX)
===================================================== */
app.use((req: Request, res: Response, next: any) => {
  const start = Date.now();

  res.on("finish", () => {
    const route = req.originalUrl || req.url;

    const duration = Date.now() - start;

    /* -----------------------
       REQUEST COUNT
    ------------------------ */
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: String(res.statusCode),
      service: "api-gateway",
    });

    /* -----------------------
       RESPONSE TIME
    ------------------------ */
    httpRequestDuration.labels(
      req.method,
      route,
      String(res.statusCode)
    ).observe(duration);
  });

  next();
});

/* =====================================================
   METRICS ENDPOINT
===================================================== */
app.get("/metrics", async (req: any, res: any) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

/* =====================================================
   ROUTES
===================================================== */
app.use("/api", routes);

/* =====================================================
   HEALTH CHECK
===================================================== */
app.get("/health", (req: any, res: any) => {
  res.status(200).send("OK");
});

/* =====================================================
   ERROR HANDLING
===================================================== */
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

module.exports = app;