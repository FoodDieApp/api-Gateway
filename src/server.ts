require("dotenv").config(); // Load environment variables from .env
const app = require("./app");
const http = require("http");
const https = require("https"); // 👈 add this

const server = http.createServer(app);

// Start server on the specified port
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // 🔁 Self-ping every 10 minutes
  setInterval(() => {
    const client = BASE_URL.startsWith("https") ? https : http; // 👈 pick module

    client
      .get(`${BASE_URL}/health`, (res: any) => {
        res.on("data", () => {});
        res.on("end", () => {
          console.log("Self-ping OK");
        });
      })
      .on("error", (err: any) => {
        console.error("Self-ping error:", err.message);
      });
  }, 10 * 60 * 1000); // 10 minutes in ms
});

export {};
