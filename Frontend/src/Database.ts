import CryptoJS from 'crypto-js';

// MD5 salt matches the Kotlin implementation
export const MD5_SALT = "QRAttend_Salting_Key";

export function md5(input: string): string {
  return CryptoJS.MD5(input).toString();
}

export function generateSecureQrPayload(collegeId: string): string {
  const hash = md5(collegeId + MD5_SALT).substring(0, 8);
  return `QRAttend://collegeId:${collegeId}:signature:${hash}`;
}

export function validateSecureQrPayload(payload: string, collegeId: string): boolean {
  return payload === generateSecureQrPayload(collegeId);
}

export function extractCollegeIdFromPayload(payload: string): string | null {
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

export interface Student {
  collegeId: string;
  name: string;
  phoneNumber: string;
  email: string;
  course: string;
  branch: string;
  section: string;
  year: string;
  clubName: string;
  password: string; // MD5 encrypted password
  uniqueId: string;
  qrCodeData: string;
  profileImageUri?: string | null;
  resetOtp?: string | null;
}

export interface Admin {
  adminId: string;
  password: string;
  isSeniorAdmin: boolean;
  profileImageUri?: string | null;
}

export interface AttendanceRecord {
  studentId: string;
  studentName?: string;
  course?: string;
  branch?: string;
  section?: string;
  date: string; // format "YYYY-MM-DD"
  time: string; // format "HH:mm:ss"
  clubName: string;
  status: string; // "Present" or "Absent"
}

export interface RegisterResult {
  success: boolean;
  message: string;
  student?: Student;
}

export interface AttendanceResult {
  success: boolean;
  message: string;
  student?: Student;
  record?: AttendanceRecord;
}

export interface AdminUpdateResult {
  success: boolean;
  message: string;
  student?: Student;
}

// REST API calls to our Express backend
export async function getStudents(): Promise<Student[]> {
  const res = await fetch('/api/students');
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

export async function getAdmins(): Promise<Admin[]> {
  const res = await fetch('/api/admins');
  if (!res.ok) throw new Error("Failed to fetch admins");
  return res.json();
}

export async function getRecords(): Promise<AttendanceRecord[]> {
  const res = await fetch('/api/records');
  if (!res.ok) throw new Error("Failed to fetch records");
  return res.json();
}

export async function seedDefaultAdminOnly(): Promise<void> {
  // Seeding is automatically handled on backend startup
}

export async function registerStudent(fields: {
  collegeId: string;
  name: string;
  phoneNumber: string;
  email: string;
  course: string;
  branch: string;
  section: string;
  year: string;
  clubName: string;
  passwordPlain: string;
}): Promise<RegisterResult> {
  const res = await fetch('/api/students/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields)
  });
  if (!res.ok) throw new Error("Failed to register student");
  return res.json();
}

export async function authenticateStudent(loginInput: string, passwordPlain: string): Promise<Student | null> {
  const res = await fetch('/api/students/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginInput, passwordPlain })
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.student : null;
}

export async function generatePasswordResetOtp(email: string): Promise<string | null> {
  const res = await fetch('/api/students/generate-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.otp : null;
}

export async function resetStudentPasswordWithOtp(email: string, otp: string, newPasswordPlain: string): Promise<boolean> {
  const res = await fetch('/api/students/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPasswordPlain })
  });
  if (!res.ok) return false;
  const data = await res.json();
  return !!data.success;
}

export async function updateStudentClub(collegeId: string, newClub: string): Promise<Student | null> {
  const res = await fetch('/api/students/club', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collegeId, newClub })
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteStudent(collegeId: string): Promise<void> {
  const res = await fetch(`/api/students/${encodeURIComponent(collegeId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error("Failed to delete student");
}

export async function authenticateAdmin(adminId: string, passwordPlain: string): Promise<Admin | null> {
  const res = await fetch('/api/admins/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, passwordPlain })
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.admin : null;
}

export async function registerRegularAdmin(adminId: string, passwordPlain: string): Promise<boolean> {
  const res = await fetch('/api/admins/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, passwordPlain })
  });
  if (!res.ok) return false;
  const data = await res.json();
  return !!data.success;
}

export async function promoteAdmin(adminId: string): Promise<boolean> {
  const res = await fetch('/api/admins/promote', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId })
  });
  if (!res.ok) return false;
  const data = await res.json();
  return !!data.success;
}

export async function deleteAdmin(adminId: string): Promise<void> {
  const res = await fetch(`/api/admins/${encodeURIComponent(adminId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error("Failed to delete admin");
}

export async function scanAndMarkAttendance(
  qrPayload: string,
  currentClub: string,
  markedByAdminId: string
): Promise<AttendanceResult> {
  const res = await fetch('/api/attendance/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrPayload, currentClub, markedByAdminId })
  });
  if (!res.ok) throw new Error("Failed to mark attendance");
  return res.json();
}

export async function updateAttendanceStatusManually(
  studentId: string,
  date: string,
  status: string,
  clubName: string,
  markedByAdminId: string
): Promise<void> {
  const res = await fetch('/api/attendance/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, date, status, clubName, markedByAdminId })
  });
  if (!res.ok) throw new Error("Failed to manually update attendance status");
}

export async function getUnsyncedRecords(): Promise<AttendanceRecord[]> {
  return [];
}

export async function markRecordsSynced(ids: number[]): Promise<void> {
  const res = await fetch('/api/records/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });
  if (!res.ok) throw new Error("Failed to sync records");
}

export async function generateExportCsv(currentAdmin: Admin | null): Promise<string> {
  if (!currentAdmin || !currentAdmin.isSeniorAdmin) {
    return "ACCESS DENIED\nThis security report contains sensitive registry rosters and is strictly restricted to Senior Administrators.\n";
  }

  const studentsList = await getStudents();
  const recordsList = await getRecords();
  const presentRecords = recordsList.filter(rec => rec.status !== 'Absent');

  const groups = new Map<string, AttendanceRecord[]>();
  presentRecords.forEach(rec => {
    const stud = studentsList.find(s => s.collegeId === rec.studentId);
    const course = rec.course || stud?.course || "OTHERS";
    const branch = rec.branch || stud?.branch || "GENERAL";
    const key = `${course} - ${branch}`.toUpperCase();
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(rec);
  });

  let csv = "COLLEGE ATTENDANCE DECENTRALIZED SYNC REPORT\n";
  const dateStr = new Date().toISOString().substring(0, 10);
  csv += `Generated On: ${dateStr}\n\n`;

  groups.forEach((list, header) => {
    csv += "==================================================\n";
    csv += `COURSE GROUP: ${header} (${list.length} PRESENT)\n`;
    csv += "==================================================\n";
    csv += "S.No.,Student Name,College ID,Course,Branch,Section,Target Club,Record Timestamp\n";
    list.forEach((rec, index) => {
      const stud = studentsList.find(s => s.collegeId === rec.studentId);
      const name = rec.studentName || stud?.name || "Unregistered Student";
      const crs = rec.course || stud?.course || "N/A";
      const br = rec.branch || stud?.branch || "N/A";
      const sec = rec.section || stud?.section || "N/A";
      csv += `${index + 1},"${name}","${rec.studentId}","${crs}","${br}","${sec}","${rec.clubName}","${rec.date} ${rec.time}"\n`;
    });
    csv += "\n";
  });

  return csv;
}

export async function updateStudentProfile(
  collegeId: string,
  fields: {
    email: string;
    phoneNumber: string;
    year: string;
    profileImageUri?: string | null;
  }
): Promise<Student | null> {
  const res = await fetch('/api/students/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collegeId, ...fields })
  });
  if (!res.ok) return null;
  return res.json();
}

export async function adminUpdateStudent(
  oldCollegeId: string,
  fields: {
    collegeId: string;
    name: string;
    email: string;
    phoneNumber: string;
    course: string;
    branch: string;
    section: string;
    year: string;
    clubName: string;
  }
): Promise<AdminUpdateResult> {
  const res = await fetch(`/api/students/${encodeURIComponent(oldCollegeId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields)
  });
  if (!res.ok) throw new Error("Failed to update student profile");
  return res.json();
}

export function generateStudentsExportCsv(studentsList: Student[]): string {
  let csv = "COLLEGE DECENTRALIZED STUDENT REGISTRY REPORT\n";
  const dateStr = new Date().toISOString().substring(0, 10);
  csv += `Generated On: ${dateStr}\n\n`;
  csv += "S.No.,Student Name,College ID,Email,Phone Number,Course,Branch,Section,Academic Year,Registered Club,Unique ID\n";
  
  studentsList.forEach((st, index) => {
    csv += `${index + 1},"${st.name}","${st.collegeId}","${st.email}","${st.phoneNumber}","${st.course}","${st.branch}","${st.section}","${st.year}","${st.clubName}","${st.uniqueId}"\n`;
  });
  
  return csv;
}

export async function updateAdminProfile(
  adminId: string,
  profileImageUri?: string | null
): Promise<Admin | null> {
  const res = await fetch('/api/admins/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, profileImageUri })
  });
  if (!res.ok) return null;
  return res.json();
}
