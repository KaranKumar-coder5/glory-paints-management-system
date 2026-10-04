require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const env = require("./config/env");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    console.log(`API: http://localhost:${PORT}/api/v1`);
  });
};

startServer();
