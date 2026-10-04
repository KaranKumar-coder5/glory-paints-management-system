const rawCors = process.env.CORS_ORIGIN || process.env.CLIENT_URL || "http://localhost:5173";
const corsOrigin = rawCors.includes(",") ? rawCors.split(",").map((s) => s.trim()) : rawCors;

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CORS_ORIGIN: corsOrigin,
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./src/uploads",
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
};

const required = ["MONGODB_URI", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

module.exports = env;
