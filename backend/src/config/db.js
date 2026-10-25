
import dns from "node:dns";
import mongoose from "mongoose";

const LOOPBACK_DNS = ["127.0.0.1", "::1"];
const FALLBACK_DNS = ["8.8.8.8", "1.1.1.1"];

// mongodb+srv:// URIs need a DNS SRV lookup.
// On some Windows networks the router only offers an IPv6
// link-local DNS server (fe80::...), which Node cannot use,
// so Node falls back to 127.0.0.1 and the lookup fails with
// "querySrv ECONNREFUSED". Use public DNS in that case.
// Override with DNS_SERVERS=8.8.8.8,1.1.1.1 in .env
const configureDNS = () => {
  const customServers = process.env.DNS_SERVERS?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (customServers?.length) {
    dns.setServers(customServers);
    return;
  }

  const onlyLoopback = dns
    .getServers()
    .every((server) => LOOPBACK_DNS.includes(server));

  if (onlyLoopback) {
    dns.setServers(FALLBACK_DNS);
    console.log("⚠️ DNS : No usable system DNS, using public DNS");
  }
};

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  configureDNS();

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      dbName: "saheli_safar",
    });

    console.log(
      `✅ MongoDB : Connected (${mongoose.connection.name})`
    );
  } catch (error) {
    console.error("❌ MongoDB :", error.message);
    throw error;
  }
};
