import cookieParser from "cookie-parser";
import cors from "cors";
import express, { urlencoded } from "express";
import corsOptions from "./src/config/cors.config.js";
import { errorMiddleware } from "./src/middleware/error.middleware.js";
import diagramRouter from "./src/routes/diagram.routes.js";
import userRouter from "./src/routes/user.routes.js";

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/api/v1", userRouter);
app.use("/api/diagrams", diagramRouter);

app.use(errorMiddleware);
export { app };
