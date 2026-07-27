const mongoose = require("mongoose");
const dns = require("dns");

// c-ares 1.34.6 (Node 22.23.1) incorrectly resolves 127.0.0.1 as the system
// DNS server on Windows. Nothing listens on 127.0.0.1:53, causing all SRV
// lookups (mongodb+srv://) to fail with ECONNREFUSED.
// Override with actual upstream DNS servers before any mongoose connection.
const overrideDNS = () => {
  const current = dns.getServers();
  if (current.length === 1 && current[0] === "127.0.0.1") {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
    console.warn(
      "[DNS] c-ares reported 127.0.0.1 — overridden to 8.8.8.8, 8.8.4.4"
    );
  }
};

const connectDB = async () => {
  try {
    overrideDNS();
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
