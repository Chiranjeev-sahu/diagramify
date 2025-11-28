import cookieParser from "cookie-parser";
import cors from "cors";
import express, { urlencoded } from "express";
import corsOptions from "./src/config/cors.config.js";
import { errorMiddleware } from "./src/middleware/error.middleware.js";
import diagramRouter from "./src/routes/diagram.routes.js";
import chatRouter from "./src/routes/chat.routes.js";
import userRouter from "./src/routes/user.routes.js";
import { generateDiagramsPublic } from "./src/controllers/diagram.controller.js";

const app = express();
app.set("trust proxy",1);
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use(cookieParser());

app.post("/api", generateDiagramsPublic);

// Development endpoint to reset IP rate limits
if (process.env.NODE_ENV !== 'production') {
  app.post("/api/reset-ip-limit", (req, res) => {
    const ipAddress = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
    res.json({ 
      message: "To reset IP limits, restart the backend server",
      yourIP: ipAddress 
    });
  });
}

app.use("/api/v1", userRouter);
app.use("/api/v1/diagrams", diagramRouter);
app.use("/api/v1/chats", chatRouter);

app.use(errorMiddleware);
export { app };
