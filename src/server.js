import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors";
import exitHook from "async-exit-hook";
import { CONNECT_DB, CLOSE_DB } from "~/config/mongodb";
import { env } from "~/config/environment";
import { APIs_V1 } from "~/routes/v1";
import { errorHandlingMiddleware } from "./middlewares/errorHandlingMiddleware";
import http from "http";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { initializeWebSocket } from "./sockets"; 
dotenv.config();

cloudinary.config({
  cloud_name: "ddmsl3meg",
  api_key: "961362291431251",
  api_secret: "7eUMxe_QPIjpcjLqTtEh3tkgwhY",
});
const START_SERVER = () => {
  const app = express();

  // Cấu hình middleware
  app.use(
    cors({
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    })
  );

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "50mb" }));
  app.use("/v1", APIs_V1);
  app.use(errorHandlingMiddleware);

  // Tạo HTTP server
  const server = http.createServer(app);

  // Khởi tạo WebSocket server
  initializeWebSocket(server);

  // Lắng nghe server
  server.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`3. Back-end Server is running successfully at http://${env.APP_HOST}:${env.APP_PORT}/`);
  });

  // Ngắt kết nối MongoDB khi server tắt
  exitHook(() => {
    console.log("6. Disconnecting from MongoDB Cloud Atlas...");
    CLOSE_DB();
    console.log("7. Disconnected from MongoDB Cloud Atlas!");
  });
};

// Kết nối MongoDB và khởi chạy server
(async () => {
  try {
    console.log("1. Connecting to MongoDB Cloud Atlas...");
    await CONNECT_DB();
    console.log("2. Connected to MongoDB Cloud Atlas!");
    START_SERVER();
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(0);
  }
})();
