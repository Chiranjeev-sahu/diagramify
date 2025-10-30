import { app } from "./app.js";
import connectDB from "./src/config/connectDB.js";
// IFFE
(async () => {
  try {
    await connectDB();

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
      console.log(`URL: http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
