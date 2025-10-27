import express from "express";
import connectDB from "./src/config/connectDB.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Diagramify API is running!",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
