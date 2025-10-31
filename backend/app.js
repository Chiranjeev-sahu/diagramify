import cors from "cors";
import express, { urlencoded } from "express";
import corsOptions from "./src/config/cors.config.js";
import cookieParser from "cookie-parser";
import userRouter from "./src/routes/userRoutes.js";

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/api/v1", userRouter);
export { app };
