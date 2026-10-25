
import "dotenv/config";

import mongoose from "mongoose";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT) || 5000;

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, "0.0.0.0", () => {
      console.log("\n🚀 SAHELI SAFAR API");
      console.log(
        `✅ Server  : http://localhost:${PORT}`
      );
      console.log("✅ Health  : /api/health\n");
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

const shutdown = async () => {
  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) =>
          error ? reject(error) : resolve()
        );
      });
    }

    await mongoose.disconnect();
    console.log("🛑 Server stopped.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Shutdown failed:", error.message);
    process.exit(1);
  }
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

startServer();
