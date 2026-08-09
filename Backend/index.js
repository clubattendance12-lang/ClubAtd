import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // fallback

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // support larger payloads for profile images

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'placeholder_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'placeholder_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'placeholder_api_secret'
});

// Connect to MongoDB Atlas (Serverless Friendly)
let isDbConnecting = false;
const DIRECT_FALLBACK_URI = "mongodb://Attendance_record:G3.m7ix4hgeRCiA@ac-lz4tvwa-shard-00-00.s3con4y.mongodb.net:27017,ac-lz4tvwa-shard-00-01.s3con4y.mongodb.net:27017,ac-lz4tvwa-shard-00-02.s3con4y.mongodb.net:27017/kgi_club_attendance?ssl=true&authSource=admin&replicaSet=atlas-getox9-shard-0";

async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) return;
  if (isDbConnecting) return;
  isDbConnecting = true;

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined.");
    isDbConnecting = false;
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });
    console.log("Pinged your deployment. You successfully connected to MongoDB Atlas!");
  } catch (err) {
    if (err.message.includes("querySrv") || err.message.includes("ENOTFOUND")) {
      try {
        console.log("Retrying MongoDB connection using direct replica set cluster hosts...");
        await mongoose.connect(DIRECT_FALLBACK_URI, { serverSelectionTimeoutMS: 8000 });
        console.log("Pinged your deployment via direct hosts. Successfully connected to MongoDB Atlas!");
        return;
      } catch (fallbackErr) {
        console.error("Error connecting to MongoDB:", fallbackErr.message);
      }
    } else {
      console.error("Error connecting to MongoDB:", err.message);
    }
  } finally {
    isDbConnecting = false;
  }
}

connectToDatabase();

app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

// MongoDB Schemas
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
const Student = mongoose.model('Student', studentSchema);

const adminSchema = new mongoose.Schema({
  adminId: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  isSeniorAdmin: { type: Boolean, default: false },
  profileImageUri: { type: String, default: null }
});
const Admin = mongoose.model('Admin', adminSchema);

const attendanceRecordSchema = new mongoose.Schema({
  studentId: { type: String, required: true, uppercase: true, trim: true },
  studentName: { type: String, default: '' },
  course: { type: String, default: '' },
  branch: { type: String, default: '' },
  section: { type: String, default: '' },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, required: true }, // Format: HH:mm:ss
  clubName: { type: String, required: true },
  status: { type: String, required: true }
});
const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);

// Salt matches Kotlin & local implementation
const MD5_SALT = "QRAttend_Salting_Key";

function md5(input) {
  return crypto.createHash('md5').update(input).digest('hex');
}

function generateSecureQrPayload(collegeId) {
  const hash = md5(collegeId + MD5_SALT).substring(0, 8);
  return `QRAttend://collegeId:${collegeId}:signature:${hash}`;
}

function validateSecureQrPayload(payload, collegeId) {
  return payload === generateSecureQrPayload(collegeId);
}

function extractCollegeIdFromPayload(payload) {
  if (!payload || !payload.startsWith("QRAttend://")) return null;
  try {
    const parts = payload.split(":");
    const colIndex = parts.findIndex(p => p.includes("collegeId"));
    if (colIndex !== -1 && colIndex + 1 < parts.length) {
      return parts[colIndex + 1];
    }
    return null;
  } catch {
    return null;
  }
}

// Database to JS Object mappings
function studentDbToJs(doc) {
  if (!doc) return null;
  return {
    collegeId: doc.collegeId,
    name: doc.name,
    phoneNumber: doc.phoneNumber,
    email: doc.email,
    course: doc.course,
    branch: doc.branch,
    section: doc.section,
    year: doc.year,
    clubName: doc.clubName,
    password: doc.password,
    uniqueId: doc.uniqueId,
    qrCodeData: doc.qrCodeData,
    profileImageUri: doc.profileImageUri,
    resetOtp: doc.resetOtp
  };
}

function adminDbToJs(doc) {
  if (!doc) return null;
  return {
    adminId: doc.adminId,
    password: doc.password,
    isSeniorAdmin: doc.isSeniorAdmin,
    profileImageUri: doc.profileImageUri
  };
}

function recordDbToJs(doc) {
  if (!doc) return null;
  return {
    studentId: doc.studentId,
    studentName: doc.studentName || '',
    course: doc.course || '',
    branch: doc.branch || '',
    section: doc.section || '',
    date: doc.date,
    time: doc.time,
    clubName: doc.clubName,
    status: doc.status
  };
}

// Seeding check on startup
async function seedDefaultAdmin() {
  try {
    await Admin.findOneAndUpdate(
      { adminId: 'kumarkartikeysahu@gmail.com' },
      {
        adminId: 'kumarkartikeysahu@gmail.com',
        password: 'Welcome@321',
        isSeniorAdmin: true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log("Seeding default senior admin checked.");
  } catch (err) {
    console.error("Warning: Seeding default admin failed.", err.message);
  }
}
seedDefaultAdmin();

async function seedDefaultDummyStudent() {
  try {
    const dummyCollegeId = "KGI2026DUMMY";
    const dummyEmail = "john.doe.dummy@kgi.edu.in";
    const existing = await Student.findOne({ $or: [{ collegeId: dummyCollegeId }, { email: dummyEmail }] });
    if (!existing) {
      const randomNum = Math.floor(Math.random() * 900000) + 100000;
      const uniqueId = `STUID-${randomNum}`;
      const qrCodeData = generateSecureQrPayload(dummyCollegeId);
      const encryptedPass = md5("DummyPassword123");

      const student = new Student({
        collegeId: dummyCollegeId,
        name: "John Doe (Dummy)",
        phoneNumber: "9876543210",
        email: dummyEmail,
        course: "B.Tech",
        branch: "Computer Science",
        section: "A",
        year: "3rd Year",
        clubName: "Coding Club",
        password: encryptedPass,
        uniqueId: uniqueId,
        qrCodeData: qrCodeData
      });
      await student.save();
      console.log("Seeding default dummy student checked: Student KGI2026DUMMY created.");
    } else {
      console.log("Seeding default dummy student checked: Dummy student already exists.");
    }
  } catch (err) {
    console.error("Warning: Seeding default dummy student failed.", err.message);
  }
}
seedDefaultDummyStudent();

// API Routes

// 1. Get Students
app.get('/api/students', async (req, res) => {
  try {
    const docs = await Student.find().sort({ name: 1 });
    res.json(docs.map(studentDbToJs));
  } catch (err) {
    console.error("Get students error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. Get Admins
app.get('/api/admins', async (req, res) => {
  try {
    const docs = await Admin.find();
    res.json(docs.map(adminDbToJs));
  } catch (err) {
    console.error("Get admins error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. Get Attendance Records
app.get('/api/records', async (req, res) => {
  try {
    const docs = await AttendanceRecord.find().sort({ date: -1, time: -1 });
    res.json(docs.map(recordDbToJs));
  } catch (err) {
    console.error("Get records error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4. Register Student
app.post('/api/students/register', async (req, res) => {
  const {
    collegeId,
    name,
    phoneNumber,
    email,
    course,
    branch,
    section,
    year,
    clubName,
    passwordPlain
  } = req.body;

  if (!collegeId || !name || !phoneNumber || !email || !passwordPlain) {
    return res.status(400).json({ success: false, message: "Missing required registration inputs." });
  }

  const uppercaseId = collegeId.trim().toUpperCase();
  const trimmedEmail = email.trim();

  try {
    // Check ID duplicate
    const checkId = await Student.findOne({ collegeId: uppercaseId });
    if (checkId) {
      return res.json({ success: false, message: "College ID is already registered." });
    }

    // Check Email duplicate
    const checkEmail = await Student.findOne({ email: { $regex: new RegExp(`^${trimmedEmail}$`, 'i') } });
    if (checkEmail) {
      return res.json({ success: false, message: "Email address is already registered." });
    }

    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    const uniqueId = `STUID-${randomNum}`;
    const qrCodeData = generateSecureQrPayload(uppercaseId);
    const encryptedPass = md5(passwordPlain);

    const student = new Student({
      collegeId: uppercaseId,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      email: trimmedEmail,
      course,
      branch,
      section,
      year,
      clubName,
      password: encryptedPass,
      uniqueId,
      qrCodeData
    });

    await student.save();
    res.json({ success: true, message: "Registration successful!", student: studentDbToJs(student) });
  } catch (err) {
    console.error("Register student error:", err);
    res.status(500).json({ success: false, message: "Server error during registration." });
  }
});

// 5. Authenticate Student
app.post('/api/students/login', async (req, res) => {
  const { loginInput, passwordPlain } = req.body;
  if (!loginInput || !passwordPlain) {
    return res.status(400).json({ success: false, message: "Credentials are required" });
  }

  const cleanInput = loginInput.trim().toLowerCase();

  try {
    const student = await Student.findOne({
      $or: [
        { collegeId: cleanInput.toUpperCase() },
        { email: cleanInput }
      ]
    });

    if (!student) {
      return res.json({ success: false, message: "Invalid Student Credentials." });
    }

    const encryptedInput = md5(passwordPlain);

    if (student.password === encryptedInput) {
      res.json({ success: true, student: studentDbToJs(student) });
    } else {
      res.json({ success: false, message: "Invalid Student Credentials." });
    }
  } catch (err) {
    console.error("Student login error:", err);
    res.status(500).json({ success: false, message: "Server error during authentication." });
  }
});

// 6. Generate Password Reset OTP
app.post('/api/students/generate-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const trimmed = email.trim().toLowerCase();

  try {
    const otp = (Math.floor(Math.random() * 9000) + 1000).toString();
    const student = await Student.findOneAndUpdate(
      { email: { $regex: new RegExp(`^${trimmed}$`, 'i') } },
      { resetOtp: otp },
      { new: true }
    );

    if (!student) {
      return res.json({ success: false, message: "Email is not linked to any student profile." });
    }

    res.json({ success: true, otp });
  } catch (err) {
    console.error("Generate OTP error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 7. Reset Student Password with OTP
app.post('/api/students/reset-password', async (req, res) => {
  const { email, otp, newPasswordPlain } = req.body;
  if (!email || !otp || !newPasswordPlain) {
    return res.status(400).json({ error: "Missing required inputs" });
  }

  const trimmed = email.trim().toLowerCase();

  try {
    const encryptedPass = md5(newPasswordPlain);
    const student = await Student.findOneAndUpdate(
      { email: { $regex: new RegExp(`^${trimmed}$`, 'i') }, resetOtp: otp, resetOtp: { $ne: null } },
      { password: encryptedPass, resetOtp: null },
      { new: true }
    );

    if (!student) {
      return res.json({ success: false, message: "Incorrect OTP code or email." });
    }

    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 8. Update Student Club
app.patch('/api/students/club', async (req, res) => {
  const { collegeId, newClub } = req.body;
  if (!collegeId || !newClub) return res.status(400).json({ error: "Missing inputs" });

  try {
    const student = await Student.findOneAndUpdate(
      { collegeId: collegeId.toUpperCase() },
      { clubName: newClub },
      { new: true }
    );

    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(studentDbToJs(student));
  } catch (err) {
    console.error("Update student club error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 9. Delete Student
app.delete('/api/students/:collegeId', async (req, res) => {
  const { collegeId } = req.params;

  try {
    await Student.deleteOne({ collegeId: collegeId.toUpperCase() });
    // Delete student attendance records as well
    await AttendanceRecord.deleteMany({ studentId: collegeId.toUpperCase() });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete student error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 10. Authenticate Admin
app.post('/api/admins/login', async (req, res) => {
  const { adminId, passwordPlain } = req.body;
  if (!adminId || !passwordPlain) {
    return res.status(400).json({ success: false, message: "Credentials required" });
  }

  const cleanId = adminId.trim().toLowerCase();

  try {
    const admin = await Admin.findOne({ adminId: cleanId });

    if (!admin) {
      return res.json({ success: false, message: "Incorrect Admin ID or access key." });
    }

    if (admin.password === passwordPlain) {
      res.json({ success: true, admin: adminDbToJs(admin) });
    } else {
      res.json({ success: false, message: "Incorrect Admin ID or access key." });
    }
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 11. Register Regular Admin
app.post('/api/admins/register', async (req, res) => {
  const { adminId, passwordPlain } = req.body;
  if (!adminId || !passwordPlain) return res.status(400).json({ error: "Inputs required" });

  const cleanId = adminId.trim().toLowerCase();

  try {
    const check = await Admin.findOne({ adminId: cleanId });
    if (check) {
      return res.json({ success: false, message: "Admin ID already registered" });
    }

    const admin = new Admin({
      adminId: cleanId,
      password: passwordPlain,
      isSeniorAdmin: false
    });
    await admin.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Register admin error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 12. Promote Admin
app.patch('/api/admins/promote', async (req, res) => {
  const { adminId } = req.body;
  if (!adminId) return res.status(400).json({ error: "Admin ID required" });

  try {
    const admin = await Admin.findOneAndUpdate(
      { adminId: adminId.toLowerCase() },
      { isSeniorAdmin: true },
      { new: true }
    );

    if (!admin) return res.json({ success: false, message: "Admin not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Promote admin error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 13. Delete Admin
app.delete('/api/admins/:adminId', async (req, res) => {
  const { adminId } = req.params;

  try {
    await Admin.deleteOne({ adminId: adminId.toLowerCase() });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete admin error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 14. Scan and Mark Attendance
app.post('/api/attendance/scan', async (req, res) => {
  const { qrPayload, currentClub, markedByAdminId } = req.body;
  if (!qrPayload || !currentClub || !markedByAdminId) {
    return res.status(400).json({ success: false, message: "Missing required inputs" });
  }

  const collegeId = extractCollegeIdFromPayload(qrPayload);
  if (!collegeId) {
    return res.json({ success: false, message: "Invalid or corrupted QR Code." });
  }

  try {
    const student = await Student.findOne({ collegeId: collegeId.toUpperCase() });
    if (!student) {
      return res.json({ success: false, message: "Student record not registered in database." });
    }

    if (!validateSecureQrPayload(qrPayload, student.collegeId)) {
      return res.json({ success: false, message: "Security mismatch: Tampered QR code signature.", student: studentDbToJs(student) });
    }

    const todayDate = new Date().toISOString().substring(0, 10);
    const nowTime = new Date().toTimeString().split(' ')[0];

    // Check duplicate today
    const checkDuplicate = await AttendanceRecord.findOne({
      studentId: student.collegeId,
      date: todayDate
    });

    if (checkDuplicate) {
      return res.json({ success: false, message: "Duplicate scan of QR. Attendance already marked today.", student: studentDbToJs(student) });
    }

    const newId = Date.now() + Math.floor(Math.random() * 1000);

    const record = new AttendanceRecord({
      studentId: student.collegeId,
      studentName: student.name,
      course: student.course,
      branch: student.branch,
      section: student.section,
      date: todayDate,
      time: nowTime,
      clubName: currentClub,
      status: 'Present'
    });

    await record.save();

    res.json({ success: true, message: `Attendance Confirmed for ${student.name}!`, student: studentDbToJs(student), record: recordDbToJs(record) });
  } catch (err) {
    console.error("Scan and mark attendance error:", err);
    res.status(500).json({ success: false, message: "Server error during scanning." });
  }
});

// 15. Update Attendance Status Manually
app.post('/api/attendance/manual', async (req, res) => {
  const { studentId, date, status, clubName } = req.body;

  try {
    const record = await AttendanceRecord.findOne({ studentId, date });

    if (record) {
      if (status === "Absent") {
        await AttendanceRecord.deleteOne({ studentId, date });
      } else {
        await AttendanceRecord.updateOne({ studentId, date }, { status });
      }
    } else {
      if (status === "Present") {
        const student = await Student.findOne({ collegeId: studentId.toUpperCase() });
        const nowTime = new Date().toTimeString().split(' ')[0];
        const newRecord = new AttendanceRecord({
          studentId,
          studentName: student?.name || '',
          course: student?.course || '',
          branch: student?.branch || '',
          section: student?.section || '',
          date,
          time: nowTime,
          clubName,
          status: 'Present'
        });
        await newRecord.save();
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Manual attendance error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 16. Sync Records
app.post('/api/records/sync', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "Invalid IDs list" });

  try {
    await AttendanceRecord.updateMany({ id: { $in: ids } }, { isSynced: true });
    res.json({ success: true });
  } catch (err) {
    console.error("Sync records error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 17. Update Student Profile (Cloudinary Integrated!)
app.patch('/api/students/profile', async (req, res) => {
  const { collegeId, email, phoneNumber, year, profileImageUri } = req.body;

  try {
    let imageUrl = profileImageUri;
    if (profileImageUri && profileImageUri.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(profileImageUri, {
        folder: 'kgi_club_attendance'
      });
      imageUrl = uploadRes.secure_url;
    }

    const student = await Student.findOneAndUpdate(
      { collegeId: collegeId.toUpperCase() },
      { email: email.trim(), phoneNumber: phoneNumber.trim(), year, profileImageUri: imageUrl || null },
      { new: true }
    );

    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(studentDbToJs(student));
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 18. Admin Update Student
app.put('/api/students/:oldCollegeId', async (req, res) => {
  const { oldCollegeId } = req.params;
  const {
    collegeId,
    name,
    email,
    phoneNumber,
    course,
    branch,
    section,
    year,
    clubName
  } = req.body;

  const newIdUpper = collegeId.trim().toUpperCase();
  const newEmail = email.trim();

  try {
    const currentStudent = await Student.findOne({ collegeId: oldCollegeId.toUpperCase() });
    if (!currentStudent) {
      return res.json({ success: false, message: "Student record not found." });
    }

    // Check duplicate ID
    if (newIdUpper !== oldCollegeId.toUpperCase()) {
      const duplicateId = await Student.findOne({ collegeId: newIdUpper });
      if (duplicateId) {
        return res.json({ success: false, message: "College ID is already registered by another student." });
      }
    }

    // Check duplicate email
    if (newEmail.toLowerCase() !== currentStudent.email.toLowerCase()) {
      const duplicateEmail = await Student.findOne({ email: { $regex: new RegExp(`^${newEmail}$`, 'i') } });
      if (duplicateEmail) {
        return res.json({ success: false, message: "Email address is already registered by another student." });
      }
    }

    const qrCodeData = newIdUpper !== oldCollegeId.toUpperCase()
      ? generateSecureQrPayload(newIdUpper)
      : currentStudent.qr_code_data;

    const student = await Student.findOneAndUpdate(
      { collegeId: oldCollegeId.toUpperCase() },
      {
        collegeId: newIdUpper,
        name: name.trim(),
        email: newEmail,
        phoneNumber: phoneNumber.trim(),
        course,
        branch,
        section,
        year,
        clubName,
        qrCodeData
      },
      { new: true }
    );

    res.json({ success: true, message: "Student updated successfully.", student: studentDbToJs(student) });
  } catch (err) {
    console.error("Admin update student error:", err);
    res.status(500).json({ success: false, message: "Server error during student update." });
  }
});

// 19. Update Admin Profile (Cloudinary Integrated!)
app.patch('/api/admins/profile', async (req, res) => {
  const { adminId, profileImageUri } = req.body;

  try {
    let imageUrl = profileImageUri;
    if (profileImageUri && profileImageUri.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(profileImageUri, {
        folder: 'kgi_club_attendance'
      });
      imageUrl = uploadRes.secure_url;
    }

    const admin = await Admin.findOneAndUpdate(
      { adminId: adminId.toLowerCase() },
      { profileImageUri: imageUrl || null },
      { new: true }
    );

    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json(adminDbToJs(admin));
  } catch (err) {
    console.error("Update admin profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
