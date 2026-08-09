import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  School,
  Wifi,
  WifiOff,
  Palette,
  X,
  ArrowLeft,
  User,
  Shield,
  LogOut,
  Trash2,
  Camera,
  Plus,
  Check,
  UserCheck,
  FileText,
  Edit,
  Save,
  Download,
  Search,
  UserPlus,
  ArrowUpDown
} from 'lucide-react';
import * as db from './Database';

const cssProfiles = [
  {
    id: "slate",
    name: "Midnight Obsidian",
    description: "Sleek dark slate with clinical indigo and emerald.",
    colors: ["#6366f1", "#10b981", "#0f172a", "#f59e0b"]
  },
  {
    id: "cyber",
    name: "Cyber Oasis",
    description: "High-contrast neon cyan and hot magenta details.",
    colors: ["#06b6d4", "#d946ef", "#030712", "#fbbf24"]
  },
  {
    id: "emerald",
    name: "Forest Mint",
    description: "Earthy deep green canvas with fresh mint accents.",
    colors: ["#34d399", "#6ee7b7", "#051b14", "#f59e0b"]
  },
  {
    id: "velvet",
    name: "Sunset Velvet",
    description: "Royal plum backdrop with warm sunset rose details.",
    colors: ["#f43f5e", "#fb7185", "#18021a", "#fbbf24"]
  },
  {
    id: "gold",
    name: "Imperial Gold",
    description: "Prestigious golden elements with amber highlights.",
    colors: ["#d4af37", "#c5a039", "#140d07", "#eaa222"]
  }
];

export default function App() {
  // Database states
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [admins, setAdmins] = useState([]);

  // Theme states
  const [themeId, setThemeId] = useState("slate");
  const [showThemeDrawer, setShowThemeDrawer] = useState(false);

  // Connection & Sync States
  const [isOnline, setIsOnline] = useState(true);
  const [syncState, setSyncState] = useState({ type: 'Idle' });

  // Navigation states
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [authScreen, setAuthScreen] = useState('opening');
  const [studentAction, setStudentAction] = useState('Login');
  const [adminTab, setAdminTab] = useState('Scanner');
  const [activeClub, setActiveClub] = useState("Samwaad");

  // QR Code Scanner State
  const [cameraScannerActive, setCameraScannerActive] = useState(false);

  // Forms Input States
  const [instituteCodeInput, setInstituteCodeInput] = useState("");
  const [instituteCodeError, setInstituteCodeError] = useState("");
  const [verifiedInstituteCode, setVerifiedInstituteCode] = useState("");

  // Student Reg Fields
  const [regName, setRegName] = useState("");
  const [regCollegeId, setRegCollegeId] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regCourse, setRegCourse] = useState("B.Tech");
  const [regBranch, setRegBranch] = useState("AI/ML");
  const [regSection, setRegSection] = useState("A");
  const [regYear, setRegYear] = useState("1st Year");
  const [regClub, setRegClub] = useState("Samwaad");
  const [regPassword, setRegPassword] = useState("");

  // Credentials Log-in / Recovery Fields
  const [loginUserKey, setLoginUserKey] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [adminRegisterId, setAdminRegisterId] = useState("");
  const [adminRegisterPassword, setAdminRegisterPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");

  // Feedback states
  const [registerStatus, setRegisterStatus] = useState(null);
  const [loginStatus, setLoginStatus] = useState(null);
  const [recoveryStatus, setRecoveryStatus] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  // Student Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editYear, setEditYear] = useState("1st Year");
  const [editPhoto, setEditPhoto] = useState(null);
  const [editProfileStatus, setEditProfileStatus] = useState(null);

  // Admin Profile Edit States
  const [isEditingAdminProfile, setIsEditingAdminProfile] = useState(false);
  const [editAdminPhoto, setEditAdminPhoto] = useState(null);
  const [editAdminProfileStatus, setEditAdminProfileStatus] = useState(null);

  // Student Sheet State Variables
  const [sheetSearch, setSheetSearch] = useState("");
  const [sheetFilterCourse, setSheetFilterCourse] = useState("All");
  const [sheetFilterBranch, setSheetFilterBranch] = useState("All");
  const [sheetFilterSection, setSheetFilterSection] = useState("All");
  const [sheetFilterYear, setSheetFilterYear] = useState("All");
  const [sheetFilterClub, setSheetFilterClub] = useState("All");

  const [sheetSortColumn, setSheetSortColumn] = useState(null);
  const [sheetSortDirection, setSheetSortDirection] = useState('asc');

  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editRowName, setEditRowName] = useState("");
  const [editRowCollegeId, setEditRowCollegeId] = useState("");
  const [editRowEmail, setEditRowEmail] = useState("");
  const [editRowPhone, setEditRowPhone] = useState("");
  const [editRowCourse, setEditRowCourse] = useState("B.Tech");
  const [editRowBranch, setEditRowBranch] = useState("AI/ML");
  const [editRowSection, setEditRowSection] = useState("A");
  const [editRowYear, setEditRowYear] = useState("1st Year");
  const [editRowClub, setEditRowClub] = useState("Samwaad");
  const [sheetEditStatus, setSheetEditStatus] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [sheetAddName, setSheetAddName] = useState("");
  const [sheetAddCollegeId, setSheetAddCollegeId] = useState("");
  const [sheetAddEmail, setSheetAddEmail] = useState("");
  const [sheetAddPhone, setSheetAddPhone] = useState("");
  const [sheetAddCourse, setSheetAddCourse] = useState("B.Tech");
  const [sheetAddBranch, setSheetAddBranch] = useState("AI/ML");
  const [sheetAddSection, setSheetAddSection] = useState("A");
  const [sheetAddYear, setSheetAddYear] = useState("1st Year");
  const [sheetAddClub, setSheetAddClub] = useState("Samwaad");
  const [sheetAddPassword, setSheetAddPassword] = useState("");
  const [sheetAddStatus, setSheetAddStatus] = useState(null);

  // Preseed default database
  useEffect(() => {
    const initDb = async () => {
      await db.seedDefaultAdminOnly();
      await refreshDbState();
    };
    initDb();
  }, []);

  // Update Vanilla CSS classes on root element
  useEffect(() => {
    document.documentElement.className = themeId === 'slate' ? '' : `theme-${themeId}`;
  }, [themeId]);

  // Synchronize dynamic courses options according to campus code
  useEffect(() => {
    const courses = getCoursesForCampus(verifiedInstituteCode);
    const defaultCourse = courses[0] || "B.Tech";
    setRegCourse(defaultCourse);
  }, [verifiedInstituteCode]);

  // Synchronize branches when course changes
  useEffect(() => {
    const branches = getBranchesForCourse(regCourse);
    setRegBranch(branches.length > 0 ? branches[0] : "N/A");
  }, [regCourse]);

  // Synchronize branches when editRowCourse changes
  useEffect(() => {
    const branches = getBranchesForCourse(editRowCourse);
    setEditRowBranch(branches.length > 0 ? branches[0] : "N/A");
  }, [editRowCourse]);

  // Synchronize branches when sheetAddCourse changes
  useEffect(() => {
    const branches = getBranchesForCourse(sheetAddCourse);
    setSheetAddBranch(branches.length > 0 ? branches[0] : "N/A");
  }, [sheetAddCourse]);

  // Camera scanner setup
  useEffect(() => {
    let scanner = null;
    if (cameraScannerActive) {
      // Small timeout to guarantee DOM node reader is mounted
      setTimeout(() => {
        try {
          scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 15, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
          );
          scanner.render(
            async (decodedText) => {
              if (scanner) {
                scanner.clear().catch(err => console.error("Error clearing scanner", err));
              }
              setCameraScannerActive(false);
              await handleQrScan(decodedText);
            },
            () => {
              // Silent error as it scans continuously
            }
          );
        } catch (e) {
          console.error("Failed to start Html5QrcodeScanner:", e);
        }
      }, 100);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Cleanup scan error", err));
      }
    };
  }, [cameraScannerActive]);

  const refreshDbState = async () => {
    try {
      const [st, recs, adm] = await Promise.all([
        db.getStudents(),
        db.getRecords(),
        db.getAdmins()
      ]);
      setStudents(st || []);
      setRecords(recs || []);
      setAdmins(adm || []);
    } catch (err) {
      console.error("Error refreshing database state:", err);
    }
  };

  const triggerBackgroundSync = async (forcedRecords) => {
    if (!isOnline) return;
    setSyncState({ type: 'Syncing' });

    try {
      setSyncState({ type: 'Success', count: records.length });
      await refreshDbState();
      setTimeout(() => setSyncState({ type: 'Idle' }), 3000);
    } catch (err) {
      console.error("Sync error:", err);
      setSyncState({ type: 'Idle' });
    }
  };

  const handleOnlineToggle = async (e) => {
    const online = e.target.checked;
    setIsOnline(online);
    if (online) {
      // Trigger sync for any outstanding records
      await triggerBackgroundSync();
    }
  };

  const clearForms = () => {
    setRegName("");
    setRegCollegeId("");
    setRegPhone("");
    setRegEmail("");
    setRegSection("A");
    setRegYear("1st Year");
    setRegClub("Samwaad");
    setRegPassword("");
    setLoginUserKey("");
    setLoginPassword("");
    setAdminRegisterId("");
    setAdminRegisterPassword("");
    setForgotEmail("");
    setForgotOtp("");
    setForgotNewPassword("");
    setRegisterStatus(null);
    setLoginStatus(null);
    setRecoveryStatus(null);
    setScanResult(null);
    setInstituteCodeInput("");
    setInstituteCodeError("");
  };

  // Student Actions
  const handleStudentRegister = async (e) => {
    e.preventDefault();
    if (!regCollegeId || !regName || !regPhone || !regEmail || !regPassword) {
      setRegisterStatus("Please fulfill all registration inputs.");
      return;
    }

    try {
      const res = await db.registerStudent({
        collegeId: regCollegeId,
        name: regName,
        phoneNumber: regPhone,
        email: regEmail,
        course: regCourse,
        branch: regBranch,
        section: regSection,
        year: regYear,
        clubName: regClub,
        passwordPlain: regPassword
      });

      if (res.success && res.student) {
        setRegisterStatus(`Registration Successful! Unique Code: ${res.student.uniqueId}`);
        // Auto login student
        setTimeout(() => {
          setCurrentStudent(res.student);
          setCurrentAdmin(null);
          clearForms();
        }, 1500);
      } else {
        setRegisterStatus(res.message);
      }
      await refreshDbState();
    } catch (err) {
      console.error("Register error:", err);
      setRegisterStatus("Server error during registration.");
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    if (!loginUserKey || !loginPassword) {
      setLoginStatus("Fulfill login fields.");
      return;
    }

    try {
      const student = await db.authenticateStudent(loginUserKey, loginPassword);
      if (student) {
        setCurrentStudent(student);
        setCurrentAdmin(null);
        setLoginStatus("Log-in Approved!");
        clearForms();
      } else {
        setLoginStatus("Invalid Student Credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginStatus("Server error during login.");
    }
  };

  const handleRequestOtp = async () => {
    if (!forgotEmail) {
      setRecoveryStatus("Email field cannot be blank.");
      return;
    }
    try {
      const otp = await db.generatePasswordResetOtp(forgotEmail);
      if (otp) {
        setRecoveryStatus(`Recovery OTP issued: ${otp}`);
      } else {
        setRecoveryStatus("Email is not linked to any student profile.");
      }
      await refreshDbState();
    } catch (err) {
      console.error("OTP error:", err);
      setRecoveryStatus("Server error requesting OTP.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotOtp || !forgotNewPassword) {
      setRecoveryStatus("Fulfill all verification inputs.");
      return;
    }
    try {
      const ok = await db.resetStudentPasswordWithOtp(forgotEmail, forgotOtp, forgotNewPassword);
      if (ok) {
        setRecoveryStatus("Password changed securely. Use new password to log in.");
        setTimeout(() => {
          setStudentAction('Login');
          clearForms();
        }, 2000);
      } else {
        setRecoveryStatus("Incorrect confirmation OTP code.");
      }
      await refreshDbState();
    } catch (err) {
      console.error("Reset password error:", err);
      setRecoveryStatus("Server error resetting password.");
    }
  };

  const startEditingProfile = () => {
    if (!currentStudent) return;
    setEditEmail(currentStudent.email);
    setEditPhone(currentStudent.phoneNumber);
    setEditYear(currentStudent.year);
    setEditPhoto(currentStudent.profileImageUri || null);
    setEditProfileStatus(null);
    setIsEditingProfile(true);
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limit size to 2MB to prevent localStorage overflow
        setEditProfileStatus("Image must be smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentStudent) return;

    if (!editEmail || !editPhone) {
      setEditProfileStatus("Email and phone fields cannot be empty.");
      return;
    }

    try {
      const updated = await db.updateStudentProfile(currentStudent.collegeId, {
        email: editEmail,
        phoneNumber: editPhone,
        year: editYear,
        profileImageUri: editPhoto
      });

      if (updated) {
        setCurrentStudent(updated);
        setIsEditingProfile(false);
        setEditProfileStatus(null);
        await refreshDbState();
      } else {
        setEditProfileStatus("Failed to update profile.");
      }
    } catch (err) {
      console.error("Profile save error:", err);
      setEditProfileStatus("Server error updating profile.");
    }
  };

  const startEditingAdminProfile = () => {
    if (!currentAdmin) return;
    setEditAdminPhoto(currentAdmin.profileImageUri || null);
    setEditAdminProfileStatus(null);
    setIsEditingAdminProfile(true);
  };

  const handleAdminProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limit size to 2MB
        setEditAdminProfileStatus("Image must be smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAdminPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    if (!currentAdmin) return;

    try {
      const updated = await db.updateAdminProfile(currentAdmin.adminId, editAdminPhoto);

      if (updated) {
        setCurrentAdmin(updated);
        setIsEditingAdminProfile(false);
        setEditAdminProfileStatus(null);
        await refreshDbState();
      } else {
        setEditAdminProfileStatus("Failed to update admin profile.");
      }
    } catch (err) {
      console.error("Admin profile save error:", err);
      setEditAdminProfileStatus("Server error updating admin profile.");
    }
  };

  // Admin Actions
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!loginUserKey || !loginPassword) {
      setLoginStatus("Fulfill login fields.");
      return;
    }

    try {
      const admin = await db.authenticateAdmin(loginUserKey, loginPassword);
      if (admin) {
        setCurrentAdmin(admin);
        setCurrentStudent(null);
        setLoginStatus("Admin Verified!");
        clearForms();
      } else {
        setLoginStatus("Incorrect Admin ID or access key.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setLoginStatus("Server error during login.");
    }
  };

  const handleCreateRegularAdmin = async (e) => {
    e.preventDefault();
    if (!adminRegisterId || !adminRegisterPassword) return;
    try {
      const ok = await db.registerRegularAdmin(adminRegisterId, adminRegisterPassword);
      if (ok) {
        setAdminRegisterId("");
        setAdminRegisterPassword("");
        await refreshDbState();
      }
    } catch (err) {
      console.error("Create admin error:", err);
    }
  };

  const handlePromoteAdmin = async (id) => {
    try {
      const ok = await db.promoteAdmin(id);
      if (ok) {
        await refreshDbState();
      }
    } catch (err) {
      console.error("Promote admin error:", err);
    }
  };

  const handleRemoveAdmin = async (id) => {
    if (id.toLowerCase() === currentAdmin?.adminId.toLowerCase()) return;

    const target = admins.find(a => a.adminId.toLowerCase() === id.toLowerCase());
    if (target?.isSeniorAdmin) {
      // Only the super admin kumarkartikeysahu@gmail.com can remove other senior admins
      if (currentAdmin?.adminId.toLowerCase() !== "kumarkartikeysahu@gmail.com") {
        return;
      }
    }
    try {
      await db.deleteAdmin(id);
      await refreshDbState();
    } catch (err) {
      console.error("Remove admin error:", err);
    }
  };

  const handleRemoveStudent = async (id) => {
    try {
      await db.deleteStudent(id);
      await refreshDbState();
    } catch (err) {
      console.error("Remove student error:", err);
    }
  };

  const handleManualAttendance = async (studentId, date, status) => {
    if (!currentAdmin) return;
    try {
      await db.updateAttendanceStatusManually(studentId, date, status, activeClub, currentAdmin.adminId);
      await refreshDbState();
      if (isOnline) {
        await triggerBackgroundSync();
      }
    } catch (err) {
      console.error("Manual attendance error:", err);
    }
  };

  const handleQrScan = async (payload) => {
    if (!currentAdmin) return;
    try {
      const res = await db.scanAndMarkAttendance(payload, activeClub, currentAdmin.adminId);
      setScanResult(res.message);
      await refreshDbState();
      if (res.success && isOnline) {
        // Pass the updated records state to avoid closure latency
        const recordsFresh = await db.getRecords();
        await triggerBackgroundSync(recordsFresh);
      }
    } catch (err) {
      console.error("Scan QR error:", err);
      setScanResult("Server error scanning QR code.");
    }
  };

  const handleExportCsv = async () => {
    try {
      const csvContent = await db.generateExportCsv(currentAdmin);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const today = new Date().toISOString().substring(0, 10);
      link.setAttribute("download", `attendance_report_${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export CSV error:", err);
    }
  };

  const handleSort = (column) => {
    if (sheetSortColumn === column) {
      setSheetSortDirection(sheetSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSheetSortColumn(column);
      setSheetSortDirection('asc');
    }
  };

  const startEditingRow = (st) => {
    setEditingStudentId(st.collegeId);
    setEditRowName(st.name);
    setEditRowCollegeId(st.collegeId);
    setEditRowEmail(st.email);
    setEditRowPhone(st.phoneNumber);
    setEditRowCourse(st.course);
    setEditRowBranch(st.branch);
    setEditRowSection(st.section);
    setEditRowYear(st.year);
    setEditRowClub(st.clubName);
    setSheetEditStatus(null);
  };

  const handleSaveSheetEdit = async (e, oldCollegeId) => {
    e.preventDefault();
    if (!editRowCollegeId || !editRowName || !editRowPhone || !editRowEmail) {
      setSheetEditStatus("Please fill all required inputs.");
      return;
    }

    try {
      const res = await db.adminUpdateStudent(oldCollegeId, {
        collegeId: editRowCollegeId,
        name: editRowName,
        email: editRowEmail,
        phoneNumber: editRowPhone,
        course: editRowCourse,
        branch: editRowBranch,
        section: editRowSection,
        year: editRowYear,
        clubName: editRowClub
      });

      if (res.success) {
        setEditingStudentId(null);
        setSheetEditStatus(null);
        await refreshDbState();
      } else {
        setSheetEditStatus(res.message);
      }
    } catch (err) {
      console.error("Sheet edit save error:", err);
      setSheetEditStatus("Server error updating student registry.");
    }
  };

  const handleSheetAddStudent = async (e) => {
    e.preventDefault();
    if (!sheetAddCollegeId || !sheetAddName || !sheetAddPhone || !sheetAddEmail || !sheetAddPassword) {
      setSheetAddStatus("Please fill all required inputs.");
      return;
    }

    try {
      const res = await db.registerStudent({
        collegeId: sheetAddCollegeId,
        name: sheetAddName,
        phoneNumber: sheetAddPhone,
        email: sheetAddEmail,
        course: sheetAddCourse,
        branch: sheetAddBranch,
        section: sheetAddSection,
        year: sheetAddYear,
        clubName: sheetAddClub,
        passwordPlain: sheetAddPassword
      });

      if (res.success && res.student) {
        setSheetAddStatus(`Student ${res.student.name} added successfully!`);
        setSheetAddName("");
        setSheetAddCollegeId("");
        setSheetAddPhone("");
        setSheetAddEmail("");
        setSheetAddPassword("");
        setTimeout(() => {
          setShowAddForm(false);
          setSheetAddStatus(null);
        }, 1500);
        await refreshDbState();
      } else {
        setSheetAddStatus(res.message);
      }
    } catch (err) {
      console.error("Add student error:", err);
      setSheetAddStatus("Server error adding student.");
    }
  };

  const handleExportStudentSheetCsv = (filteredList) => {
    const csvContent = db.generateStudentsExportCsv(filteredList);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const today = new Date().toISOString().substring(0, 10);
    link.setAttribute("download", `student_registry_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    setCurrentStudent(null);
    setCurrentAdmin(null);
    clearForms();
  };

  // Helper selectors
  const getCoursesForCampus = (code) => {
    const clean = code.toUpperCase().trim();
    if (clean === "KIT428") return ["B.Tech", "Polythecnic"];
    if (clean === "KIMS1123") return ["BBA", "BCA", "MCA", "MBA"];
    if (clean === "KIP551") return ["B.Pharma", "D.Pharma"];
    return ["B.Tech", "MBA", "MCA", "BBA", "BCA", "B.Pharma", "Polythecnic", "D.Pharma"];
  };

  const getBranchesForCourse = (course) => {
    if (course === "B.Tech") {
      return ["ASH", "CS", "AI/ML", "EN", "Civil", "Mechanical", "Bio-tech"];
    }
    if (course === "Polythecnic") {
      return ["CS", "Civil", "EN", "Mechanical"];
    }
    return [];
  };

  const todayDate = new Date().toISOString().substring(0, 10);

  const filteredStudents = students
    .filter(st => {
      const term = sheetSearch.toLowerCase().trim();
      const matchesSearch = !term ||
        st.name.toLowerCase().includes(term) ||
        st.collegeId.toLowerCase().includes(term) ||
        st.email.toLowerCase().includes(term) ||
        st.phoneNumber.includes(term);

      const matchesCourse = sheetFilterCourse === "All" || st.course === sheetFilterCourse;
      const matchesBranch = sheetFilterBranch === "All" || st.branch === sheetFilterBranch;
      const matchesSection = sheetFilterSection === "All" || st.section === sheetFilterSection;
      const matchesYear = sheetFilterYear === "All" || st.year === sheetFilterYear;
      const matchesClub = sheetFilterClub === "All" || st.clubName === sheetFilterClub;

      return matchesSearch && matchesCourse && matchesBranch && matchesSection && matchesYear && matchesClub;
    })
    .sort((a, b) => {
      if (!sheetSortColumn) return 0;
      let valA = a[sheetSortColumn] || "";
      let valB = b[sheetSortColumn] || "";

      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();

      if (valA < valB) return sheetSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sheetSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="app-container">
      {/* Top Header Bar */}
      <header className="header-bar">
        <div className="logo-section">
          <div className="logo-circle" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="https://ik.imagekit.io/syustaging/SYU_PREPROD/LOGO_MCDq6Oq0h.webp"
              alt="KGI Club Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="title-group">
            <h1>KGI CLUB ATTENDANCE</h1>
          </div>
        </div>

        <div className="header-right">
          <div className="network-badge">
            <span className={`badge-dot ${isOnline ? 'dot-online' : 'dot-offline'}`}></span>
            <span className={isOnline ? 'badge-online' : 'badge-offline'}>
              {isOnline ? "Synced" : "Offline"}
            </span>
          </div>

          <button className="icon-btn" onClick={() => setShowThemeDrawer(!showThemeDrawer)} title="Select Theme Style">
            <Palette size={18} />
          </button>
        </div>
      </header>

      {/* Themes Customizer Drawer */}
      {showThemeDrawer && (
        <div className="theme-drawer">
          <div className="drawer-header">
            <div className="drawer-title">
              <h2>THEME CHANGER</h2>
            </div>
            <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setShowThemeDrawer(false)}>
              <X size={14} />
            </button>
          </div>

          <div className="theme-grid">
            {cssProfiles.map(p => (
              <div
                key={p.id}
                className={`theme-card ${themeId === p.id ? 'active' : ''}`}
                onClick={() => setThemeId(p.id)}
              >
                <div>
                  <div className="theme-name">{p.name}</div>
                  <div className="theme-desc">{p.description}</div>
                </div>
                <div className="theme-swatches">
                  {p.colors.map((c, i) => (
                    <span key={i} className="swatch" style={{ backgroundColor: c }}></span>
                  ))}
                  {themeId === p.id && <Check size={14} className="theme-check-icon" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Container Core */}
      <main className="main-content">
        {!currentStudent && !currentAdmin ? (
          // ==================== AUTHENTICATION VIEWS ====================
          <>
            {authScreen === 'opening' && (
              <div className="glass-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                <div style={{ display: 'inline-flex', marginBottom: 20, width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)', backgroundColor: '#ffffff', padding: 10, alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src="https://ik.imagekit.io/syustaging/SYU_PREPROD/LOGO_MCDq6Oq0h.webp"
                    alt="KGI Club Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.5px', marginBottom: 8 }}>KGI CLUB ATTENDANCE</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32, padding: '0 16px' }}>
                  Club Attendance Management System
                </p>

                <div className="form-group" style={{ maxWidth: 320, margin: '0 auto' }}>
                  <button className="primary-btn" onClick={() => { setAuthScreen('student_code'); clearForms(); }}>
                    <User size={18} />
                    <span>Student Login</span>
                  </button>
                  <button className="primary-btn danger-btn" onClick={() => { setAuthScreen('admin'); clearForms(); }}>
                    <Shield size={18} />
                    <span>Admin Login</span>
                  </button>
                </div>
              </div>
            )}

            {authScreen === 'student_code' && (
              <div className="glass-card">
                <button className="secondary-btn" onClick={() => setAuthScreen('opening')} style={{ marginBottom: 20 }}>
                  <ArrowLeft size={16} />
                  <span>Back to Home</span>
                </button>

                <div className="card-header-styled">
                  <h2>Select Institution</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                    Choose your campus to continue
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                  {[
                    { code: "KIT428", name: "KIT / Engineering Campus", courses: "B.Tech, Polytechnic" },
                    { code: "KIMS1123", name: "KIMS / Management & Computer Studies", courses: "BBA, BCA, MCA, MBA" },
                    { code: "KIP551", name: "KIP / Pharmacy Campus", courses: "B.Pharma, D.Pharma" }
                  ].map((inst) => (
                    <button
                      key={inst.code}
                      type="button"
                      onClick={() => {
                        setVerifiedInstituteCode(inst.code);
                        const available = getCoursesForCampus(inst.code);
                        if (available && available.length > 0) {
                          setRegCourse(available[0]);
                        }
                        setAuthScreen('student_auth');
                        setStudentAction('Login');
                        clearForms();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 18px',
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{inst.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Courses: {inst.courses}
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'var(--logo-bg)',
                        color: 'var(--primary)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: '1px solid var(--border)',
                        whiteSpace: 'nowrap',
                        marginLeft: '12px'
                      }}>
                        {inst.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {authScreen === 'student_auth' && (
              <div className="glass-card">
                <button className="secondary-btn" onClick={() => setAuthScreen('student_code')} style={{ marginBottom: 20 }}>
                  <ArrowLeft size={16} />
                  <span>Change Institution ({verifiedInstituteCode})</span>
                </button>

                <div className="card-header-styled">
                  <h2>
                    {studentAction === 'Login' ? 'Student Sign-In' : studentAction === 'Register' ? 'New Student Register' : 'Reset Safe Password'}
                  </h2>
                </div>

                {studentAction === 'Login' && (
                  <form onSubmit={handleStudentLogin} className="form-group">
                    <div className="input-wrapper">
                      <label className="input-label">COLLEGE ID OR EMAIL</label>
                      <input
                        type="text"
                        className="styled-input"
                        placeholder="STKITV / example@gmail.com"
                        value={loginUserKey}
                        onChange={(e) => setLoginUserKey(e.target.value)}
                        required
                      />
                    </div>
                    <div className="input-wrapper">
                      <label className="input-label">PASSWORD</label>
                      <input
                        type="password"
                        className="styled-input"
                        placeholder="Enter Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>

                    {loginStatus && <div className="feedback-text">{loginStatus}</div>}

                    <button type="submit" className="primary-btn">
                      Submit
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                      <button type="button" className="link-btn" onClick={() => { setStudentAction('Register'); clearForms(); }}>
                        Register
                      </button>
                      <button type="button" className="link-btn" onClick={() => { setStudentAction('Forgot'); clearForms(); }}>
                        Forgot Password?
                      </button>
                    </div>
                  </form>
                )}

                {studentAction === 'Register' && (
                  <form onSubmit={handleStudentRegister} className="form-group">
                    <div className="input-wrapper">
                      <label className="input-label">FULL NAME</label>
                      <input
                        type="text"
                        className="styled-input"
                        placeholder="Enter Name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="input-wrapper">
                      <label className="input-label">COLLEGE ID</label>
                      <input
                        type="text"
                        className="styled-input"
                        placeholder="STKITV"
                        value={regCollegeId}
                        onChange={(e) => setRegCollegeId(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                    <div className="input-wrapper">
                      <label className="input-label">EMAIL ADDRESS</label>
                      <input
                        type="email"
                        className="styled-input"
                        placeholder="example@gmail.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="input-wrapper">
                      <label className="input-label">CONTACT NUMBER</label>
                      <input
                        type="tel"
                        className="styled-input"
                        placeholder="Enter phone number"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className="input-wrapper">
                      <label className="input-label">COURSE</label>
                      <div className="option-grid">
                        {getCoursesForCampus(verifiedInstituteCode).map(c => (
                          <button
                            key={c}
                            type="button"
                            className={`option-btn ${regCourse === c ? 'active' : ''}`}
                            onClick={() => setRegCourse(c)}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {getBranchesForCourse(regCourse).length > 0 && (
                      <div className="input-wrapper">
                        <label className="input-label">BRANCH</label>
                        <div className="chips-scroll-row">
                          {getBranchesForCourse(regCourse).map(b => (
                            <button
                              key={b}
                              type="button"
                              className={`chip-btn ${regBranch === b ? 'active' : ''}`}
                              onClick={() => setRegBranch(b)}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="input-wrapper">
                      <label className="input-label">SECTION</label>
                      <div className="option-grid">
                        {['A', 'B', 'C'].map(sec => (
                          <button
                            key={sec}
                            type="button"
                            className={`option-btn ${regSection === sec ? 'active' : ''}`}
                            onClick={() => setRegSection(sec)}
                          >
                            Sec {sec}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="input-wrapper">
                      <label className="input-label">ACADEMIC YEAR</label>
                      <div className="option-grid">
                        {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(yr => (
                          <button
                            key={yr}
                            type="button"
                            className={`option-btn ${regYear === yr ? 'active' : ''}`}
                            onClick={() => setRegYear(yr)}
                          >
                            {yr}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="input-wrapper">
                      <label className="input-label">CLUB</label>
                      <div className="chips-scroll-row">
                        {['Samwaad', 'Chitran', 'Alaap', 'Social', 'Yoddha', 'Techno', 'Natraj'].map(club => (
                          <button
                            key={club}
                            type="button"
                            className={`chip-btn ${regClub === club ? 'active' : ''}`}
                            onClick={() => setRegClub(club)}
                          >
                            {club}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="input-wrapper">
                      <label className="input-label">SECURE ACCESS PASSWORD</label>
                      <input
                        type="password"
                        className="styled-input"
                        placeholder="Min 6 characters recommended"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                      />
                    </div>

                    {registerStatus && <div className="feedback-text">{registerStatus}</div>}

                    <button type="submit" className="primary-btn">
                      Agree & Proceed Register
                    </button>

                    <button type="button" className="back-btn-center" onClick={() => { setStudentAction('Login'); clearForms(); }}>
                      Already registered? Login
                    </button>
                  </form>
                )}

                {studentAction === 'Forgot' && (
                  <div className="form-group">
                    <div className="input-wrapper">
                      <label className="input-label">ENTER LINKED EMAIL</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="email"
                          className="styled-input"
                          placeholder="student@college.edu"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                        />
                        <button type="button" className="secondary-btn" style={{ whiteSpace: 'nowrap' }} onClick={handleRequestOtp}>
                          Generate OTP
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleResetPassword} className="form-group">
                      <div className="input-wrapper">
                        <label className="input-label">ENTER VERIFICATION OTP</label>
                        <input
                          type="text"
                          className="styled-input"
                          placeholder="4-digit OTP"
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-wrapper">
                        <label className="input-label">NEW SECURITY PASSWORD</label>
                        <input
                          type="password"
                          className="styled-input"
                          placeholder="Choose safe passcode"
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          required
                        />
                      </div>

                      {recoveryStatus && <div className="feedback-text">{recoveryStatus}</div>}

                      <button type="submit" className="primary-btn">
                        Change Secret Password
                      </button>
                    </form>

                    <button type="button" className="back-btn-center" onClick={() => { setStudentAction('Login'); clearForms(); }}>
                      Return to Log-in Frame
                    </button>
                  </div>
                )}
              </div>
            )}

            {authScreen === 'admin' && (
              <div className="glass-card">
                <button className="secondary-btn" onClick={() => setAuthScreen('opening')} style={{ marginBottom: 20 }}>
                  <ArrowLeft size={16} />
                  <span>Back to Home</span>
                </button>

                <div className="card-header-styled">
                  <h2>Admin Gate Access</h2>
                </div>

                <form onSubmit={handleAdminLogin} className="form-group">
                  <div className="input-wrapper">
                    <label className="input-label">ADMIN ID</label>
                    <input
                      type="email"
                      className="styled-input danger-focus"
                      placeholder="admin@college.org"
                      value={loginUserKey}
                      onChange={(e) => setLoginUserKey(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label">PASSWORD</label>
                    <input
                      type="password"
                      className="styled-input danger-focus"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  {loginStatus && <div className="feedback-text" style={{ color: 'var(--danger)' }}>{loginStatus}</div>}

                  <button type="submit" className="primary-btn" style={{ backgroundColor: 'var(--danger)' }}>
                    Submit
                  </button>
                </form>
              </div>
            )}
          </>
        ) : currentStudent ? (
          // ==================== STUDENT INTERACTIVE PORTAL ====================
          <div className="glass-card">
            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="form-group" style={{ animation: 'fadeIn 0.3s' }}>
                <div className="card-header-styled">
                  <h2>Update Profile Details</h2>
                </div>

                <div className="input-wrapper" style={{ alignItems: 'center', marginBottom: 16 }}>
                  <div className="profile-avatar-circle" style={{ width: 80, height: 80, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    {editPhoto ? (
                      <img src={editPhoto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={40} />
                    )}
                  </div>
                  <label className="secondary-btn" style={{ padding: '6px 12px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignSelf: 'center' }}>
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleProfilePhotoChange}
                    />
                  </label>
                  {editPhoto && (
                    <button
                      type="button"
                      className="link-btn"
                      style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4, display: 'inline-flex', alignSelf: 'center' }}
                      onClick={() => setEditPhoto(null)}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <div className="input-wrapper">
                  <label className="input-label">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    className="styled-input"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label">CONTACT NUMBER</label>
                  <input
                    type="tel"
                    className="styled-input"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label">ACADEMIC YEAR</label>
                  <div className="option-grid">
                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(yr => (
                      <button
                        key={yr}
                        type="button"
                        className={`option-btn ${editYear === yr ? 'active' : ''}`}
                        onClick={() => setEditYear(yr)}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                {editProfileStatus && <div className="feedback-text">{editProfileStatus}</div>}

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button type="submit" className="primary-btn" style={{ flex: 1, backgroundColor: 'var(--secondary)' }}>
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    style={{ flex: 1 }}
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-header">
                  <div className="profile-avatar-circle" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentStudent.profileImageUri ? (
                      <img
                        src={currentStudent.profileImageUri}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div className="profile-title-info">
                    <h3>{currentStudent.name}</h3>
                    <p>ID: {currentStudent.collegeId}</p>
                    <p>Sec: {currentStudent.section}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    <button className="logout-icon-btn" onClick={handleLogout} title="Log Out">
                      <LogOut size={20} />
                    </button>
                    <button
                      className="secondary-btn"
                      style={{ padding: '4px 8px', fontSize: 11, whiteSpace: 'nowrap' }}
                      onClick={startEditingProfile}
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>

                <div className="info-details-block">
                  <div className="detail-row">
                    <span className="detail-label">COURSE GROUP</span>
                    <span className="detail-val">{currentStudent.course} - {currentStudent.branch}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">YEAR & CONTACT</span>
                    <span className="detail-val">{currentStudent.year} | {currentStudent.phoneNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">ACTIVE DECENTRALIZED CLUB</span>
                    <span className="detail-val detail-val-primary">{currentStudent.clubName.toUpperCase()}</span>
                  </div>
                </div>

                <div className="unique-id-banner">
                  <div className="unique-id-label">DECENTRALIZED UNIQUE REGISTER ID</div>
                  <div className="unique-id-val">{currentStudent.uniqueId}</div>
                </div>

                {/* QR display section */}
                <div className="qr-container">
                  <h4 className="qr-section-title">YOUR SECURE ESCORT QR SIGNATURE</h4>
                  <p className="qr-disclaimer">
                    Contains an encrypted MD5 checksum signature designed for offline scanner verification.
                  </p>
                  <div className="qr-frame">
                    <QRCodeSVG
                      value={db.generateSecureQrPayload(currentStudent.collegeId)}
                      size={180}
                      level="M"
                    />
                  </div>
                </div>

                {/* Individual Records logged list */}
                <h4 className="records-section-title">YOUR RECENT LOGGED PRESENT RECORDS</h4>
                {records.filter(r => r.studentId === currentStudent.collegeId).length === 0 ? (
                  <p className="no-data-text">No log marks recorded for today.</p>
                ) : (
                  records
                    .filter(r => r.studentId === currentStudent.collegeId)
                    .map((r, i) => (
                      <div key={i} className="record-item">
                        <div>
                          <div className="record-title">{r.clubName} (Marked Present)</div>
                          <div className="record-subtitle">{r.date} at {r.time}</div>
                        </div>
                        <UserCheck size={20} className="record-check" />
                      </div>
                    ))
                )}
              </>
            )}
          </div>
        ) : (
          // ==================== ADMIN SYSTEM CONTROL DESK ====================
          <div className="glass-card">
            <div className="profile-header">
              <div className="profile-avatar-circle" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {currentAdmin?.profileImageUri ? (
                  <img
                    src={currentAdmin.profileImageUri}
                    alt="Admin Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Shield size={32} style={{ color: 'var(--danger)' }} />
                )}
              </div>
              <div className="profile-title-info">
                <h3>Console: Registrar Admin</h3>
                <p>{currentAdmin?.adminId}</p>
                {currentAdmin?.isSeniorAdmin && <span className="senior-badge">Senior Administrator</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                <button className="logout-icon-btn" onClick={handleLogout} title="Log Out">
                  <LogOut size={22} />
                </button>
                <button
                  className="secondary-btn"
                  style={{ padding: '4px 8px', fontSize: 11, whiteSpace: 'nowrap' }}
                  onClick={startEditingAdminProfile}
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {isEditingAdminProfile ? (
              <form onSubmit={handleSaveAdminProfile} className="form-group" style={{ animation: 'fadeIn 0.3s', padding: 20 }}>
                <div className="card-header-styled">
                  <h2>Update Admin Profile</h2>
                </div>

                <div className="input-wrapper" style={{ alignItems: 'center', marginBottom: 16 }}>
                  <div className="profile-avatar-circle" style={{ width: 80, height: 80, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    {editAdminPhoto ? (
                      <img src={editAdminPhoto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Shield size={40} style={{ color: 'var(--danger)' }} />
                    )}
                  </div>
                  <label className="secondary-btn" style={{ padding: '6px 12px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignSelf: 'center' }}>
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAdminProfilePhotoChange}
                    />
                  </label>
                  {editAdminPhoto && (
                    <button
                      type="button"
                      className="link-btn"
                      style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4, display: 'inline-flex', alignSelf: 'center' }}
                      onClick={() => setEditAdminPhoto(null)}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {editAdminProfileStatus && <div className="feedback-text">{editAdminProfileStatus}</div>}

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button type="submit" className="primary-btn" style={{ flex: 1, backgroundColor: 'var(--secondary)' }}>
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    style={{ flex: 1 }}
                    onClick={() => setIsEditingAdminProfile(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>

                {/* Offline sync diagnostic toolbar */}
                <div className="sync-card">
                  <div className="sync-row">
                    {isOnline ? <Wifi size={20} style={{ color: 'var(--text-secondary)' }} /> : <WifiOff size={20} style={{ color: 'var(--danger)' }} />}
                    <div className="sync-text-group">
                      <div className="sync-title">Active Sync Daemon</div>
                      <div className="sync-status-desc">
                        Cloud Synced: {records.length} records connected to MongoDB
                      </div>
                    </div>
                    <label className="switch-container">
                      <input
                        type="checkbox"
                        className="switch-input"
                        checked={isOnline}
                        onChange={handleOnlineToggle}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>

                  {syncState.type === 'Syncing' && (
                    <div className="syncing-notify">Transmitting data blocks to MongoDB Atlas...</div>
                  )}
                  {syncState.type === 'Success' && (
                    <div className="success-notify">Synchronized {syncState.count} entries successfully!</div>
                  )}
                </div>

                {/* Stats Dashboard Grid */}
                <div className="stats-grid">
                  <div className="stat-box stat-box-indigo">
                    <div className="stat-val">{students.length}</div>
                    <div className="stat-lbl">Students</div>
                  </div>
                  <div className="stat-box stat-box-green">
                    <div className="stat-val">{records.length}</div>
                    <div className="stat-lbl">Total Logs</div>
                  </div>
                  <div className="stat-box stat-box-orange">
                    <div className="stat-val">Online</div>
                    <div className="stat-lbl">MongoDB</div>
                  </div>
                </div>

                {/* Club management choosing */}
                <div style={{ marginBottom: 20 }}>
                  <label className="input-label" style={{ display: 'block', marginBottom: 8 }}>CLUB BEING MANAGED TODAY</label>
                  <div className="chips-scroll-row">
                    {['Samwaad', 'Chitran', 'Aarohan', 'Kadam'].map(c => (
                      <button
                        key={c}
                        className={`chip-btn ${activeClub === c ? 'active' : ''}`}
                        onClick={() => setActiveClub(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin sub-segmented Control */}
                <div className="segmented-control">
                  <button
                    className={`segment-btn ${adminTab === 'Scanner' ? 'active admin-active' : ''}`}
                    onClick={() => setAdminTab('Scanner')}
                  >
                    QR CAPTURE
                  </button>
                  <button
                    className={`segment-btn ${adminTab === 'Students' ? 'active admin-active' : ''}`}
                    onClick={() => setAdminTab('Students')}
                  >
                    STUDENT SHEET
                  </button>
                  <button
                    className={`segment-btn ${adminTab === 'Rosters' ? 'active admin-active' : ''}`}
                    onClick={() => setAdminTab('Rosters')}
                  >
                    ATTENDANCE & OFFICERS
                  </button>
                </div>

                {/* Console Subtab Content */}
                {adminTab === 'Scanner' ? (
                  <div style={{ animation: 'fadeIn 0.3s' }}>
                    <h4 className="records-section-title">HARDWARE SCAN CAMERA</h4>

                    {cameraScannerActive ? (
                      <div className="camera-box">
                        <div id="reader" className="scanner-viewport"></div>
                        <div className="camera-close-overlay">
                          <button className="secondary-btn" onClick={() => setCameraScannerActive(false)}>
                            Close Scan View
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="open-cam-placeholder" onClick={() => setCameraScannerActive(true)}>
                        <Camera size={32} />
                        <span>Open Live Scan Viewport</span>
                      </div>
                    )}

                    {/* Simulated Diagnostic Scan Deck for Emulators */}
                    <div className="sim-platform">
                      <div className="sim-title">DIAGNOSTIC SIMULATION PLATFORM</div>
                      <p className="sim-desc">
                        Since hardware access may occasionally be restricted in sandbox emulators, tap any student row below to immediately emulate an authentic MD5 QR payload scan:
                      </p>

                      <div className="sim-btn-row">
                        {students.length === 0 ? (
                          <p className="no-data-text">No students registered to simulate scan.</p>
                        ) : (
                          students.map((st, i) => (
                            <div
                              key={i}
                              className="sim-student-btn"
                              onClick={() => handleQrScan(db.generateSecureQrPayload(st.collegeId))}
                            >
                              <span className="sim-student-name">{st.name} <span className="sim-student-meta">({st.collegeId})</span></span>
                              <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 'bold' }}>Mark Present &rarr;</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Scan confirmation feedback alert */}
                    {scanResult && (
                      <div className="feedback-text" style={{ margin: '16px 0', fontSize: 13, border: '1px solid var(--border)', padding: 12, borderRadius: 8 }}>
                        {scanResult}
                      </div>
                    )}

                    {/* Daily scans list */}
                    <h4 className="records-section-title">MARK RECORD CHRONOLOGY TODAY</h4>
                    {records.filter(r => r.clubName === activeClub).length === 0 ? (
                      <p className="no-data-text">No attendees logged today.</p>
                    ) : (
                      records
                        .filter(r => r.clubName === activeClub)
                        .map((r, i) => {
                          const st = students.find(s => s.collegeId === r.studentId);
                          const name = r.studentName || st?.name || 'Unregistered';
                          const course = r.course || st?.course || '';
                          const branch = r.branch || st?.branch || '';
                          const section = r.section || st?.section || '';
                          return (
                            <div key={i} className="record-item">
                              <div>
                                <div className="record-title">{name}</div>
                                <div className="record-subtitle">ID: {r.studentId} {course && `| ${course}`} {branch && `(${branch})`} {section && `| Sec: ${section}`} | Scanned {r.time}</div>
                              </div>
                              <Check size={20} style={{ color: 'var(--secondary)' }} />
                            </div>
                          );
                        })
                    )}
                  </div>
                ) : adminTab === 'Students' ? (
                  <div className="sheet-wrapper" style={{ animation: 'fadeIn 0.3s' }}>
                    {/* Spreadsheet filter bar */}
                    <div className="sheet-filter-bar">
                      <div style={{ display: 'flex', flex: 2, gap: 8, minWidth: '220px' }}>
                        <Search size={18} style={{ alignSelf: 'center', color: 'var(--text-secondary)' }} />
                        <input
                          type="text"
                          className="styled-input"
                          placeholder="Search name, ID, email, phone..."
                          value={sheetSearch}
                          onChange={e => setSheetSearch(e.target.value)}
                        />
                      </div>

                      <select
                        className="styled-select"
                        value={sheetFilterCourse}
                        onChange={e => {
                          setSheetFilterCourse(e.target.value);
                          setSheetFilterBranch("All");
                        }}
                      >
                        <option value="All">All Courses</option>
                        {getCoursesForCampus(verifiedInstituteCode).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>

                      {getBranchesForCourse(sheetFilterCourse).length > 0 && (
                        <select
                          className="styled-select"
                          value={sheetFilterBranch}
                          onChange={e => setSheetFilterBranch(e.target.value)}
                        >
                          <option value="All">All Branches</option>
                          {getBranchesForCourse(sheetFilterCourse).map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      )}

                      <select
                        className="styled-select"
                        value={sheetFilterSection}
                        onChange={e => setSheetFilterSection(e.target.value)}
                      >
                        <option value="All">All Sections</option>
                        <option value="A">Sec A</option>
                        <option value="B">Sec B</option>
                        <option value="C">Sec C</option>
                      </select>

                      <select
                        className="styled-select"
                        value={sheetFilterYear}
                        onChange={e => setSheetFilterYear(e.target.value)}
                      >
                        <option value="All">All Years</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>

                      <select
                        className="styled-select"
                        value={sheetFilterClub}
                        onChange={e => setSheetFilterClub(e.target.value)}
                      >
                        <option value="All">All Clubs</option>
                        {['Samwaad', 'Chitran', 'Alaap', 'Social', 'Yoddha', 'Techno', 'Natraj', 'Aarohan', 'Kadam'].map(club => (
                          <option key={club} value={club}>{club}</option>
                        ))}
                      </select>

                      {(sheetSearch || sheetFilterCourse !== "All" || sheetFilterBranch !== "All" || sheetFilterSection !== "All" || sheetFilterYear !== "All" || sheetFilterClub !== "All") && (
                        <button
                          className="secondary-btn clear-filter-btn"
                          onClick={() => {
                            setSheetSearch("");
                            setSheetFilterCourse("All");
                            setSheetFilterBranch("All");
                            setSheetFilterSection("All");
                            setSheetFilterYear("All");
                            setSheetFilterClub("All");
                          }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>

                    {/* Spreadsheet header actions */}
                    <div className="sheet-header-actions">
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Showing {filteredStudents.length} of {students.length} students
                      </span>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          className="secondary-btn"
                          style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                          onClick={() => setShowAddForm(!showAddForm)}
                        >
                          <UserPlus size={16} />
                          <span>{showAddForm ? "Hide Add Form" : "Add Student"}</span>
                        </button>

                        <button
                          className="secondary-btn"
                          style={{ borderColor: 'var(--secondary)', color: 'var(--secondary)' }}
                          onClick={() => handleExportStudentSheetCsv(filteredStudents)}
                          disabled={filteredStudents.length === 0}
                        >
                          <Download size={16} />
                          <span>Export CSV Sheet</span>
                        </button>
                      </div>
                    </div>

                    {/* Form to add a student */}
                    {showAddForm && (
                      <form onSubmit={handleSheetAddStudent} className="sheet-add-form-container form-group">
                        <h4>REGISTER NEW STUDENT IN SHEET</h4>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                          <div className="input-wrapper">
                            <label className="input-label">FULL NAME</label>
                            <input
                              type="text"
                              className="styled-input"
                              placeholder="Enter Name"
                              value={sheetAddName}
                              onChange={e => setSheetAddName(e.target.value)}
                              required
                            />
                          </div>

                          <div className="input-wrapper">
                            <label className="input-label">COLLEGE ID</label>
                            <input
                              type="text"
                              className="styled-input"
                              placeholder="STKITV"
                              value={sheetAddCollegeId}
                              onChange={e => setSheetAddCollegeId(e.target.value.toUpperCase())}
                              required
                            />
                          </div>

                          <div className="input-wrapper">
                            <label className="input-label">EMAIL ADDRESS</label>
                            <input
                              type="email"
                              className="styled-input"
                              placeholder="example@gmail.com"
                              value={sheetAddEmail}
                              onChange={e => setSheetAddEmail(e.target.value)}
                              required
                            />
                          </div>

                          <div className="input-wrapper">
                            <label className="input-label">CONTACT NUMBER</label>
                            <input
                              type="tel"
                              className="styled-input"
                              placeholder="Enter phone number"
                              value={sheetAddPhone}
                              onChange={e => setSheetAddPhone(e.target.value)}
                              required
                            />
                          </div>

                          <div className="input-wrapper">
                            <label className="input-label">COURSE</label>
                            <select
                              className="styled-select"
                              value={sheetAddCourse}
                              onChange={e => setSheetAddCourse(e.target.value)}
                            >
                              {getCoursesForCampus(verifiedInstituteCode).map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          {getBranchesForCourse(sheetAddCourse).length > 0 && (
                            <div className="input-wrapper">
                              <label className="input-label">BRANCH</label>
                              <select
                                className="styled-select"
                                value={sheetAddBranch}
                                onChange={e => setSheetAddBranch(e.target.value)}
                              >
                                {getBranchesForCourse(sheetAddCourse).map(b => (
                                  <option key={b} value={b}>{b}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div className="input-wrapper">
                            <label className="input-label">SECTION</label>
                            <select
                              className="styled-select"
                              value={sheetAddSection}
                              onChange={e => setSheetAddSection(e.target.value)}
                            >
                              <option value="A">Sec A</option>
                              <option value="B">Sec B</option>
                              <option value="C">Sec C</option>
                            </select>
                          </div>

                          <div className="input-wrapper">
                            <label className="input-label">ACADEMIC YEAR</label>
                            <select
                              className="styled-select"
                              value={sheetAddYear}
                              onChange={e => setSheetAddYear(e.target.value)}
                            >
                              <option value="1st Year">1st Year</option>
                              <option value="2nd Year">2nd Year</option>
                              <option value="3rd Year">3rd Year</option>
                              <option value="4th Year">4th Year</option>
                            </select>
                          </div>

                          <div className="input-wrapper">
                            <label className="input-label">CLUB</label>
                            <select
                              className="styled-select"
                              value={sheetAddClub}
                              onChange={e => setSheetAddClub(e.target.value)}
                            >
                              {['Samwaad', 'Chitran', 'Alaap', 'Social', 'Yoddha', 'Techno', 'Natraj', 'Aarohan', 'Kadam'].map(club => (
                                <option key={club} value={club}>{club}</option>
                              ))}
                            </select>
                          </div>

                          <div className="input-wrapper">
                            <label className="input-label">SECURE ACCESS PASSWORD</label>
                            <input
                              type="password"
                              className="styled-input"
                              placeholder="Password"
                              value={sheetAddPassword}
                              onChange={e => setSheetAddPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {sheetAddStatus && <div className="feedback-text">{sheetAddStatus}</div>}

                        <button type="submit" className="primary-btn" style={{ padding: '10px 14px' }}>
                          Add Roster Student
                        </button>
                      </form>
                    )}

                    {/* Table Sheet View */}
                    <div className="sheet-table-container">
                      {filteredStudents.length === 0 ? (
                        <p className="no-data-text">No student records match active filters.</p>
                      ) : (
                        <table className="sheet-table">
                          <thead>
                            <tr>
                              <th className="sno-col">#</th>
                              <th onClick={() => handleSort('name')}>
                                Student Name
                                {sheetSortColumn === 'name' && (
                                  <span className="sort-indicator">{sheetSortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                                {!sheetSortColumn && <span className="sort-indicator">↕</span>}
                              </th>
                              <th onClick={() => handleSort('collegeId')}>
                                College ID
                                {sheetSortColumn === 'collegeId' && (
                                  <span className="sort-indicator">{sheetSortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                              </th>
                              <th>Email Address</th>
                              <th>Phone Number</th>
                              <th onClick={() => handleSort('course')}>Course</th>
                              <th>Branch</th>
                              <th>Sec</th>
                              <th>Year</th>
                              <th>Club</th>
                              <th className="actions-col">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStudents.map((st, i) => {
                              const isEditing = editingStudentId === st.collegeId;
                              return isEditing ? (
                                <tr key={st.collegeId} className="editing-row">
                                  <td className="sno-col">{i + 1}</td>
                                  <td>
                                    <input
                                      type="text"
                                      className="sheet-cell-input"
                                      value={editRowName}
                                      onChange={e => setEditRowName(e.target.value)}
                                      required
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      className="sheet-cell-input"
                                      value={editRowCollegeId}
                                      onChange={e => setEditRowCollegeId(e.target.value.toUpperCase())}
                                      required
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="email"
                                      className="sheet-cell-input"
                                      value={editRowEmail}
                                      onChange={e => setEditRowEmail(e.target.value)}
                                      required
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="tel"
                                      className="sheet-cell-input"
                                      value={editRowPhone}
                                      onChange={e => setEditRowPhone(e.target.value)}
                                      required
                                    />
                                  </td>
                                  <td>
                                    <select
                                      className="sheet-cell-select"
                                      value={editRowCourse}
                                      onChange={e => setEditRowCourse(e.target.value)}
                                    >
                                      {getCoursesForCampus(verifiedInstituteCode).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td>
                                    {getBranchesForCourse(editRowCourse).length > 0 ? (
                                      <select
                                        className="sheet-cell-select"
                                        value={editRowBranch}
                                        onChange={e => setEditRowBranch(e.target.value)}
                                      >
                                        {getBranchesForCourse(editRowCourse).map(b => (
                                          <option key={b} value={b}>{b}</option>
                                        ))}
                                      </select>
                                    ) : (
                                      <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>N/A</span>
                                    )}
                                  </td>
                                  <td>
                                    <select
                                      className="sheet-cell-select"
                                      value={editRowSection}
                                      onChange={e => setEditRowSection(e.target.value)}
                                    >
                                      <option value="A">A</option>
                                      <option value="B">B</option>
                                      <option value="C">C</option>
                                    </select>
                                  </td>
                                  <td>
                                    <select
                                      className="sheet-cell-select"
                                      value={editRowYear}
                                      onChange={e => setEditRowYear(e.target.value)}
                                    >
                                      <option value="1st Year">1st Year</option>
                                      <option value="2nd Year">2nd Year</option>
                                      <option value="3rd Year">3rd Year</option>
                                      <option value="4th Year">4th Year</option>
                                    </select>
                                  </td>
                                  <td>
                                    <select
                                      className="sheet-cell-select"
                                      value={editRowClub}
                                      onChange={e => setEditRowClub(e.target.value)}
                                    >
                                      {['Samwaad', 'Chitran', 'Alaap', 'Social', 'Yoddha', 'Techno', 'Natraj', 'Aarohan', 'Kadam'].map(club => (
                                        <option key={club} value={club}>{club}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="actions-col">
                                    <div className="sheet-actions-group">
                                      <button
                                        type="button"
                                        className="sheet-row-btn save-btn"
                                        onClick={e => handleSaveSheetEdit(e, st.collegeId)}
                                        title="Save Roster Cell"
                                      >
                                        <Save size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        className="sheet-row-btn cancel-btn"
                                        onClick={() => setEditingStudentId(null)}
                                        title="Cancel Edit"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ) : (
                                <tr key={st.collegeId}>
                                  <td className="sno-col">{i + 1}</td>
                                  <td style={{ fontWeight: 600 }}>{st.name}</td>
                                  <td>{st.collegeId}</td>
                                  <td>{st.email}</td>
                                  <td>{st.phoneNumber}</td>
                                  <td>{st.course}</td>
                                  <td>{st.branch || "N/A"}</td>
                                  <td>{st.section}</td>
                                  <td>{st.year}</td>
                                  <td>{st.clubName}</td>
                                  <td className="actions-col">
                                    <div className="sheet-actions-group">
                                      <button
                                        type="button"
                                        className="sheet-row-btn edit-btn"
                                        onClick={() => startEditingRow(st)}
                                        title="Edit Row"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        className="sheet-row-btn delete-btn"
                                        onClick={() => handleRemoveStudent(st.collegeId)}
                                        title="Delete Row"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {sheetEditStatus && <div className="feedback-text">{sheetEditStatus}</div>}
                  </div>
                ) : (
                  <div style={{ animation: 'fadeIn 0.3s' }}>
                    {/* Export spreadsheet reports panel */}
                    {currentAdmin?.isSeniorAdmin && (
                      <div className="export-panel">
                        <div className="export-title">EXPORT SPREADSHEETS</div>
                        <p className="export-desc">
                          Export a fully compiled CSV file grouped by class branches, incorporating offline synced registry IDs and timestamps.
                        </p>
                        <button className="primary-btn" style={{ backgroundColor: 'var(--secondary)' }} onClick={handleExportCsv}>
                          <FileText size={18} />
                          <span>Download CSV Spreadsheet</span>
                        </button>
                      </div>
                    )}

                    {/* Complete Roster lists with toggles and deletes */}
                    <h4 className="records-section-title">COMPREHENSIVE STUDENT REGISTER ({students.length})</h4>
                    {students.length === 0 ? (
                      <p className="no-data-text">No students registered on local state yet.</p>
                    ) : (
                      students.map((st, i) => {
                        const isPresentToday = records.some(r => r.studentId === st.collegeId && r.date === todayDate && r.status === 'Present');
                        return (
                          <div key={i} className="student-list-item">
                            <div className="student-list-details">
                              <div className="student-list-name">{st.name}</div>
                              <div className="student-list-meta">ID: {st.collegeId} | Sec: {st.section}</div>
                              <div className="student-list-meta">{st.course} - {st.branch} ({st.year})</div>
                            </div>

                            <div className="toggle-btn-group">
                              <button
                                className={`status-btn-toggle ${isPresentToday ? 'present-active' : ''}`}
                                onClick={() => handleManualAttendance(st.collegeId, todayDate, 'Present')}
                              >
                                PRESENT
                              </button>
                              <button
                                className={`status-btn-toggle ${!isPresentToday ? 'absent-active' : ''}`}
                                onClick={() => handleManualAttendance(st.collegeId, todayDate, 'Absent')}
                              >
                                ABSENT
                              </button>
                              <button className="trash-btn" onClick={() => handleRemoveStudent(st.collegeId)} title="Remove Student">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Senior Admin section */}
                    {currentAdmin?.isSeniorAdmin && (
                      <div className="senior-section-box">
                        <h4 className="records-section-title">SENIOR MANAGEMENT OPERATIONS</h4>

                        {/* regular admin provision registration */}
                        <form onSubmit={handleCreateRegularAdmin} className="form-group" style={{ border: '1px solid var(--border)', padding: 16, borderRadius: 12 }}>
                          <label className="input-label">REGISTER NEW REGULAR ADMINISTRATOR</label>
                          <input
                            type="email"
                            className="styled-input danger-focus"
                            placeholder="Enter Admin ID / Email"
                            value={adminRegisterId}
                            onChange={(e) => setAdminRegisterId(e.target.value)}
                            required
                          />
                          <input
                            type="password"
                            className="styled-input danger-focus"
                            placeholder="Access Token Password"
                            value={adminRegisterPassword}
                            onChange={(e) => setAdminRegisterPassword(e.target.value)}
                            required
                          />
                          <button type="submit" className="primary-btn" style={{ backgroundColor: 'var(--danger)' }}>
                            <Plus size={16} />
                            <span>Provision Regular Admin</span>
                          </button>
                        </form>

                        {/* Active officers list */}
                        <div style={{ marginTop: 12 }}>
                          <label className="input-label" style={{ display: 'block', marginBottom: 8 }}>ACTIVE OFFICERS LIST</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {admins.map((adm, index) => (
                              <div key={index} className="admin-member-item">
                                <div>
                                  <div className="admin-member-email">{adm.adminId}</div>
                                  <div className="admin-member-role">{adm.isSeniorAdmin ? 'Senior Admin' : 'Regular Admin'}</div>
                                </div>

                                <div className="admin-actions">
                                  {!adm.isSeniorAdmin && (
                                    <>
                                      <button type="button" className="mini-border-btn" onClick={() => handlePromoteAdmin(adm.adminId)}>
                                        PROMOTE
                                      </button>
                                      <button type="button" className="mini-border-btn revoke-btn" onClick={() => handleRemoveAdmin(adm.adminId)}>
                                        REVOKE
                                      </button>
                                    </>
                                  )}

                                  {adm.isSeniorAdmin && currentAdmin?.adminId.toLowerCase() === "kumarkartikeysahu@gmail.com" && adm.adminId.toLowerCase() !== "kumarkartikeysahu@gmail.com" && (
                                    <button type="button" className="mini-border-btn revoke-btn" onClick={() => handleRemoveAdmin(adm.adminId)}>
                                      REVOKE
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
