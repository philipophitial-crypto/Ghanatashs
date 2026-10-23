import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { SchoolCrest } from './SchoolCrest';
import { 
  Key, 
  Lock, 
  Unlock, 
  UserCheck, 
  Plus, 
  Save, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  GraduationCap, 
  FileSpreadsheet, 
  ExternalLink,
  LogOut,
  Printer,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  User,
  Upload,
  Sparkles
} from 'lucide-react';
import { StudentResult, SubjectScore, ProgramType, FormLevel, SemesterType, HouseType } from '../types';
import { calculateGrade, COURSE_CONFIGS, generateDefaultSubjectsForCourse, FOUR_CORE_SUBJECTS, HOUSES_DATA } from '../data/defaultData';
import { compressImage } from '../utils/imageCompressor';
import { 
  generateUniqueIndexNumber, 
  formatFullClass, 
  getClassesForCourse, 
  isIndexNumberUnique,
  calculateStudentPositionInClass,
  getYearCameToSchool 
} from '../utils/studentUtils';

export const COMMON_ELECTIVES_LIST = [
  // General Art
  'Literature in English', 'Economics', 'Geography', 'History', 'Government', 'Christian Religious Studies', 'Islamic Religious Studies', 'French', 'Music', 'General Knowledge in Art', 'Twi (Asante)', 'Fante', 'Ewe', 'Ga', 'Dagbani',
  // Science
  'Physics', 'Chemistry', 'Biology', 'Elective Mathematics', 'Information Technology',
  // Business
  'Financial Accounting', 'Cost Accounting', 'Business Management',
  // Home Economics
  'Food and Nutrition', 'Clothing and Textiles', 'Management in Living',
  // Visual Art
  'Graphic Design', 'Picture Making', 'Sculpture', 'Ceramics', 'Textiles', 'Leatherwork',
  // Agric
  'General Agriculture', 'Animal Husbandry', 'Crop Husbandry and Horticulture'
];

export const TeacherPortal: React.FC = () => {
  const { 
    students, 
    addStudentResult, 
    updateStudentResult, 
    deleteStudentResult, 
    teacherPassword, 
    isTeacherAuthenticated, 
    loginTeacher, 
    logoutTeacher,
    setActiveTab,
    setActiveResultStudentId,
    syncToFirebaseAccount,
    courseConfigs
  } = useSchool();

  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [formLevelFilter, setFormLevelFilter] = useState<string>('All');
  const [semesterFilter, setSemesterFilter] = useState<string>('All');
  const [courseFilter, setCourseFilter] = useState<string>('All');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state for student under edit/create
  const [editForm, setEditForm] = useState<StudentResult | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    const success = loginTeacher(passwordInput);
    if (success) {
      setPasswordInput('');
      showToast('Teacher mode authorized successfully.');
    } else {
      setPasswordError('Incorrect teacher password. Please try again or contact the administrator.');
    }
  };

  const startEditStudent = (st: StudentResult) => {
    setIsCreatingNew(false);
    setSelectedStudent(st);
    setEditForm(JSON.parse(JSON.stringify(st))); // Deep clone for safe editing
  };

  const startNewStudent = () => {
    const defaultCourse: ProgramType = 'General Art';
    const initialSubjects = generateDefaultSubjectsForCourse(defaultCourse);
    const defaultAdmissionYear = getYearCameToSchool('Form 1', '2024/2025');
    const uniqueIndex = generateUniqueIndexNumber(students, defaultAdmissionYear);
    const availableClasses = getClassesForCourse(defaultCourse, courseConfigs);
    const defaultArm = availableClasses[0] || 'GArt 1';
    const designatedFullClass = formatFullClass('Form 1', defaultArm);

    const newObj: StudentResult = {
      id: `ghs-${Date.now()}`,
      indexNumber: uniqueIndex,
      admissionYear: defaultAdmissionYear,
      studentName: '',
      gender: 'Male',
      program: defaultCourse,
      formLevel: 'Form 1',
      semester: 'Semester 1',
      classArm: defaultArm,
      classForm: designatedFullClass,
      academicYear: '2024/2025',
      term: 'Semester 1',
      house: 'Modesty House',
      dateOfBirth: '2007-05-10',
      photoUrl: '', // Blank by default, no generated picture
            positionInClass: '1st',
      totalStudentsInClass: 45,
      conductRemarks: 'Polite, attentive, and respectful.',
      headTeacherRemarks: 'Commendable diligence. Continue upholding Carpe Diem.',
      promotedToNextClass: true,
      publishedDate: new Date().toISOString().split('T')[0],
      aggregate: 7,
      gpa: 3.9,
      subjects: initialSubjects
    };

    setIsCreatingNew(true);
    setSelectedStudent(null);
    setEditForm(newObj);
  };

  // Change student's Course and synchronize Class Arm and Full Class Designation
  const handleCourseChange = (newCourse: ProgramType) => {
    if (!editForm) return;
    const availableClasses = getClassesForCourse(newCourse, courseConfigs);
    const newClassArm = availableClasses[0] || '1';
    const newClassForm = formatFullClass(editForm.formLevel || 'Form 1', newClassArm);

    // Preserve existing elective scores where possible, but regenerate constant cores according to course rules
    const newSubjects = generateDefaultSubjectsForCourse(newCourse);

    setEditForm({
      ...editForm,
      program: newCourse,
      classArm: newClassArm,
      classForm: newClassForm,
      subjects: newSubjects
    });
  };

  // Synchronize Form Level with Full Class Designation and suggested Admission Year
  const handleFormLevelChange = (lvl: FormLevel) => {
    if (!editForm) return;
    const designated = formatFullClass(lvl, editForm.classArm);
    const suggestedYear = isCreatingNew 
      ? getYearCameToSchool(lvl, editForm.academicYear) 
      : (editForm.admissionYear || getYearCameToSchool(lvl, editForm.academicYear));
    const newIdx = isCreatingNew 
      ? generateUniqueIndexNumber(students, suggestedYear)
      : editForm.indexNumber;

    setEditForm({
      ...editForm,
      formLevel: lvl,
      classForm: designated,
      admissionYear: suggestedYear,
      indexNumber: newIdx
    });
  };

  // Synchronize Class Arm with Full Class Designation
  const handleClassArmChange = (arm: string) => {
    if (!editForm) return;
    const designated = formatFullClass(editForm.formLevel || 'Form 1', arm);
    setEditForm({
      ...editForm,
      classArm: arm,
      classForm: designated
    });
  };

  // Live recalculate subject assessment components, total score, grade and remarks
  const handleScoreChange = (
    index: number, 
    field: 'midsemScore' | 'portfolioScore' | 'individualProjectScore' | 'groupProjectScore' | 'examScore' | 'name', 
    val: any
  ) => {
    if (!editForm) return;
    const newSubjects = [...editForm.subjects];
    const subj = { ...newSubjects[index] };

    if (field === 'midsemScore') {
      subj.midsemScore = Math.min(20, Math.max(0, Number(val) || 0));
    } else if (field === 'portfolioScore') {
      subj.portfolioScore = Math.min(10, Math.max(0, Number(val) || 0));
    } else if (field === 'individualProjectScore') {
      subj.individualProjectScore = Math.min(10, Math.max(0, Number(val) || 0));
    } else if (field === 'groupProjectScore') {
      subj.groupProjectScore = Math.min(10, Math.max(0, Number(val) || 0));
    } else if (field === 'examScore') {
      subj.examScore = Math.min(50, Math.max(0, Number(val) || 0));
    } else if (field === 'name') {
      subj.name = val;
    }

    // Total Continuous Assessment (Midsem + Portfolio + Individual Project + Group Project = 50)
    subj.classScore = (subj.midsemScore || 0) + (subj.portfolioScore || 0) + (subj.individualProjectScore || 0) + (subj.groupProjectScore || 0);
    // Overall Total (Continuous Assessment 50 + Exams 50 = 100)
    subj.totalScore = subj.classScore + (subj.examScore || 0);
    const res = calculateGrade(subj.totalScore);
    subj.grade = res.grade;
    subj.interpretation = res.interpretation;

    newSubjects[index] = subj;

    // Calculate Best 6 aggregate (Grade 1=1 pt, Grade 2=2 pt... Grade 9=9 pt)
    const pointsList = newSubjects.map(s => {
      return calculateGrade(s.totalScore).points;
    }).sort((a, b) => a - b);
    const best6Sum = pointsList.slice(0, 6).reduce((a, b) => a + b, 0);

    const totalScoreSum = newSubjects.reduce((acc, curr) => acc + curr.totalScore, 0);
    const avg = totalScoreSum / (newSubjects.length || 1);
    const gpaVal = Number((avg / 25).toFixed(2));

    setEditForm({
      ...editForm,
      subjects: newSubjects,
      aggregate: best6Sum,
      gpa: Math.min(4.0, gpaVal)
    });
  };

  const handleStudentPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editForm) return;

    try {
      showToast('Optimizing student photo...');
      const compressed = await compressImage(file, 280, 0.85);
      setEditForm(prev => prev ? ({ ...prev, photoUrl: compressed }) : null);
      showToast('Student photo attached! Click Save Marks & Name to broadcast.');
    } catch (err) {
      console.error('Failed to compress student photo:', err);
      showToast('Error attaching photo. Please try a different image.');
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    if (!editForm.studentName.trim()) {
      alert('Please provide student name.');
      return;
    }

    // Automatically ensure index number is unique
    let finalIndex = editForm.indexNumber?.trim();
    if (!finalIndex) {
      finalIndex = generateUniqueIndexNumber(students, editForm.academicYear);
    } else if (!isIndexNumberUnique(finalIndex, isCreatingNew ? null : editForm.id, students)) {
      const autoUnique = generateUniqueIndexNumber(students, editForm.academicYear);
      alert(`Index number "${finalIndex}" was already taken by another student. Automatically generated next unique index: ${autoUnique}`);
      finalIndex = autoUnique;
    }

    // Automatically calculate class position based on peer scores in this particular class
    const posInfo = calculateStudentPositionInClass(editForm, students);

    // Ensure full class designation corresponds well with course and class arm
    const validFullClass = formatFullClass(editForm.formLevel, editForm.classArm);
    const studentToSave: StudentResult = {
      ...editForm,
      indexNumber: finalIndex,
      classForm: validFullClass,
      positionInClass: posInfo.position,
      totalStudentsInClass: posInfo.totalInClass
    };

    if (isCreatingNew) {
      addStudentResult(studentToSave);
      showToast(`Student result successfully created for "${studentToSave.studentName}" (Index: ${studentToSave.indexNumber})!`);
    } else {
      updateStudentResult(studentToSave.id, studentToSave);
      showToast(`Student marks and details updated for "${studentToSave.studentName}"!`);
    }

    setSelectedStudent(studentToSave);
    setIsCreatingNew(false);
    await syncToFirebaseAccount();
  };

  const downloadRosterCsv = () => {
    if (filteredRoster.length === 0) {
      alert('No student records available in current roster filter to download.');
      return;
    }

    const lines = [
      `GHANATA SENIOR HIGH SCHOOL - ACADEMIC RESULTS ROSTER EXPORT`,
      `Form Level Filter,${formLevelFilter}`,
      `Semester Filter,${semesterFilter}`,
      `Course Filter,${courseFilter}`,
      `Class Filter,${classFilter}`,
      `Total Records,${filteredRoster.length}`,
      ``,
      `Index Number,Student Full Name,Course / Program,Form Level,Class,House,Best 6 Aggregate,GPA,Position in Class`
    ];

    filteredRoster.forEach(st => {
      lines.push(
        `"${st.indexNumber}","${st.studentName}","${st.program}","${st.formLevel}","${st.classForm}","${st.house}",${st.aggregate},${st.gpa.toFixed(2)},"${st.positionInClass}"`
      );
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `Ghanata_SHS_Results_Roster_${classFilter === 'All' ? courseFilter : classFilter}.csv`;
    link.click();
    showToast(`Downloaded CSV spreadsheet for ${filteredRoster.length} student records!`);
  };

  // Filter students roster
  const filteredRoster = students.filter(s => {
    if (formLevelFilter !== 'All' && s.formLevel !== formLevelFilter) return false;
    if (semesterFilter !== 'All' && s.semester !== semesterFilter) return false;
    if (courseFilter !== 'All' && s.program !== courseFilter) return false;
    if (classFilter !== 'All' && s.classArm !== classFilter && s.classForm !== classFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        s.studentName.toLowerCase().includes(q) ||
        s.indexNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Current course available classes corresponding directly to selected course
  const currentCourseClasses = editForm ? getClassesForCourse(editForm.program, courseConfigs) : [];
  const currentCourseElectiveSuggestions = editForm ? COURSE_CONFIGS[editForm.program]?.defaultElectives || [] : [];
  
  // Real-time automatic position calculation based on peer scores in this particular class
  const liveClassPositionInfo = editForm ? calculateStudentPositionInClass(editForm, students) : null;

  // PASSWORD GATE IF NOT AUTHENTICATED
  if (!isTeacherAuthenticated) {
    return (
      <div className="py-20 bg-stone-100 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-xl border border-stone-200 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-yellow-50 border-2 border-yellow-300 text-yellow-800 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-block text-[11px] font-bold text-yellow-900 uppercase tracking-wider bg-yellow-100 px-3 py-1 rounded-full mb-2">
              Staff Examination Desk
            </div>
            <h1 className="font-heading text-2xl font-extrabold text-stone-900">
              Teacher Mode Login
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Authorized access for Ghanata SHS subject tutors & form masters to input and edit student marks across all courses and classes.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Enter Teacher Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter staff password..."
                  className="w-full px-4 py-3 pl-10 text-sm border-2 border-stone-300 rounded-xl focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d] bg-stone-50"
                />
                <Key className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {passwordError && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#14532d] hover:bg-[#0b331c] text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Teacher Mode</span>
            </button>
          </form>

          {/* Secure Restricted Access Notice */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-500">
            <div className="flex items-center justify-center gap-1.5 font-semibold text-stone-700">
              <ShieldCheck className="w-4 h-4 text-yellow-700" />
              <span>Restricted Staff Portal</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Access is reserved exclusively for accredited Ghanata SHS teaching staff and form masters. Please provide your confidential credentials to proceed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED TEACHER PORTAL INTERFACE
  return (
    <div className="py-10 bg-stone-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Bar */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-yellow-900 uppercase tracking-widest bg-yellow-100 px-3 py-1 rounded-full">
              <UserCheck className="w-3.5 h-3.5 text-yellow-700" />
              <span>Tutor Examination Desk</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#14532d]">
              Teacher Mode: Input Marks & Student Names
            </h1>
            <p className="text-xs text-stone-600">
              Four Core Subjects (Social Studies, General Science, General Mathematics, English Language) are constant, with 6 elective slots for teachers to input other subjects across all 39 classes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={startNewStudent}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#14532d] hover:bg-[#0b331c] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Student</span>
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-950 border border-yellow-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <span>View Results Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={logoutTeacher}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs font-medium rounded-lg border border-stone-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Course & Class Reference Strip */}
        <div className="bg-[#0b331c] text-yellow-100 rounded-xl p-4 text-xs flex flex-wrap items-center justify-between gap-4 border border-yellow-500/30">
          <div className="font-semibold text-yellow-300">
            Official Course Class Distribution:
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="bg-black/30 px-2.5 py-1 rounded border border-yellow-400/20 font-mono">
              <strong>General Art:</strong> GArt 1 – GArt 15 (15 classes)
            </span>
            <span className="bg-black/30 px-2.5 py-1 rounded border border-yellow-400/20 font-mono">
              <strong>Visual Art:</strong> V Art 1 – V Art 5 (5 classes)
            </span>
            <span className="bg-black/30 px-2.5 py-1 rounded border border-yellow-400/20 font-mono">
              <strong>Business:</strong> B1 – B5 (5 classes)
            </span>
            <span className="bg-black/30 px-2.5 py-1 rounded border border-yellow-400/20 font-mono">
              <strong>Home Economics:</strong> H1 – H5 (5 classes)
            </span>
            <span className="bg-black/30 px-2.5 py-1 rounded border border-yellow-400/20 font-mono">
              <strong>Agric:</strong> Agric 1 – Agric 3 (3 classes)
            </span>
            <span className="bg-black/30 px-2.5 py-1 rounded border border-yellow-400/20 font-mono">
              <strong>Science:</strong> Science 1 – Science 6 (6 classes)
            </span>
          </div>
        </div>

        {/* Toast feedback */}
        {toastMessage && (
          <div className="bg-emerald-900 text-emerald-100 border border-emerald-600 p-4 rounded-xl shadow-md flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* System Guide & Index Number Information Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-950 space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
            <BookOpen className="w-4 h-4 text-amber-800" />
            <span>Official Ghanata SHS System Guide: Index Numbers, Pictures & Marks Input</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] leading-relaxed text-amber-900">
            <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
              <strong className="block text-amber-950 font-bold mb-1">1. Index Number System</strong>
              Structured as <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-900">GHS/YYYY/XXX</code>. <br/>
              • <strong>GHS</strong>: Ghanata Senior High School.<br/>
              • <strong>YYYY</strong>: Admission / Enrollment Year (e.g., 2025).<br/>
              • <strong>XXX</strong>: Unique 3-digit serial number (e.g., 001).
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
              <strong className="block text-amber-950 font-bold mb-1">2. Student Pictures Policy</strong>
              Pictures are optional. If a student does not have an uploaded picture, the system <strong>leaves the picture area blank</strong> with a clean "No Photo" indicator. No fake or Unsplash stock avatars are auto-generated.
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
              <strong className="block text-amber-950 font-bold mb-1">3. Mark Input System</strong>
              Fully verified real-time calculation. Class Score (Mid-sem max 20 + Portfolio max 10 + Indiv. Project max 10 + Group Project max 10 = 50) + Exam (max 50) = Total (100). Aggregates (Best 6) and GPA auto-update instantly.
            </div>
          </div>
        </div>

        {/* Main Work Area: Roster on Left, Marks Editor on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Student Class Roster */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="font-heading text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#14532d]" />
                <span>Student Roster ({filteredRoster.length})</span>
              </h2>
              <button
                onClick={downloadRosterCsv}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-950 font-bold text-[11px] rounded border border-yellow-300 cursor-pointer transition-colors"
                title="Download filtered class results roster as CSV"
              >
                <span>Export CSV</span>
              </button>
            </div>

            {/* Filter by Form Level */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-stone-600 uppercase">
                  Form:
                </label>
                <select
                  value={formLevelFilter}
                  onChange={(e) => setFormLevelFilter(e.target.value)}
                  className="w-full p-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:border-[#14532d] font-medium"
                >
                  <option value="All">All Forms</option>
                  <option value="Form 1">Form 1</option>
                  <option value="Form 2">Form 2</option>
                  <option value="Form 3">Form 3</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-stone-600 uppercase">
                  Semester:
                </label>
                <select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="w-full p-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:border-[#14532d] font-medium"
                >
                  <option value="All">All Semesters</option>
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                </select>
              </div>
            </div>

            {/* Filter by Course */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-600 uppercase">
                Filter by Course:
              </label>
              <select
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value);
                  setClassFilter('All');
                }}
                className="w-full p-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:border-[#14532d]"
              >
                <option value="All">All Courses</option>
                <option value="General Art">General Art (GArt 1 - 15)</option>
                <option value="Visual Art">Visual Art (V Art 1 - 5)</option>
                <option value="Business">Business (B1 - B5)</option>
                <option value="Home Economics">Home Economics (H1 - H5)</option>
                <option value="Agric">Agric (Agric 1 - 3)</option>
                <option value="Science">Science (Science 1 - 6)</option>
              </select>
            </div>

            {/* Filter by Class */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-600 uppercase">
                Filter by Specific Class:
              </label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full p-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:border-[#14532d]"
              >
                <option value="All">All Classes in Roster</option>
                {courseFilter !== 'All' ? (
                  COURSE_CONFIGS[courseFilter as ProgramType]?.classes.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))
                ) : (
                  Object.values(COURSE_CONFIGS).flatMap(cfg => cfg.classes).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))
                )}
              </select>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search student by name or index..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* List of students */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredRoster.map(st => {
                const isSelected = editForm?.id === st.id && !isCreatingNew;
                return (
                  <div
                    key={st.id}
                    onClick={() => startEditStudent(st)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#14532d] text-white border-[#14532d] shadow-xs'
                        : 'bg-stone-50 hover:bg-yellow-50/70 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{st.studentName}</div>
                      <div className={`font-mono text-[11px] ${isSelected ? 'text-yellow-200' : 'text-stone-500'}`}>
                        {st.indexNumber} · {st.classForm}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isSelected ? 'bg-yellow-400 text-stone-900' : 'bg-stone-200 text-stone-700'
                      }`}>
                        Agg: {st.aggregate}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredRoster.length === 0 && (
                <div className="text-center py-8 text-xs text-stone-400">
                  No students found matching current filters.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100">
              <button
                onClick={startNewStudent}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-dashed border-stone-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Student Profile</span>
              </button>
            </div>
          </div>

          {/* Right Column: Active Student Editor Form */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            {editForm ? (
              <form onSubmit={handleSaveStudent} className="space-y-6">
                
                {/* Header of Form */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                  <div>
                    <span className="text-[11px] font-bold text-yellow-900 uppercase tracking-wider">
                      {isCreatingNew ? 'Registering New Student' : 'Editing Student Scores & Name'}
                    </span>
                    <h2 className="font-heading text-xl font-bold text-stone-900">
                      {editForm.studentName || 'Unnamed Student'}
                    </h2>
                    <p className="text-xs text-stone-500">
                      Class: <strong className="text-[#14532d]">{editForm.classForm}</strong> · Course: <strong>{editForm.program}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#14532d] hover:bg-[#0b331c] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Marks & Name</span>
                    </button>
                  </div>
                </div>

                {/* Section 1: Student Information */}
                <div>
                  <h3 className="font-heading text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
                    Student Information, Form, Semester & House Assignment
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.studentName}
                        onChange={(e) => setEditForm({ ...editForm, studentName: e.target.value })}
                        placeholder="e.g. Kofi Mensah Boateng"
                        className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-stone-50 font-medium"
                      />
                    </div>

                    {/* Year Student Came to School (Admission Year) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-semibold text-stone-700">
                          Year Came to School *
                        </label>
                        <span className="text-[10px] text-yellow-900 bg-yellow-100 font-bold px-1.5 py-0.2 rounded">
                          Index Prefix Year
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={editForm.admissionYear || getYearCameToSchool(editForm.formLevel, editForm.academicYear)}
                        onChange={(e) => {
                          const newYear = e.target.value.trim();
                          const nextIdx = generateUniqueIndexNumber(students, newYear || '2025');
                          setEditForm({
                            ...editForm,
                            admissionYear: newYear,
                            indexNumber: nextIdx
                          });
                          showToast(`Index number year updated to ${newYear}: ${nextIdx}`);
                        }}
                        placeholder="e.g. 2027, 2028, 2030..."
                        className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-yellow-50/50 font-bold text-stone-900 text-xs"
                      />
                      <p className="text-[10px] text-stone-500 mt-1">
                        Enter any year student came to school. Attached to index (GHS/<strong>{editForm.admissionYear || '2025'}</strong>/...).
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-semibold text-stone-700">
                          Index Number *
                        </label>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Auto-Generated & Unique
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={editForm.indexNumber}
                          onChange={(e) => setEditForm({ ...editForm, indexNumber: e.target.value })}
                          placeholder="e.g. GHS/2024/001"
                          className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-emerald-50/30 font-mono font-bold text-[#14532d]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const targetYear = editForm.admissionYear || getYearCameToSchool(editForm.formLevel, editForm.academicYear);
                            const newIdx = generateUniqueIndexNumber(students, targetYear);
                            setEditForm({ ...editForm, indexNumber: newIdx });
                            showToast(`Generated next unique index for ${targetYear}: ${newIdx}`);
                          }}
                          className="px-3 py-2 bg-stone-100 hover:bg-yellow-100 text-stone-800 hover:text-yellow-900 border border-stone-300 rounded-lg text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-1"
                          title="Generate next available unique index number"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Generate</span>
                        </button>
                      </div>
                      {!isIndexNumberUnique(editForm.indexNumber, isCreatingNew ? null : editForm.id, students) ? (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>Warning: Index is already in use! Click Generate to auto-resolve.</span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-stone-500 mt-1">
                          Attached to year student came to school: <strong className="font-mono">{editForm.admissionYear || getYearCameToSchool(editForm.formLevel, editForm.academicYear)}</strong>.
                        </p>
                      )}
                    </div>

                    {/* Student Photo Upload */}
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Student Photo (Optional)
                      </label>
                      <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-lg border border-stone-300">
                        <div className="w-10 h-10 rounded-md bg-stone-200 border border-stone-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {editForm.photoUrl && editForm.photoUrl.trim() !== '' ? (
                            <img src={editForm.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-stone-400" />
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#14532d] hover:bg-[#0b331c] text-white text-[11px] font-bold rounded cursor-pointer shadow-xs transition-colors">
                            <Upload className="w-3 h-3" />
                            <span>{editForm.photoUrl ? 'Replace Photo' : 'Upload Photo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleStudentPhotoUpload}
                              className="hidden"
                            />
                          </label>
                          {editForm.photoUrl && editForm.photoUrl.trim() !== '' ? (
                            <button
                              type="button"
                              onClick={() => setEditForm(prev => prev ? ({ ...prev, photoUrl: '' }) : null)}
                              className="text-[10px] text-red-600 hover:underline text-left cursor-pointer"
                            >
                              Remove (Blank)
                            </button>
                          ) : (
                            <span className="text-[10px] text-stone-400">Blank if omitted</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Form Level (Form 1, 2, 3) */}
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        School Form Level *
                      </label>
                      <select
                        value={editForm.formLevel || 'Form 1'}
                        onChange={(e) => handleFormLevelChange(e.target.value as FormLevel)}
                        className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-yellow-50/50 font-bold text-stone-900"
                      >
                        <option value="Form 1">Form 1</option>
                        <option value="Form 2">Form 2</option>
                        <option value="Form 3">Form 3</option>
                      </select>
                    </div>

                    {/* Semester (2 Semesters in a form) */}
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Semester *
                      </label>
                      <select
                        value={editForm.semester || 'Semester 1'}
                        onChange={(e) => {
                          const sem = e.target.value as SemesterType;
                          setEditForm({
                            ...editForm,
                            semester: sem,
                            term: sem
                          });
                        }}
                        className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-yellow-50/50 font-bold text-stone-900"
                      >
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                      </select>
                    </div>

                    {/* School Houses (5 Official Houses) */}
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        School House *
                      </label>
                      <select
                        value={editForm.house || 'Modesty House'}
                        onChange={(e) => setEditForm({ ...editForm, house: e.target.value as HouseType })}
                        className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-stone-50 font-medium"
                      >
                        <option value="Modesty House">1. Modesty House (Red)</option>
                        <option value="Unity House">2. Unity House (Blue)</option>
                        <option value="Fraternity House">3. Fraternity House (Yellow)</option>
                        <option value="Royal House">4. Royal House (Green)</option>
                        <option value="Integrity House">5. Integrity House (Purple)</option>
                      </select>
                    </div>

                    {/* Course Selection */}
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Course *
                      </label>
                      <select
                        value={editForm.program}
                        onChange={(e) => handleCourseChange(e.target.value as ProgramType)}
                        className="w-full p-2 border-2 border-yellow-400/80 rounded-lg focus:outline-none focus:border-[#14532d] bg-yellow-50/50 font-bold text-stone-900"
                      >
                        <option value="General Art">General Art (GArt 1 - 15)</option>
                        <option value="Visual Art">Visual Art (V Art 1 - 5)</option>
                        <option value="Business">Business (B1 - B5)</option>
                        <option value="Home Economics">Home Economics (H1 - H5)</option>
                        <option value="Agric">Agric (Agric 1 - 3)</option>
                        <option value="Science">Science (Science 1 - 6)</option>
                      </select>
                    </div>

                    {/* Class Arm Selection based on Course */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-semibold text-stone-700">
                          Class Arm ({editForm.program}) *
                        </label>
                        <span className="text-[10px] bg-stone-200 text-stone-700 font-bold px-1.5 py-0.2 rounded">
                          {currentCourseClasses.length} Arms Available
                        </span>
                      </div>
                      <select
                        value={editForm.classArm || currentCourseClasses[0] || '1'}
                        onChange={(e) => handleClassArmChange(e.target.value)}
                        className="w-full p-2 border-2 border-[#14532d]/40 rounded-lg focus:outline-none focus:border-[#14532d] bg-stone-50 font-mono font-bold text-[#14532d]"
                      >
                        {currentCourseClasses.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1 flex items-center justify-between">
                        <span>Full Class Designation</span>
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                          Course & Form Synchronized
                        </span>
                      </label>
                      <div className="w-full p-2.5 border-2 border-[#14532d] rounded-lg bg-emerald-50/60 font-mono font-extrabold text-[#14532d] flex items-center justify-between">
                        <span>{editForm.classForm}</span>
                        <span className="text-[11px] font-sans font-normal text-stone-500">
                          ({editForm.program})
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-semibold text-stone-700">
                          Class Position & Rank
                        </label>
                        <span className="text-[10px] bg-yellow-100 text-yellow-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-yellow-700" />
                          Auto-Calculated in Real-Time
                        </span>
                      </div>
                      <div className="w-full p-2.5 border-2 border-yellow-500/80 rounded-lg bg-yellow-50/70 font-mono flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-[#14532d]">
                            {liveClassPositionInfo?.position || editForm.positionInClass || '1st'}
                          </span>
                          <span className="text-xs text-stone-600 font-medium">
                            out of {liveClassPositionInfo?.totalInClass || editForm.totalStudentsInClass || 1} in {editForm.classForm}
                          </span>
                        </div>
                        <span className="text-[11px] font-sans font-semibold text-stone-600 bg-white px-2 py-0.5 rounded border border-yellow-300">
                          Class Avg: {liveClassPositionInfo?.averageScore || 0}%
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1">
                        Automatically calculated by ranking overall percentage score against all students in {editForm.classForm}.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Input Marks & Scores Table (5 Official Assessment Types) */}
                <div className="space-y-4 pt-4 border-t border-stone-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-heading text-xs font-bold text-stone-900 uppercase tracking-wider">
                        Assessment Input Form: 5 Official Components
                      </h3>
                      <p className="text-[11px] text-stone-600">
                        Input: <strong>Midsem Exam (/20)</strong> · <strong>Portfolio (/10)</strong> · <strong>Individual Project (/10)</strong> · <strong>Group Project (/10)</strong> · <strong>Exams Score (/50)</strong> = <strong>Total Score (/100)</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const fresh = generateDefaultSubjectsForCourse(editForm.program);
                          setEditForm({ ...editForm, subjects: fresh });
                          showToast(`Reset to default 6 elective slots for ${editForm.program}`);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg border border-stone-300 cursor-pointer"
                        title="Reset 6 elective slot names to standard course suggestions"
                      >
                        <RotateCcw className="w-3 h-3 text-stone-500" />
                        <span>Reset 6 Electives</span>
                      </button>
                    </div>
                  </div>

                  {/* Datalist for Suggested Course Electives */}
                  <datalist id="course-electives-list">
                    {currentCourseElectiveSuggestions.map((el, i) => (
                      <option key={i} value={el} />
                    ))}
                  </datalist>

                  <div className="overflow-x-auto border border-stone-300 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                          <th className="py-2.5 px-3 min-w-[170px]">Subject Name</th>
                          <th className="py-2.5 px-2 text-center w-16">Type</th>
                          <th className="py-2.5 px-1.5 text-center w-20" title="Midsem Exam (Max 20)">
                            Midsem<br/><span className="text-[10px] text-stone-400 font-normal">Max 20</span>
                          </th>
                          <th className="py-2.5 px-1.5 text-center w-20" title="Portfolio (Max 10)">
                            Portfolio<br/><span className="text-[10px] text-stone-400 font-normal">Max 10</span>
                          </th>
                          <th className="py-2.5 px-1.5 text-center w-20" title="Individual Project (Max 10)">
                            Indiv. Proj<br/><span className="text-[10px] text-stone-400 font-normal">Max 10</span>
                          </th>
                          <th className="py-2.5 px-1.5 text-center w-20" title="Group Project (Max 10)">
                            Group Proj<br/><span className="text-[10px] text-stone-400 font-normal">Max 10</span>
                          </th>
                          <th className="py-2.5 px-1.5 text-center w-20" title="Exams Score (Max 50)">
                            Exams<br/><span className="text-[10px] text-stone-400 font-normal">Max 50</span>
                          </th>
                          <th className="py-2.5 px-2 text-center w-16 bg-yellow-50">
                            Total<br/><span className="text-[10px] text-stone-400 font-normal">/ 100</span>
                          </th>
                          <th className="py-2.5 px-2 text-center w-16">Grade</th>
                          <th className="py-2.5 px-2 text-center w-24">Remark</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {editForm.subjects.map((subj, idx) => {
                          const isConstantCore = subj.isCore;
                          return (
                            <tr 
                              key={subj.id || idx} 
                              className={isConstantCore ? 'bg-yellow-50/40' : 'hover:bg-stone-50/60'}
                            >
                              {/* Subject Name Input */}
                              <td className="py-2 px-3">
                                {isConstantCore ? (
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-stone-900">{subj.name}</span>
                                    <span className="text-[10px] text-yellow-900 bg-yellow-100 px-1.5 py-0.2 rounded font-semibold">
                                      CONSTANT
                                    </span>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    {/* Elective Dropdown Select */}
                                    <select
                                      value={COMMON_ELECTIVES_LIST.includes(subj.name) ? subj.name : '__custom__'}
                                      onChange={(e) => {
                                        const selectedVal = e.target.value;
                                        if (selectedVal === '__custom__') {
                                          if (COMMON_ELECTIVES_LIST.includes(subj.name)) {
                                            handleScoreChange(idx, 'name', '');
                                          }
                                        } else {
                                          handleScoreChange(idx, 'name', selectedVal);
                                        }
                                      }}
                                      className="w-full p-1.5 border border-stone-300 rounded font-semibold text-stone-900 bg-white focus:outline-none focus:border-[#14532d] text-xs"
                                    >
                                      <option value="">-- Select Elective Subject --</option>
                                      <optgroup label={`Course Electives (${editForm.program})`}>
                                        {(COURSE_CONFIGS[editForm.program]?.defaultElectives || []).map((elName) => (
                                          <option key={elName} value={elName}>
                                            {elName}
                                          </option>
                                        ))}
                                      </optgroup>
                                      <optgroup label="Other Standard Electives">
                                        {COMMON_ELECTIVES_LIST.filter(
                                          el => !(COURSE_CONFIGS[editForm.program]?.defaultElectives || []).includes(el)
                                        ).map((elName) => (
                                          <option key={elName} value={elName}>
                                            {elName}
                                          </option>
                                        ))}
                                      </optgroup>
                                      <option value="__custom__">✏️ Custom / Type Other Subject...</option>
                                    </select>

                                    {/* Custom Input Box if user selected custom or typed a custom subject */}
                                    {(!COMMON_ELECTIVES_LIST.includes(subj.name) || subj.name === '') && (
                                      <input
                                        type="text"
                                        value={subj.name}
                                        onChange={(e) => handleScoreChange(idx, 'name', e.target.value)}
                                        placeholder="Type custom elective subject name..."
                                        className="w-full p-1.5 border border-amber-400 bg-amber-50/50 rounded font-semibold text-stone-900 focus:outline-none focus:border-[#14532d] text-xs mt-1"
                                      />
                                    )}
                                    <span className="text-[10px] text-stone-400 block">
                                      Elective Slot #{idx - editForm.subjects.filter(s => s.isCore).length + 1}
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* Core vs Elective Type */}
                              <td className="py-2 px-2 text-center font-mono text-[11px]">
                                {isConstantCore ? (
                                  <span className="text-[#14532d] font-bold">CORE</span>
                                ) : (
                                  <span className="text-stone-600 font-semibold">ELECTIVE</span>
                                )}
                              </td>

                              {/* 1. Midsem Exam (/20) */}
                              <td className="py-2 px-1 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="20"
                                  value={subj.midsemScore ?? ''}
                                  onChange={(e) => handleScoreChange(idx, 'midsemScore', e.target.value)}
                                  placeholder="0-20"
                                  className="w-16 p-1.5 text-center font-mono font-bold border border-stone-300 rounded focus:border-[#14532d] bg-white text-xs"
                                />
                              </td>

                              {/* 2. Portfolio (/10) */}
                              <td className="py-2 px-1 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={subj.portfolioScore ?? ''}
                                  onChange={(e) => handleScoreChange(idx, 'portfolioScore', e.target.value)}
                                  placeholder="0-10"
                                  className="w-16 p-1.5 text-center font-mono font-bold border border-stone-300 rounded focus:border-[#14532d] bg-white text-xs"
                                />
                              </td>

                              {/* 3. Individual Project (/10) */}
                              <td className="py-2 px-1 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={subj.individualProjectScore ?? ''}
                                  onChange={(e) => handleScoreChange(idx, 'individualProjectScore', e.target.value)}
                                  placeholder="0-10"
                                  className="w-16 p-1.5 text-center font-mono font-bold border border-stone-300 rounded focus:border-[#14532d] bg-white text-xs"
                                />
                              </td>

                              {/* 4. Group Project (/10) */}
                              <td className="py-2 px-1 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={subj.groupProjectScore ?? ''}
                                  onChange={(e) => handleScoreChange(idx, 'groupProjectScore', e.target.value)}
                                  placeholder="0-10"
                                  className="w-16 p-1.5 text-center font-mono font-bold border border-stone-300 rounded focus:border-[#14532d] bg-white text-xs"
                                />
                              </td>

                              {/* 5. Exams Score (/50) */}
                              <td className="py-2 px-1 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  value={subj.examScore ?? ''}
                                  onChange={(e) => handleScoreChange(idx, 'examScore', e.target.value)}
                                  placeholder="0-50"
                                  className="w-16 p-1.5 text-center font-mono font-bold border-2 border-stone-400 rounded focus:border-[#14532d] bg-white text-xs text-[#14532d]"
                                />
                              </td>

                              {/* Total Score (/100) */}
                              <td className="py-2 px-2 text-center font-mono font-bold text-stone-900 text-sm bg-yellow-50/60">
                                {subj.totalScore}
                              </td>

                              {/* Letter Grade */}
                              <td className="py-2 px-2 text-center">
                                <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                                  subj.grade === 'A1' || subj.grade === 'B2'
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : 'bg-stone-100 text-stone-900'
                                }`}>
                                  {subj.grade}
                                </span>
                              </td>

                              {/* Remark */}
                              <td className="py-2 px-2 text-center text-stone-600 font-medium text-[11px]">
                                {subj.interpretation}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Quick Summary Strip */}
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-wrap items-center justify-between text-xs gap-3">
                    <div>
                      <span className="text-stone-500 font-medium">Core Subjects: </span>
                      <strong className="text-stone-900">
                        {editForm.subjects.filter(s => s.isCore).length} Constant
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-500 font-medium">Elective Slots: </span>
                      <strong className="text-stone-900">
                        {editForm.subjects.filter(s => !s.isCore).length} Slots
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-500 font-medium">Best 6 Aggregate: </span>
                      <strong className="text-[#14532d] font-mono font-bold text-sm">
                        {editForm.aggregate}
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-500 font-medium">GPA (4.0 scale): </span>
                      <strong className="text-yellow-700 font-mono font-bold text-sm">
                        {editForm.gpa.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Section 3: Conduct Remarks */}
                <div className="pt-4 border-t border-stone-200 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Student Conduct & Attitude
                    </label>
                    <textarea
                      rows={2}
                      value={editForm.conductRemarks}
                      onChange={(e) => setEditForm({ ...editForm, conductRemarks: e.target.value })}
                      placeholder="e.g. Well-behaved, obedient, punctual..."
                      className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                    />
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveResultStudentId(editForm.id);
                        setActiveTab('results');
                        setTimeout(() => {
                          window.print();
                        }, 250);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Result Slip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveResultStudentId(editForm.id);
                        setActiveTab('results');
                      }}
                      className="text-xs font-semibold text-[#14532d] hover:underline flex items-center gap-1 px-2 py-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Preview Official Report Card</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isCreatingNew && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete record for ${editForm.studentName}?`)) {
                            deleteStudentResult(editForm.id);
                            setSelectedStudent(null);
                            setEditForm(null);
                            showToast(`Deleted student result.`);
                          }
                        }}
                        className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Delete Student
                      </button>
                    )}

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#14532d] hover:bg-[#0b331c] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      Save Marks & Name
                    </button>
                  </div>
                </div>

              </form>
            ) : (
              <div className="text-center py-16 text-stone-500 space-y-3">
                <GraduationCap className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="text-base font-bold text-stone-800">No Student Selected</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Click any student on the left roster to view and edit their marks and scores, or click "Add New Student" to record a new scholar.
                </p>
                <button
                  onClick={startNewStudent}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#14532d] hover:bg-[#0b331c] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Student Now</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
