import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DIRECT_FALLBACK_URI = "mongodb://Attendance_record:G3.m7ix4hgeRCiA@ac-lz4tvwa-shard-00-00.s3con4y.mongodb.net:27017,ac-lz4tvwa-shard-00-01.s3con4y.mongodb.net:27017,ac-lz4tvwa-shard-00-02.s3con4y.mongodb.net:27017/kgi_club_attendance?ssl=true&authSource=admin&replicaSet=atlas-getox9-shard-0";

const studentSchema = new mongoose.Schema({
  collegeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  course: { type: String, required: true },
  branch: { type: String, required: true },
  section: { type: String, required: true },
  year: { type: String, required: true },
  clubName: { type: String, required: true },
  password: { type: String, required: true },
  uniqueId: { type: String, required: true, unique: true },
  qrCodeData: { type: String, required: true },
  profileImageUri: { type: String, default: null },
  resetOtp: { type: String, default: null }
});

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

const MD5_SALT = "QRAttend_Salting_Key";

function md5(input) {
  return crypto.createHash('md5').update(input).digest('hex');
}

function generateSecureQrPayload(collegeId) {
  const hash = md5(collegeId + MD5_SALT).substring(0, 8);
  return `QRAttend://collegeId:${collegeId}:signature:${hash}`;
}

export const dummyStudentData = {
  collegeId: "KGI2026DUMMY",
  name: "John Doe (Dummy)",
  phoneNumber: "9876543210",
  email: "john.doe.dummy@kgi.edu.in",
  course: "B.Tech",
  branch: "Computer Science",
  section: "A",
  year: "3rd Year",
  clubName: "Coding Club",
  passwordPlain: "DummyPassword123"
};

async function run() {
  console.log("Connecting to MongoDB Atlas...");
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 }).catch(async () => {
      console.log("Retrying with direct cluster connection...");
      await mongoose.connect(DIRECT_FALLBACK_URI, { serverSelectionTimeoutMS: 10000 });
    });

    console.log("Connected successfully to MongoDB Atlas!");

    const dummyCollegeId = dummyStudentData.collegeId;
    const dummyEmail = dummyStudentData.email;

    await Student.deleteOne({ $or: [{ collegeId: dummyCollegeId }, { email: dummyEmail }] });

    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    const uniqueId = `STUID-${randomNum}`;
    const qrCodeData = generateSecureQrPayload(dummyCollegeId);
    const encryptedPass = md5(dummyStudentData.passwordPlain);

    const student = new Student({
      collegeId: dummyCollegeId,
      name: dummyStudentData.name,
      phoneNumber: dummyStudentData.phoneNumber,
      email: dummyEmail,
      course: dummyStudentData.course,
      branch: dummyStudentData.branch,
      section: dummyStudentData.section,
      year: dummyStudentData.year,
      clubName: dummyStudentData.clubName,
      password: encryptedPass,
      uniqueId: uniqueId,
      qrCodeData: qrCodeData
    });

    await student.save();
    console.log("\n==============================================");
    console.log("SUCCESS: Dummy Student Registered in Database!");
    console.log("==============================================");
    console.log("College ID   :", student.collegeId);
    console.log("Name         :", student.name);
    console.log("Email        :", student.email);
    console.log("Phone        :", student.phoneNumber);
    console.log("Course       :", student.course);
    console.log("Branch       :", student.branch);
    console.log("Section      :", student.section);
    console.log("Year         :", student.year);
    console.log("Club Name    :", student.clubName);
    console.log("Password     :", dummyStudentData.passwordPlain);
    console.log("Encrypted MD5:", student.password);
    console.log("Unique ID    :", student.uniqueId);
    console.log("QR Data      :", student.qrCodeData);
    console.log("==============================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n[MONGODB ATLAS ACCESS ISSUE]");
    console.error("Could not connect to MongoDB Atlas cluster.");
    console.error("Reason:", err.message);
    console.error("\nNote: Make sure your current IP address is whitelisted in MongoDB Atlas Security -> Network Access (or allow 0.0.0.0/0).");
    process.exit(1);
  }
}

run();
