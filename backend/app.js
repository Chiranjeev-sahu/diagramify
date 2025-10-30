import cors from "cors";
import express, { urlencoded } from "express";
import corsOptions from "./src/config/cors.config.js";

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cors(corsOptions));

export { app };
