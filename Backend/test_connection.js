import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const MONGODB_URI = process.env.MONGODB_URI;
const DIRECT_URI = "mongodb://Attendance_record:G3.m7ix4hgeRCiA@ac-lz4tvwa-shard-00-00.s3con4y.mongodb.net:27017,ac-lz4tvwa-shard-00-01.s3con4y.mongodb.net:27017,ac-lz4tvwa-shard-00-02.s3con4y.mongodb.net:27017/kgi_club_attendance?ssl=true&authSource=admin&replicaSet=atlas-getox9-shard-0";

async function checkConnection() {
  console.log("Testing MongoDB Atlas connection...");
  
  try {
    console.log("1. Attempting connection via MONGODB_URI from .env...");
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("SUCCESS: Connected to MongoDB Atlas via MONGODB_URI!");
    console.log("Database Host:", mongoose.connection.host);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err1) {
    console.log("Attempt 1 Failed:", err1.message);

    try {
      console.log("\n2. Attempting connection via direct cluster hosts...");
      await mongoose.connect(DIRECT_URI, { serverSelectionTimeoutMS: 8000 });
      console.log("SUCCESS: Connected to MongoDB Atlas via direct cluster hosts!");
      console.log("Database Host:", mongoose.connection.host);
      await mongoose.disconnect();
      process.exit(0);
    } catch (err2) {
      console.log("Attempt 2 Failed:", err2.message);
      console.log("\n================ RESULT SUMMARY ================");
      if (err2.message.includes("IP that isn't whitelisted")) {
        console.log("STATUS: NOT CONNECTED (IP Whitelist Block)");
        console.log("DETAILS: Your current IP address is not whitelisted in MongoDB Atlas Security -> Network Access.");
      } else {
        console.log("STATUS: NOT CONNECTED");
        console.log("DETAILS:", err2.message);
      }
      console.log("=================================================");
      process.exit(1);
    }
  }
}

checkConnection();
