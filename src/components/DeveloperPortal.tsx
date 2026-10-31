import React, { useState, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import { SchoolCrest } from './SchoolCrest';
import { 
  UserCheck, 
  Settings, 
  Save, 
  RotateCcw, 
  Upload, 
  Check, 
  Plus, 
  Trash2, 
  Edit2, 
  FileText, 
  Download, 
  Image as ImageIcon,
  Building,
  GraduationCap,
  Sparkles,
  Key,
  Lock,
  Unlock,
  AlertCircle,
  Users,
  LogOut,
  ExternalLink,
  MapPin,
  Clock,
  ShieldCheck,
  Printer,
  Music,
  Play,
  Pause,
  RefreshCw,
  FileAudio,
  Phone,
  Mail,
  BookOpen,
  Zap,
  Globe,
  Radio,
  Eye,
  CheckCheck
} from 'lucide-react';
import { HeadTeacherProfile, StudentResult, SubjectScore, PtaNotice, FounderProfile } from '../types';
import { DEFAULT_FOUNDER, DEFAULT_SCHOOL_INFO, DEFAULT_HEADTEACHER } from '../data/defaultData';
import { compressImage } from '../utils/imageCompressor';
import { saveFounderImageToFirestore, saveHeadTeacherImageToFirestore } from '../services/firebaseClient';
import { 
  getSupabaseConfig, 
  setSupabaseConfig, 
  testSupabaseConnection, 
  SUPABASE_SETUP_SQL 
} from '../services/supabaseClient';
import { 
  generateUniqueIndexNumber, 
  formatFullClass, 
  getClassesForCourse, 
  isIndexNumberUnique,
  calculateStudentPositionInClass,
  getYearCameToSchool 
} from '../utils/studentUtils';

export const DeveloperPortal: React.FC = () => {
  const { 
    headTeacher, 
    updateHeadTeacher, 
    schoolInfo, 
    updateSchoolInfo, 
    founder, 
    updateFounder, 
    students, 
    addStudentResult, 
    updateStudentResult, 
    deleteStudentResult, 
    ptaNotices, 
    addPtaNotice, 
    deletePtaNotice, 
    clearAllPtaNotices,
    promoteAllBatches,
    teacherPassword, 
    updateTeacherPassword, 
    isDevAuthenticated, 
    loginDev, 
    logoutDev, 
    resetAllToDefaults, 
    setActiveTab, 
    setActiveResultStudentId,
    syncToFirebaseAccount,
    firebaseSyncStatus,
    courseConfigs,
    addCourse,
    addClassToCourse,
    removeClassFromCourse,
    deleteCourse,
    deleteClassFromCourse
  } = useSchool();

  // Password gate state
  const [devPasswordInput, setDevPasswordInput] = useState('');
  const [devPasswordError, setDevPasswordError] = useState('');

  // Batch Promotion state
  const [nextAcademicYearInput, setNextAcademicYearInput] = useState('2025/2026');

  // Course & Class Manager state
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCoreSubjects, setNewCourseCoreSubjects] = useState('Social Studies, General Science, General Mathematics, English Language');
  const [newCourseElectives, setNewCourseElectives] = useState('Elective 1, Elective 2, Elective 3, Elective 4');
  const [newCourseFirstClass, setNewCourseFirstClass] = useState('');

  const [selectedProgramForClass, setSelectedProgramForClass] = useState('Science');
  const [newClassName, setNewClassName] = useState('');

  // Developer tabs
  type DevTab = 
    | 'contact-info'
    | 'founder'
    | 'anthem'
    | 'headteacher'
    | 'school-identity'
    | 'history'
    | 'students'
    | 'pta-manager'
    | 'teacher-password'
    | 'supabase-sync'
    | 'firebase-sync'
    | 'courses-classes'
    | 'batch-promotions';

  const [activeTab, setActiveDevTab] = useState<DevTab>('contact-info');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Supabase Primary Storage state
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseConfig().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseConfig().anonKey);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Real-time live synchronization toggle (Active by default!)
  const [realTimeSync, setRealTimeSync] = useState(true);

  // Teacher password editing state
  const [newTeacherPw, setNewTeacherPw] = useState(teacherPassword);

  // PTA Notice form state
  const [newNotice, setNewNotice] = useState<Omit<PtaNotice, 'id'>>({
    title: '',
    category: 'General Meeting',
    date: new Date().toISOString().split('T')[0],
    author: 'Ghanata SHS PTA Secretariat',
    summary: '',
    content: '',
    priority: 'Normal',
    venue: 'Ghanata SHS Assembly Hall, Dodowa',
    time: '9:30 AM GMT'
  });

  // Headteacher local form state
  const [htForm, setHtForm] = useState<HeadTeacherProfile>({ ...headTeacher });

  // School Identity form state
  const [identityForm, setIdentityForm] = useState({
    name: schoolInfo.name,
    shortName: schoolInfo.shortName,
    logoUrl: schoolInfo.logoUrl || '/logo.png',
    mottoLatin: schoolInfo.mottoLatin,
    mottoEnglish: schoolInfo.mottoEnglish,
    secondaryMotto: schoolInfo.secondaryMotto,
    vision: schoolInfo.vision,
    mission: schoolInfo.mission,
    category: schoolInfo.category,
    established: schoolInfo.established,
    coreValues: [...schoolInfo.coreValues]
  });

  // Contact Information form state
  const [contactForm, setContactForm] = useState({
    postOfficeBox: schoolInfo.postOfficeBox,
    campusAddress: schoolInfo.campusAddress || 'Off the Accra-Somanya Road, Dodowa, Shai-Osudoku District, Greater Accra Region, Ghana',
    town: schoolInfo.town,
    district: schoolInfo.district,
    region: schoolInfo.region,
    country: schoolInfo.country,
    email: schoolInfo.email,
    secondaryEmail: schoolInfo.secondaryEmail,
    phone: schoolInfo.phone,
    secondaryPhone: schoolInfo.secondaryPhone,
    officeHours: schoolInfo.officeHours || 'Mon to Fri: 7:30 AM to 4:30 PM GMT',
    gpsCoordinates: schoolInfo.gpsCoordinates || 'Dodowa Valley Campus / Shai Hills Foot, Greater Accra'
  });

  // Founder form state
  const [founderForm, setFounderForm] = useState<FounderProfile>({ ...founder });

  // History form state
  const [historyForm, setHistoryForm] = useState<string[]>([...schoolInfo.briefHistory]);

  // Anthem & Ceremonial Fanfare form state
  const [anthemForm, setAnthemForm] = useState({
    title: schoolInfo.anthem?.title || 'Official Ghanata School Anthem',
    stanzasText: (schoolInfo.anthem?.stanzas || []).join('\n\n'),
    audioUrl: schoolInfo.anthem?.audioUrl || '',
    audioFileName: schoolInfo.anthem?.audioFileName || '',
    customFanfareNote: schoolInfo.anthem?.customFanfareNote || ''
  });
  const [isAnthemAudioPlaying, setIsAnthemAudioPlaying] = useState(false);
  const portalAudioRef = useRef<HTMLAudioElement | null>(null);

  // Student creation state
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<StudentResult>>({
    indexNumber: 'GHS/2025/101',
    studentName: 'Daniel Kwesi Appiah',
    gender: 'Male',
    program: 'Science',
    formLevel: 'Form 3',
    semester: 'Semester 1',
    classArm: 'Science 1',
    classForm: 'Form 3 Science 1',
    academicYear: '2024/2025',
    term: 'Semester 1',
    house: 'Royal House',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        positionInClass: '4th',
    totalStudentsInClass: 46,
    conductRemarks: 'Very disciplined and hardworking.',
    headTeacherRemarks: 'Keep seizing every golden opportunity.',
    promotedToNextClass: true,
    publishedDate: new Date().toISOString().split('T')[0],
    aggregate: 7,
    gpa: 3.9,
    subjects: [
      { id: 'eng', name: 'English Language', isCore: true, midsemScore: 18, portfolioScore: 9, individualProjectScore: 9, groupProjectScore: 9, examScore: 45, classScore: 45, totalScore: 90, grade: 'A1', interpretation: 'Excellent', remarks: 'Superb grammar' },
      { id: 'sci', name: 'General Mathematics', isCore: true, midsemScore: 19, portfolioScore: 9, individualProjectScore: 9, groupProjectScore: 10, examScore: 47, classScore: 47, totalScore: 94, grade: 'A1', interpretation: 'Excellent', remarks: 'Exceptional calculation skills' },
      { id: 'soc', name: 'Social Studies', isCore: true, midsemScore: 16, portfolioScore: 8, individualProjectScore: 9, groupProjectScore: 8, examScore: 43, classScore: 41, totalScore: 84, grade: 'A1', interpretation: 'Excellent', remarks: 'Good analytical skills' },
      { id: 'elec1', name: 'Physics', isCore: false, midsemScore: 18, portfolioScore: 9, individualProjectScore: 9, groupProjectScore: 9, examScore: 46, classScore: 45, totalScore: 91, grade: 'A1', interpretation: 'Excellent', remarks: 'Solid mastery' }
    ]
  });

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleDevLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setDevPasswordError('');
    const ok = loginDev(devPasswordInput);
    if (ok) {
      setDevPasswordInput('');
      showToast('Developer portal authenticated successfully.');
    } else {
      setDevPasswordError('Invalid developer password. Access denied. Please verify your credentials.');
    }
  };

  // Real-time helper: sync Contact Information
  const handleContactChange = (field: keyof typeof contactForm, val: string) => {
    const updated = { ...contactForm, [field]: val };
    setContactForm(updated);
    if (realTimeSync) {
      updateSchoolInfo(updated);
    }
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolInfo(contactForm);
    showToast('Contact information, phone numbers, and secretariat addresses updated live!');
  };

  const handleResetContact = () => {
    const defaults = {
      postOfficeBox: DEFAULT_SCHOOL_INFO.postOfficeBox,
      campusAddress: DEFAULT_SCHOOL_INFO.campusAddress || 'Off the Accra-Somanya Road, Dodowa, Shai-Osudoku District, Greater Accra Region, Ghana',
      town: DEFAULT_SCHOOL_INFO.town,
      district: DEFAULT_SCHOOL_INFO.district,
      region: DEFAULT_SCHOOL_INFO.region,
      country: DEFAULT_SCHOOL_INFO.country,
      email: DEFAULT_SCHOOL_INFO.email,
      secondaryEmail: DEFAULT_SCHOOL_INFO.secondaryEmail,
      phone: DEFAULT_SCHOOL_INFO.phone,
      secondaryPhone: DEFAULT_SCHOOL_INFO.secondaryPhone,
      officeHours: DEFAULT_SCHOOL_INFO.officeHours || 'Mon to Fri: 7:30 AM to 4:30 PM GMT',
      gpsCoordinates: DEFAULT_SCHOOL_INFO.gpsCoordinates || 'Dodowa Valley Campus / Shai Hills Foot, Greater Accra'
    };
    setContactForm(defaults);
    updateSchoolInfo(defaults);
    showToast('Reset contact information to school secretariat defaults.');
  };

  // Real-time helper: sync School Identity & Philosophy
  const handleIdentityChange = (field: keyof typeof identityForm, val: unknown) => {
    const updated = { ...identityForm, [field]: val };
    setIdentityForm(updated);
    if (realTimeSync) {
      updateSchoolInfo(updated);
    }
  };

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolInfo(identityForm);
    showToast('School Crest, Motto, Vision, Mission, and Core Values updated live!');
  };

  const handleAddCoreValue = () => {
    const updated = [...identityForm.coreValues, 'New Core Value'];
    setIdentityForm(prev => ({ ...prev, coreValues: updated }));
    if (realTimeSync) {
      updateSchoolInfo({ coreValues: updated });
    }
    showToast('Added new core value item.');
  };

  const handleUpdateCoreValue = (index: number, val: string) => {
    const updated = [...identityForm.coreValues];
    updated[index] = val;
    setIdentityForm(prev => ({ ...prev, coreValues: updated }));
    if (realTimeSync) {
      updateSchoolInfo({ coreValues: updated });
    }
  };

  const handleRemoveCoreValue = (index: number) => {
    if (identityForm.coreValues.length <= 1) {
      alert('At least one core value is required.');
      return;
    }
    const updated = identityForm.coreValues.filter((_, i) => i !== index);
    setIdentityForm(prev => ({ ...prev, coreValues: updated }));
    if (realTimeSync) {
      updateSchoolInfo({ coreValues: updated });
    }
    showToast('Removed core value.');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Compressing and uploading official school logo...');
      const compressed = await compressImage(file, 300, 0.85);
      setIdentityForm(prev => ({ ...prev, logoUrl: compressed }));
      updateSchoolInfo({ logoUrl: compressed });
      await syncToFirebaseAccount();
      showToast('Official school logo uploaded, compressed, and broadcast live to all users!');
    } catch (err) {
      console.error('Logo upload error:', err);
      showToast('Failed to process logo image. Please try another image.');
    }
  };

  const handleResetLogo = () => {
    const defaultLogo = '/logo.png';
    setIdentityForm(prev => ({ ...prev, logoUrl: defaultLogo }));
    updateSchoolInfo({ logoUrl: defaultLogo });
    showToast('Reset school logo to the official Ghanata Senior High School crest.');
  };

  // Real-time helper: Founder Tribute
  const handleFounderChange = (field: keyof FounderProfile, val: unknown) => {
    const updated = { ...founderForm, [field]: val };
    setFounderForm(updated);
    if (realTimeSync) {
      updateFounder(updated);
    }
  };

  const handleSaveFounder = async (e: React.FormEvent) => {
    e.preventDefault();
    updateFounder(founderForm);
    if (founderForm.imageUrl) {
      await saveFounderImageToFirestore(founderForm.imageUrl);
    }
    await syncToFirebaseAccount({ founder: founderForm });
    showToast('Founder profile & portrait saved and synchronized to cloud storage live!');
  };

  // Founder Image upload handler from local storage with canvas optimization
  const handleFounderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Optimizing and uploading founder portrait to cloud storage...');
      const compressed = await compressImage(file, 500, 0.85);
      setFounderForm(prev => ({ ...prev, imageUrl: compressed }));
      updateFounder({ imageUrl: compressed });
      await saveFounderImageToFirestore(compressed);
      await syncToFirebaseAccount({ founder: { ...founder, imageUrl: compressed } });
      showToast('Founder portrait uploaded and synchronized to cloud storage for all users!');
    } catch (err) {
      console.error('Founder portrait error:', err);
      showToast('Failed to upload founder portrait. Please try another image.');
    }
  };

  const handleResetFounderImage = async () => {
    setFounderForm(prev => ({ ...prev, imageUrl: DEFAULT_FOUNDER.imageUrl }));
    updateFounder({ imageUrl: DEFAULT_FOUNDER.imageUrl });
    await saveFounderImageToFirestore(DEFAULT_FOUNDER.imageUrl);
    await syncToFirebaseAccount({ founder: { ...founder, imageUrl: DEFAULT_FOUNDER.imageUrl } });
    showToast('Reset founder portrait to historical archive default and updated cloud storage.');
  };

  // Real-time helper: Anthem & Ceremonial Fanfare Audio
  const handleAnthemAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Audio file size exceeds 15MB. Please choose a smaller MP3 or WAV file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setAnthemForm(prev => ({
        ...prev,
        audioUrl: dataUrl,
        audioFileName: file.name
      }));
      updateSchoolInfo({
        anthem: {
          ...schoolInfo.anthem,
          audioUrl: dataUrl,
          audioFileName: file.name
        }
      });
      showToast(`Storing audio fanfare "${file.name}" to Google Cloud...`);
      await syncToFirebaseAccount();
      showToast(`Ceremonial fanfare "${file.name}" safely stored in Google Cloud for playback!`);
    };
    reader.readAsDataURL(file);
  };

  const handleResetAnthemAudio = () => {
    setAnthemForm(prev => ({
      ...prev,
      audioUrl: '',
      audioFileName: '',
      customFanfareNote: ''
    }));
    updateSchoolInfo({
      anthem: {
        ...schoolInfo.anthem,
        audioUrl: undefined,
        audioFileName: undefined,
        customFanfareNote: undefined
      }
    });
    showToast('Ceremonial fanfare audio reset to official default fanfare.');
  };

  const handleRestoreOfficialLyrics = () => {
    const officialTitle = DEFAULT_SCHOOL_INFO.anthem.title;
    const officialStanzas = DEFAULT_SCHOOL_INFO.anthem.stanzas.join('\n\n');
    setAnthemForm(prev => ({
      ...prev,
      title: officialTitle,
      stanzasText: officialStanzas
    }));
    updateSchoolInfo({
      anthem: {
        ...schoolInfo.anthem,
        title: officialTitle,
        stanzas: DEFAULT_SCHOOL_INFO.anthem.stanzas
      }
    });
    showToast('Restored official Ghanata School Anthem lyrics in real time.');
  };

  const handleSaveAnthem = (e: React.FormEvent) => {
    e.preventDefault();
    const stanzas = anthemForm.stanzasText
      .split(/\n\s*\n/)
      .map(s => s.trim())
      .filter(Boolean);

    const updated = {
      ...schoolInfo,
      anthem: {
        title: anthemForm.title.trim() || 'Official Ghanata School Anthem',
        stanzas: stanzas.length > 0 ? stanzas : schoolInfo.anthem.stanzas,
        audioUrl: anthemForm.audioUrl || undefined,
        audioFileName: anthemForm.audioFileName || undefined,
        customFanfareNote: anthemForm.customFanfareNote || undefined
      }
    };
    updateSchoolInfo(updated);
    showToast('School Anthem lyrics and ceremonial fanfare audio updated live!');
  };

  const togglePortalAudioPlay = () => {
    if (!portalAudioRef.current) return;
    if (isAnthemAudioPlaying) {
      portalAudioRef.current.pause();
      setIsAnthemAudioPlaying(false);
    } else {
      portalAudioRef.current.play().then(() => {
        setIsAnthemAudioPlaying(true);
      }).catch(err => {
        console.error('Playback error', err);
      });
    }
  };

  // Headteacher updates
  const handleHtChange = (field: keyof HeadTeacherProfile, val: unknown) => {
    const updated = { ...htForm, [field]: val };
    setHtForm(updated);
    if (realTimeSync) {
      updateHeadTeacher(updated);
    }
  };

  const handleHeadTeacherImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Optimizing and uploading head teacher photo to cloud storage...');
      const compressed = await compressImage(file, 500, 0.85);
      setHtForm(prev => ({ ...prev, imageUrl: compressed }));
      updateHeadTeacher({ imageUrl: compressed });
      await saveHeadTeacherImageToFirestore(compressed);
      await syncToFirebaseAccount({ headTeacher: { ...headTeacher, imageUrl: compressed } });
      showToast('Head teacher photo uploaded and synchronized to cloud storage for all users!');
    } catch (err) {
      console.error('Head teacher upload error:', err);
      showToast('Failed to upload head teacher photo. Please try another image.');
    }
  };

  const handleSaveHeadTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    updateHeadTeacher(htForm);
    if (htForm.imageUrl) {
      await saveHeadTeacherImageToFirestore(htForm.imageUrl);
    }
    await syncToFirebaseAccount({ headTeacher: htForm });
    showToast('Head Teacher profile & picture saved to cloud storage live!');
  };

  // Brief History updates
  const handleHistoryParagraphChange = (index: number, text: string) => {
    const updated = [...historyForm];
    updated[index] = text;
    setHistoryForm(updated);
    if (realTimeSync) {
      updateSchoolInfo({ briefHistory: updated });
    }
  };

  const handleAddHistoryParagraph = () => {
    const updated = [...historyForm, 'New historical milestone for Ghanata Senior High School...'];
    setHistoryForm(updated);
    updateSchoolInfo({ briefHistory: updated });
    showToast('Added new history paragraph.');
  };

  const handleRemoveHistoryParagraph = (index: number) => {
    if (historyForm.length <= 1) {
      alert('At least one historical paragraph is required.');
      return;
    }
    const updated = historyForm.filter((_, i) => i !== index);
    setHistoryForm(updated);
    updateSchoolInfo({ briefHistory: updated });
    showToast('Removed history paragraph.');
  };

  const handleResetHistory = () => {
    setHistoryForm([...DEFAULT_SCHOOL_INFO.briefHistory]);
    updateSchoolInfo({ briefHistory: DEFAULT_SCHOOL_INFO.briefHistory });
    showToast('Reset school history to official archive narrative.');
  };

  // Teacher password updates
  const handleSaveTeacherPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherPw.trim()) {
      alert('Password cannot be empty.');
      return;
    }
    updateTeacherPassword(newTeacherPw.trim());
    showToast(`Teacher mode password updated to "${newTeacherPw.trim()}".`);
  };

  // PTA Announcements
  const handlePostPtaNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      alert('Please fill out notice title and content.');
      return;
    }

    const noticeObj: PtaNotice = {
      ...newNotice,
      id: `pta-${Date.now()}`
    };

    addPtaNotice(noticeObj);
    showToast(`PTA Announcement "${newNotice.title}" posted live to parents!`);
    setNewNotice({
      title: '',
      category: 'General Meeting',
      date: new Date().toISOString().split('T')[0],
      author: 'Ghanata SHS PTA Secretariat',
      summary: '',
      content: '',
      priority: 'Normal',
      venue: 'Ghanata SHS Assembly Hall, Dodowa',
      time: '9:30 AM GMT'
    });
  };

  const handleDeletePtaNotice = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the PTA notice: "${title}"?`)) {
      deletePtaNotice(id);
      showToast(`PTA notice "${title}" was deleted.`);
    }
  };

  const presetHeadteacherPhotos = [
    { label: 'Official Male Headmaster 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80' },
    { label: 'Official Male Headmaster 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Official Female Headmistress 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80' },
    { label: 'Official Female Headmistress 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80' },
  ];

  // PASSWORD GATE IF NOT AUTHENTICATED
  if (!isDevAuthenticated) {
    return (
      <div className="py-20 bg-stone-100 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl border border-stone-200 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#14532d] text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-block text-[11px] font-bold text-yellow-900 uppercase tracking-wider bg-yellow-100 px-3 py-1 rounded-full mb-2">
              Master Developer Terminal
            </div>
            <h2 className="font-heading text-2xl font-bold text-stone-900">
              Developer & Admin Portal
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Authorized webmasters can edit any part of the website, upload founder portraits and audio, update contact info, and manage records in real time.
            </p>
          </div>

          <form onSubmit={handleDevLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Master Developer Password:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={devPasswordInput}
                  onChange={(e) => setDevPasswordInput(e.target.value)}
                  placeholder="Enter developer password..."
                  className="w-full px-4 py-3 pl-10 text-sm border-2 border-stone-300 rounded-xl focus:outline-none focus:border-[#14532d] bg-stone-50"
                />
                <Key className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {devPasswordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{devPasswordError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#14532d] hover:bg-[#0b331c] text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Authenticate as Developer</span>
            </button>
          </form>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-500">
            <div className="flex items-center justify-center gap-1.5 font-semibold text-stone-700">
              <ShieldCheck className="w-4 h-4 text-[#14532d]" />
              <span>Restricted Administrative Access</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              This terminal is strictly for Ghanata SHS system developers. Changes manifest across the website in real time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // FULL DEVELOPER DASHBOARD
  return (
    <div className="py-10 bg-stone-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-yellow-300 uppercase tracking-widest bg-stone-800 px-3 py-1 rounded-full border border-amber-400/30">
                <Settings className="w-3.5 h-3.5 text-yellow-300" />
                <span>Master Developer Control Center</span>
              </div>

              {/* Real-Time Live Sync Indicator */}
              <button
                onClick={() => setRealTimeSync(!realTimeSync)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  realTimeSync
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                    : 'bg-stone-800 text-stone-400 border-stone-700'
                }`}
                title="Click to toggle live instant synchronization"
              >
                <span className={`w-2 h-2 rounded-full ${realTimeSync ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
                <span>Real-Time Sync: {realTimeSync ? 'ACTIVE' : 'MANUAL'}</span>
              </button>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              Ghanata SHS System & Content Management
            </h1>
            <p className="text-xs sm:text-sm text-stone-300">
              Developer can edit any part of the website in real time: contact info, founder portrait upload, fanfare audio & lyrics, headteacher, motto, vision, and PTA announcements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm('Reset all modified school records to official defaults?')) {
                  resetAllToDefaults();
                  setHtForm({ ...DEFAULT_HEADTEACHER });
                  setIdentityForm({
                    name: DEFAULT_SCHOOL_INFO.name,
                    shortName: DEFAULT_SCHOOL_INFO.shortName,
                    logoUrl: DEFAULT_SCHOOL_INFO.logoUrl || '/logo.png',
                    mottoLatin: DEFAULT_SCHOOL_INFO.mottoLatin,
                    mottoEnglish: DEFAULT_SCHOOL_INFO.mottoEnglish,
                    secondaryMotto: DEFAULT_SCHOOL_INFO.secondaryMotto,
                    vision: DEFAULT_SCHOOL_INFO.vision,
                    mission: DEFAULT_SCHOOL_INFO.mission,
                    category: DEFAULT_SCHOOL_INFO.category,
                    established: DEFAULT_SCHOOL_INFO.established,
                    coreValues: [...DEFAULT_SCHOOL_INFO.coreValues]
                  });
                  setContactForm({
                    postOfficeBox: DEFAULT_SCHOOL_INFO.postOfficeBox,
                    campusAddress: DEFAULT_SCHOOL_INFO.campusAddress || 'Off the Accra-Somanya Road, Dodowa, Shai-Osudoku District, Greater Accra Region, Ghana',
                    town: DEFAULT_SCHOOL_INFO.town,
                    district: DEFAULT_SCHOOL_INFO.district,
                    region: DEFAULT_SCHOOL_INFO.region,
                    country: DEFAULT_SCHOOL_INFO.country,
                    email: DEFAULT_SCHOOL_INFO.email,
                    secondaryEmail: DEFAULT_SCHOOL_INFO.secondaryEmail,
                    phone: DEFAULT_SCHOOL_INFO.phone,
                    secondaryPhone: DEFAULT_SCHOOL_INFO.secondaryPhone,
                    officeHours: DEFAULT_SCHOOL_INFO.officeHours || 'Mon to Fri: 7:30 AM to 4:30 PM GMT',
                    gpsCoordinates: DEFAULT_SCHOOL_INFO.gpsCoordinates || 'Dodowa Valley Campus / Shai Hills Foot, Greater Accra'
                  });
                  setFounderForm({ ...DEFAULT_FOUNDER });
                  setHistoryForm([...DEFAULT_SCHOOL_INFO.briefHistory]);
                  setNewTeacherPw('CarpeDiem1936');
                  showToast('All system records restored to official archive defaults.');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium rounded-lg border border-stone-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-yellow-300" />
              <span>Factory Reset</span>
            </button>

            <button
              onClick={() => setActiveTab('home')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Live Home</span>
            </button>

            <button
              onClick={logoutDev}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 text-stone-300 hover:text-white text-xs font-medium rounded-lg border border-stone-700 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Portal</span>
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-900 text-emerald-100 border border-emerald-600 p-4 rounded-xl shadow-md flex items-center justify-between gap-3 text-sm animate-fade-in">
            <div className="flex items-center gap-2 font-medium">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
            <span className="text-[11px] bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-200">
              Live in Real Time
            </span>
          </div>
        )}

        {/* Comprehensive Developer Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-stone-300 pb-2">
          
          <button
            onClick={() => setActiveDevTab('contact-info')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'contact-info'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <Phone className="w-4 h-4 text-yellow-400" />
            <span>Contact & Secretariat</span>
            <span className="text-[10px] bg-yellow-400 text-stone-900 px-1.5 py-0.2 rounded font-bold">Live</span>
          </button>

          <button
            onClick={() => setActiveDevTab('founder')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'founder'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Founder & Image Upload</span>
          </button>

          <button
            onClick={() => setActiveDevTab('anthem')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'anthem'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <Music className="w-4 h-4 text-yellow-400" />
            <span>Anthem & Audio Fanfare</span>
          </button>

          <button
            onClick={() => setActiveDevTab('headteacher')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'headteacher'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Current Head Teacher</span>
          </button>

          <button
            onClick={() => setActiveDevTab('school-identity')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'school-identity'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Motto, Vision & Values</span>
          </button>

          <button
            onClick={() => setActiveDevTab('history')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Brief History Narrative</span>
          </button>

          <button
            onClick={() => setActiveDevTab('students')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Students Results ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveDevTab('pta-manager')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'pta-manager'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>PTA Announcements ({ptaNotices.length})</span>
          </button>

          <button
            onClick={() => setActiveDevTab('teacher-password')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'teacher-password'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <Key className="w-4 h-4 text-yellow-300" />
            <span>Teacher Mode Password</span>
          </button>

          <button
            onClick={() => setActiveDevTab('supabase-sync')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'supabase-sync'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Supabase Primary Storage</span>
            <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded font-bold">Primary</span>
          </button>

          <button
            onClick={() => setActiveDevTab('firebase-sync')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'firebase-sync'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Firebase Secondary Backup</span>
          </button>

          <button
            onClick={() => setActiveDevTab('courses-classes')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'courses-classes'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-yellow-400" />
            <span>Courses & Classes Manager</span>
          </button>

          <button
            onClick={() => setActiveDevTab('batch-promotions')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'batch-promotions'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-yellow-300" />
            <span>Batch Promotion & Alumni Archive</span>
            <span className="text-[10px] bg-yellow-400 text-stone-950 px-1.5 py-0.2 rounded font-bold">Auto</span>
          </button>

        </div>

        {/* TAB 1: CONTACT INFORMATION & SECRETARIAT (REAL-TIME UPDATES) */}
        {activeTab === 'contact-info' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-yellow-900 uppercase tracking-widest">
                  Communications & Secretariat Administration
                </span>
                <h2 className="font-heading text-lg sm:text-xl font-bold text-stone-900 mt-0.5">
                  Official Contact Channels & Campus Location
                </h2>
                <p className="text-xs text-stone-500">
                  Update school telephone numbers, WhatsApp desks, official emails, postal address, physical campus location, office hours, and GPS coordinates.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetContact}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Contact Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <span>View Contact Section</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-6">
              {/* Telephone & Mobile Desk */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                <h3 className="font-heading text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#14532d]" />
                  <span>Telephone Secretariat & WhatsApp</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Primary School Telephone *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.phone}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      placeholder="+233 (0) 30 291 0422"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white"
                    />
                    <span className="text-[11px] text-stone-500 mt-1 block">Displayed on website footer and contact cards.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Secondary Telephone / Mobile / WhatsApp Desk
                    </label>
                    <input
                      type="text"
                      value={contactForm.secondaryPhone}
                      onChange={(e) => handleContactChange('secondaryPhone', e.target.value)}
                      placeholder="+233 (0) 24 456 7891"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white"
                    />
                    <span className="text-[11px] text-stone-500 mt-1 block">Mobile or direct WhatsApp line for urgent inquiries.</span>
                  </div>
                </div>
              </div>

              {/* Email Communications */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                <h3 className="font-heading text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#14532d]" />
                  <span>Official Email Addresses</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Primary Institutional Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      placeholder="info@ghanatashs.edu.gh"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white font-mono"
                    />
                    <span className="text-[11px] text-stone-500 mt-1 block">Main email shown in top bar, header, and footer.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Secondary / Admissions / Results Email
                    </label>
                    <input
                      type="email"
                      value={contactForm.secondaryEmail}
                      onChange={(e) => handleContactChange('secondaryEmail', e.target.value)}
                      placeholder="ghanatashsdodowa@gmail.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white font-mono"
                    />
                    <span className="text-[11px] text-stone-500 mt-1 block">Secondary inbox for transcripts and parents.</span>
                  </div>
                </div>
              </div>

              {/* Postal Address & Physical Location */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                <h3 className="font-heading text-sm font-bold text-stone-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#14532d]" />
                  <span>Postal Address & Physical Campus</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Post Office Box Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.postOfficeBox}
                      onChange={(e) => handleContactChange('postOfficeBox', e.target.value)}
                      placeholder="P.O. Box 4, Dodowa, Greater Accra Region, Ghana"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Physical Campus Location
                    </label>
                    <input
                      type="text"
                      value={contactForm.campusAddress}
                      onChange={(e) => handleContactChange('campusAddress', e.target.value)}
                      placeholder="Off the Accra-Somanya Road, Dodowa, Shai-Osudoku District..."
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Town</label>
                    <input
                      type="text"
                      value={contactForm.town}
                      onChange={(e) => handleContactChange('town', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">District</label>
                    <input
                      type="text"
                      value={contactForm.district}
                      onChange={(e) => handleContactChange('district', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Region</label>
                    <input
                      type="text"
                      value={contactForm.region}
                      onChange={(e) => handleContactChange('region', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={contactForm.country}
                      onChange={(e) => handleContactChange('country', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Secretariat Office Hours
                    </label>
                    <input
                      type="text"
                      value={contactForm.officeHours}
                      onChange={(e) => handleContactChange('officeHours', e.target.value)}
                      placeholder="Mon – Fri: 7:30 AM – 4:30 PM GMT"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      GPS / Landmark Coordinates
                    </label>
                    <input
                      type="text"
                      value={contactForm.gpsCoordinates}
                      onChange={(e) => handleContactChange('gpsCoordinates', e.target.value)}
                      placeholder="Dodowa Valley Campus / Shai Hills Foot"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  <span>Changes immediately manifest across header strip, contact page, and footer.</span>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#14532d] hover:bg-[#0b331c] text-white font-bold rounded-lg text-sm shadow-sm transition-colors cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Contact Information</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: FOUNDER PROFILE (LOCAL IMAGE UPLOAD & TRIBUTE) */}
        {activeTab === 'founder' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-yellow-900 uppercase tracking-widest">
                  Historical Heritage Administration
                </span>
                <h2 className="font-heading text-lg sm:text-xl font-bold text-stone-900 mt-0.5">
                  Founder Tribute Profile: Rev. Emmanuel Osabutey-Aguedze
                </h2>
                <p className="text-xs text-stone-500">
                  Upload founder portrait directly from your computer / local storage, update biography, quote, and achievements in real time.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetFounderImage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default Portrait</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-yellow-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold cursor-pointer w-fit"
                >
                  <span>View Public Tribute</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveFounder} className="space-y-6">
              {/* Image Upload Zone */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Founder Portrait Image (Local Storage Upload)
                  </label>
                  <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Real-time broadcast to Home & History
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Image Preview Box */}
                  <div className="md:col-span-4 flex flex-col items-center">
                    <div className="w-44 h-56 rounded-xl overflow-hidden border-2 border-yellow-500 shadow-md bg-stone-900 relative group">
                      <img
                        src={founderForm.imageUrl}
                        alt={founderForm.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/founder.jpg';
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-stone-950/85 p-2 text-center text-white text-[11px] font-medium">
                        Current Live Portrait
                      </div>
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="border-2 border-dashed border-stone-300 hover:border-yellow-500 rounded-xl p-5 bg-white text-center transition-colors">
                      <Upload className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-stone-800">
                        Upload Founder Portrait from your Computer / Local Device
                      </p>
                      <p className="text-[11px] text-stone-500 mt-1 mb-3">
                        Select any JPG, PNG, or WebP picture from your computer. It is automatically compressed and saved to local storage.
                      </p>
                      <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#14532d] hover:bg-[#0f3d21] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors">
                        <ImageIcon className="w-4 h-4" />
                        <span>Choose Local Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFounderImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <span className="text-[11px] text-stone-500 block mb-1">Or direct web image URL:</span>
                      <input
                        type="text"
                        value={founderForm.imageUrl}
                        onChange={(e) => handleFounderChange('imageUrl', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Founder Information Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Founder Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={founderForm.name}
                    onChange={(e) => handleFounderChange('name', e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Honorary Title / Salutation
                  </label>
                  <input
                    type="text"
                    value={founderForm.title}
                    onChange={(e) => handleFounderChange('title', e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Years of Life (e.g. 1902 to 1978)
                  </label>
                  <input
                    type="text"
                    value={founderForm.yearsOfLife}
                    onChange={(e) => handleFounderChange('yearsOfLife', e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Founding Year
                  </label>
                  <input
                    type="number"
                    value={founderForm.foundingYear}
                    onChange={(e) => handleFounderChange('foundingYear', parseInt(e.target.value) || 1936)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Original Name (1936)
                  </label>
                  <input
                    type="text"
                    value={founderForm.originalName}
                    onChange={(e) => handleFounderChange('originalName', e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Founder Inspiring Quote
                </label>
                <input
                  type="text"
                  value={founderForm.quote}
                  onChange={(e) => handleFounderChange('quote', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white font-academic italic"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Biography & Historical Tribute
                </label>
                <textarea
                  rows={4}
                  value={founderForm.biography}
                  onChange={(e) => handleFounderChange('biography', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Updates manifest in real time and save permanently in browser storage.
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#14532d] hover:bg-[#0b331c] text-white font-bold rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Founder Tribute</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: ANTHEM & CEREMONIAL AUDIO FANFARE (UPLOAD & LYRICS) */}
        {activeTab === 'anthem' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-8">
            <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-yellow-900 uppercase tracking-widest">
                  Ceremonial Audio & Anthem Administration
                </span>
                <h2 className="font-heading text-lg sm:text-xl font-bold text-stone-900 mt-0.5">
                  School Anthem Lyrics & Fanfare Audio Manager
                </h2>
                <p className="text-xs text-stone-500">
                  Upload custom audio recordings (MP3/WAV) from your local device, preview playback, test downloads, and update official anthem lyrics in real time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('academics')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold cursor-pointer w-fit"
              >
                <span>View Anthem Player</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnthem} className="space-y-6">
              {/* SECTION A: Audio Fanfare Upload & Preview */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Music className="w-4 h-4 text-[#14532d]" />
                      <span>Ceremonial Fanfare Audio Upload</span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      Upload ceremonial fanfare audio or official choir recording from local storage (MP3, WAV, M4A).
                    </p>
                  </div>

                  {anthemForm.audioUrl && (
                    <button
                      type="button"
                      onClick={handleResetAnthemAudio}
                      className="text-xs text-red-700 hover:text-red-900 font-medium underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Official Fanfare</span>
                    </button>
                  )}
                </div>

                {/* Upload Box */}
                <div className="border-2 border-dashed border-stone-300 hover:border-yellow-500 rounded-xl p-5 bg-white text-center transition-colors">
                  <FileAudio className="w-9 h-9 text-yellow-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-stone-800">
                    Upload Audio Fanfare File from Local Disk
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1 mb-3">
                    Supports MP3, WAV, M4A, or AAC audio files. Max 15MB. Real-time update to anthem player.
                  </p>
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#14532d] hover:bg-[#0f3d21] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Choose Audio File (.mp3, .wav)</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAnthemAudioUpload}
                      className="hidden"
                    />
                  </label>

                  {anthemForm.audioFileName && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-900 border border-yellow-300 rounded-md text-xs font-mono">
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Active File: {anthemForm.audioFileName}</span>
                    </div>
                  )}
                </div>

                {/* In-Portal Audio Player Preview */}
                <div className="bg-stone-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <audio
                      ref={portalAudioRef}
                      src={anthemForm.audioUrl || '/audio/Ghanata_Senior_High_School_Anthem_Fanfare.wav'}
                      onEnded={() => setIsAnthemAudioPlaying(false)}
                    />
                    <button
                      type="button"
                      onClick={togglePortalAudioPlay}
                      className="w-10 h-10 rounded-full bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-stone-950 flex items-center justify-center transition-all cursor-pointer shadow-md"
                    >
                      {isAnthemAudioPlaying ? <Pause className="w-5 h-5 fill-stone-950" /> : <Play className="w-5 h-5 fill-stone-950 translate-x-0.5" />}
                    </button>
                    <div>
                      <div className="text-xs font-bold text-yellow-300">
                        {isAnthemAudioPlaying ? 'Playing Audio Preview...' : 'Click to Preview Audio'}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {anthemForm.audioFileName ? `Custom: ${anthemForm.audioFileName}` : 'Default Ceremonial Fanfare (44.1 kHz WAV)'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={anthemForm.audioUrl || '/audio/Ghanata_Senior_High_School_Anthem_Fanfare.wav'}
                      download={anthemForm.audioFileName || 'Ghanata_Senior_High_School_Anthem_Fanfare.wav'}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Download Test</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* SECTION B: Official Anthem Lyrics Editor */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-stone-900">
                      School Anthem Lyrics Editor
                    </h3>
                    <p className="text-xs text-stone-500">
                      Separate stanzas and chorus with a blank line. Manifests in real time on the Academics page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRestoreOfficialLyrics}
                    className="text-xs text-[#14532d] hover:text-[#0b331c] font-semibold underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restore Official Lyrics</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Anthem Title
                  </label>
                  <input
                    type="text"
                    required
                    value={anthemForm.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnthemForm(prev => ({ ...prev, title: val }));
                      if (realTimeSync) {
                        updateSchoolInfo({
                          anthem: {
                            ...schoolInfo.anthem,
                            title: val
                          }
                        });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white font-heading font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Anthem Stanzas & Chorus (Separate stanzas with double Enter / blank line)
                  </label>
                  <textarea
                    rows={10}
                    required
                    value={anthemForm.stanzasText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnthemForm(prev => ({ ...prev, stanzasText: val }));
                      if (realTimeSync) {
                        const stanzas = val.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
                        if (stanzas.length > 0) {
                          updateSchoolInfo({
                            anthem: {
                              ...schoolInfo.anthem,
                              stanzas
                            }
                          });
                        }
                      }
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Updates instantly synchronize with the Academics and Anthem pages.
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#14532d] hover:bg-[#0b331c] text-white font-bold rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Anthem & Audio</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: HEADTEACHER / HEADMASTER PROFILE */}
        {activeTab === 'headteacher' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <h2 className="font-heading text-lg font-bold text-stone-900">
                  Update Current Head Teacher Details
                </h2>
                <p className="text-xs text-stone-500">
                  Edits made here instantly update the leadership section on the Ghanata SHS Home Page.
                </p>
              </div>

              <form onSubmit={handleSaveHeadTeacher} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Head Teacher Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={htForm.name}
                      onChange={(e) => handleHtChange('name', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Official Designation / Title
                    </label>
                    <input
                      type="text"
                      value={htForm.title}
                      onChange={(e) => handleHtChange('title', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d]"
                    />
                  </div>
                </div>

                {/* Picture Settings */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Head Teacher Picture *
                  </label>
                  
                  <div>
                    <span className="text-[11px] text-stone-500 block mb-1">Image URL Address:</span>
                    <input
                      type="text"
                      value={htForm.imageUrl}
                      onChange={(e) => handleHtChange('imageUrl', e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-white"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-stone-500 block mb-1">Or Upload Image File from your device:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeadTeacherImageUpload}
                      className="text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#14532d] file:text-white hover:file:bg-[#166534] cursor-pointer"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-stone-500 block mb-1">Or pick a curated Ghanaian portrait preset:</span>
                    <div className="flex flex-wrap gap-2">
                      {presetHeadteacherPhotos.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleHtChange('imageUrl', preset.url)}
                          className={`text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                            htForm.imageUrl === preset.url
                              ? 'bg-yellow-100 text-amber-900 border-amber-400 font-bold'
                              : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Tenure in Office
                    </label>
                    <input
                      type="text"
                      value={htForm.tenure}
                      onChange={(e) => handleHtChange('tenure', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Academic Qualifications
                    </label>
                    <input
                      type="text"
                      value={htForm.qualification}
                      onChange={(e) => handleHtChange('qualification', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Welcome Address / Message to the School Community
                  </label>
                  <textarea
                    rows={4}
                    value={htForm.welcomeMessage}
                    onChange={(e) => handleHtChange('welcomeMessage', e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d]"
                  />
                </div>

                <div className="pt-4 border-t border-stone-200 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#14532d] hover:bg-[#0b331c] text-white font-bold rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Head Teacher Profile</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Live Card Preview */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
              <span className="text-xs font-bold text-yellow-900 uppercase tracking-wider block">
                Live Card Preview
              </span>
              <div className="w-full h-64 rounded-xl overflow-hidden bg-stone-900 relative">
                <img
                  src={htForm.imageUrl}
                  alt={htForm.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_HEADTEACHER.imageUrl;
                  }}
                />
              </div>
              <div>
                <h4 className="font-heading font-bold text-base text-stone-900">
                  {htForm.name}
                </h4>
                <p className="text-xs text-[#14532d] font-semibold">
                  {htForm.title} · {htForm.tenure}
                </p>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-3">
                  "{htForm.welcomeMessage}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SCHOOL IDENTITY, VISION, MISSION & MOTTO */}
        {activeTab === 'school-identity' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-stone-900">
                  School Identity, Motto, Vision & Values
                </h2>
                <p className="text-xs text-stone-500">
                  Configure the official school motto, English translation, secondary creed, vision statement, and institutional pillars.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-950 border border-yellow-300 rounded-lg text-xs font-semibold cursor-pointer w-fit"
              >
                <span>View on Home Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveIdentity} className="space-y-6">
              {/* Official School Crest / Logo Management Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl border border-stone-200 p-2 shadow-xs flex items-center justify-center flex-shrink-0">
                      <img
                        src={identityForm.logoUrl || '/logo.png'}
                        alt="Current School Logo"
                        className="w-full h-full object-contain filter drop-shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 mb-1">
                        <Check className="w-3 h-3" />
                        <span>Official & Actual School Logo</span>
                      </div>
                      <h3 className="font-heading font-bold text-sm text-stone-900">
                        Official Ghanata SHS Crest (Carpe Diem)
                      </h3>
                      <p className="text-xs text-stone-500">
                        Displays in real-time across the navbar, hero banner, certificates, report slips, and footer.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#14532d] hover:bg-[#0f3d21] text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Logo</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      title="Reset to official crest"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/80">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Direct Image URL (or uploaded base64 data)
                  </label>
                  <input
                    type="text"
                    value={identityForm.logoUrl || ''}
                    onChange={(e) => handleIdentityChange('logoUrl', e.target.value)}
                    placeholder="/logo.png or https://example.com/logo.png"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    School Latin Motto *
                  </label>
                  <input
                    type="text"
                    required
                    value={identityForm.mottoLatin}
                    onChange={(e) => handleIdentityChange('mottoLatin', e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] font-heading font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Motto English Translation *
                  </label>
                  <input
                    type="text"
                    required
                    value={identityForm.mottoEnglish}
                    onChange={(e) => handleIdentityChange('mottoEnglish', e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Secondary School Creed / Slogan
                </label>
                <input
                  type="text"
                  value={identityForm.secondaryMotto}
                  onChange={(e) => handleIdentityChange('secondaryMotto', e.target.value)}
                  placeholder="Enter to Learn, Depart to Serve"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Official School Name
                  </label>
                  <input
                    type="text"
                    value={identityForm.name}
                    onChange={(e) => handleIdentityChange('name', e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category & Classification
                  </label>
                  <input
                    type="text"
                    value={identityForm.category}
                    onChange={(e) => handleIdentityChange('category', e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  School Vision Statement
                </label>
                <textarea
                  rows={3}
                  value={identityForm.vision}
                  onChange={(e) => handleIdentityChange('vision', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  School Mission Statement
                </label>
                <textarea
                  rows={3}
                  value={identityForm.mission}
                  onChange={(e) => handleIdentityChange('mission', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d]"
                />
              </div>

              {/* School Core Values Management Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-600" />
                      <span>School Core Values & Institutional Pillars</span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      Manage the foundational principles displayed in the philosophy section on the Home Page and official documents.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCoreValue}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#14532d] hover:bg-[#0f3d21] text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs w-fit"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Core Value</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {identityForm.coreValues.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-stone-300">
                      <span className="text-[11px] font-bold text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded font-mono shrink-0">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleUpdateCoreValue(idx, e.target.value)}
                        placeholder="Enter core value (e.g., Discipline)..."
                        className="w-full text-xs font-semibold text-stone-800 border-none focus:outline-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCoreValue(idx)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors shrink-0 cursor-pointer"
                        title="Remove core value"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#14532d] hover:bg-[#0b331c] text-white font-bold rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Update School Identity</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: BRIEF HISTORY NARRATIVE EDITOR */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-yellow-900 uppercase tracking-widest">
                  Historical Chronicle Administration
                </span>
                <h2 className="font-heading text-lg font-bold text-stone-900 mt-0.5">
                  Brief History Narrative Paragraphs
                </h2>
                <p className="text-xs text-stone-500">
                  Edit or add narrative paragraphs displayed in the Brief History section on the Home and History pages.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetHistory}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default History</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <span>View History Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {historyForm.map((paragraph, idx) => (
                <div key={idx} className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#14532d] uppercase">
                      Paragraph {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHistoryParagraph(idx)}
                      className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={paragraph}
                    onChange={(e) => handleHistoryParagraphChange(idx, e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-[#14532d]"
                  />
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleAddHistoryParagraph}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold cursor-pointer border border-stone-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Paragraph</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateSchoolInfo({ briefHistory: historyForm });
                    showToast('History paragraphs saved live!');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#14532d] hover:bg-[#0b331c] text-white font-bold rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save History Narrative</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: STUDENTS RESULTS MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <span className="text-xs font-bold text-yellow-900 uppercase tracking-widest">
                  Academic Registry Administration
                </span>
                <h2 className="font-heading text-lg font-bold text-stone-900 mt-1">
                  Students Terminal Examination Results Database
                </h2>
                <p className="text-xs text-stone-500">
                  Create, review, update student marks, view terminal report slips, or print official report sheets.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!isAddingStudent) {
                      const defaultAdmYear = getYearCameToSchool('Form 1', '2024/2025');
                      const uniqueIdx = generateUniqueIndexNumber(students, defaultAdmYear);
                      const defaultProg = 'Science';
                      const arms = getClassesForCourse(defaultProg, courseConfigs);
                      const defaultArm = arms[0] || 'Science 1';
                      const fullCls = formatFullClass('Form 1', defaultArm);
                      setNewStudent({
                        indexNumber: uniqueIdx,
                        admissionYear: defaultAdmYear,
                        studentName: '',
                        gender: 'Male',
                        program: defaultProg as any,
                        formLevel: 'Form 1',
                        semester: 'Semester 1',
                        classArm: defaultArm,
                        classForm: fullCls,
                        academicYear: '2024/2025',
                        term: 'Semester 1',
                        house: 'Royal House',
                                                positionInClass: '1st',
                        totalStudentsInClass: 45,
                        conductRemarks: 'Exemplary conduct and dedication.',
                        headTeacherRemarks: 'Continue seizing every golden opportunity.',
                        promotedToNextClass: true,
                        publishedDate: new Date().toISOString().split('T')[0],
                        aggregate: 7,
                        gpa: 3.9,
                        subjects: [
                          { id: 'eng', name: 'English Language', isCore: true, midsemScore: 18, portfolioScore: 9, individualProjectScore: 9, groupProjectScore: 9, examScore: 45, classScore: 45, totalScore: 90, grade: 'A1', interpretation: 'Excellent', remarks: 'Superb grammar' },
                          { id: 'math', name: 'General Mathematics', isCore: true, midsemScore: 19, portfolioScore: 9, individualProjectScore: 9, groupProjectScore: 10, examScore: 47, classScore: 47, totalScore: 94, grade: 'A1', interpretation: 'Excellent', remarks: 'Exceptional calculation skills' },
                          { id: 'soc', name: 'Social Studies', isCore: true, midsemScore: 16, portfolioScore: 8, individualProjectScore: 9, groupProjectScore: 8, examScore: 43, classScore: 41, totalScore: 84, grade: 'A1', interpretation: 'Excellent', remarks: 'Good analytical skills' },
                          { id: 'elec1', name: 'Physics', isCore: false, midsemScore: 18, portfolioScore: 9, individualProjectScore: 9, groupProjectScore: 9, examScore: 46, classScore: 45, totalScore: 91, grade: 'A1', interpretation: 'Excellent', remarks: 'Solid mastery' }
                        ]
                      });
                    }
                    setIsAddingStudent(!isAddingStudent);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingStudent ? 'Close Form' : 'Register New Student Result'}</span>
                </button>
              </div>
            </div>

            {/* Student Registration Form with Auto-Generated Unique Index and Synchronized Class */}
            {isAddingStudent && (
              <div className="bg-stone-50 p-6 rounded-2xl border-2 border-[#14532d]/30 space-y-5">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-heading text-sm font-bold text-stone-900">
                      New Student Result Enrollment
                    </h3>
                  </div>
                  <span className="text-[11px] bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full">
                    Auto-Generated Unique Index Number Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Year Student Came to School (Admission Year) */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Year Came to School *
                    </label>
                    <input
                      type="text"
                      required
                      value={newStudent.admissionYear || getYearCameToSchool(newStudent.formLevel || 'Form 1', newStudent.academicYear || '2024/2025')}
                      onChange={(e) => {
                        const newYear = e.target.value.trim();
                        const nextIdx = generateUniqueIndexNumber(students, newYear || '2025');
                        setNewStudent(prev => ({
                          ...prev,
                          admissionYear: newYear,
                          indexNumber: nextIdx
                        }));
                        showToast(`Index number year updated to ${newYear}: ${nextIdx}`);
                      }}
                      placeholder="e.g. 2027, 2028, 2030..."
                      className="w-full p-2 border border-stone-300 rounded-lg text-xs font-bold bg-yellow-50/50 focus:outline-none focus:border-[#14532d]"
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Enter any year student came to school. Attached to index (GHS/<strong>{newStudent.admissionYear || '2025'}</strong>/...).
                    </p>
                  </div>

                  {/* Auto-Generated Unique Index Number */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-stone-700">Index Number *</label>
                      <span className="text-[10px] text-emerald-700 font-bold">Unique</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={newStudent.indexNumber || ''}
                        onChange={(e) => setNewStudent({ ...newStudent, indexNumber: e.target.value })}
                        className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-emerald-50/40 font-mono font-bold text-[#14532d] focus:outline-none focus:border-[#14532d]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const targetYear = newStudent.admissionYear || getYearCameToSchool(newStudent.formLevel || 'Form 1', newStudent.academicYear || '2024/2025');
                          const nextIdx = generateUniqueIndexNumber(students, targetYear);
                          setNewStudent(prev => ({ ...prev, indexNumber: nextIdx }));
                          showToast(`Generated next unique index for ${targetYear}: ${nextIdx}`);
                        }}
                        className="px-2.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                        title="Generate next available unique index number"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {!isIndexNumberUnique(newStudent.indexNumber || '', null, students) && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">
                        ⚠️ Index is already in use by another student!
                      </p>
                    )}
                  </div>

                  {/* Student Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel Mensah"
                      value={newStudent.studentName || ''}
                      onChange={(e) => setNewStudent({ ...newStudent, studentName: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#14532d]"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Gender *</label>
                    <select
                      value={newStudent.gender || 'Male'}
                      onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as any })}
                      className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#14532d]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  {/* Course / Program */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Course / Program *</label>
                    <select
                      value={newStudent.program || 'Science'}
                      onChange={(e) => {
                        const prog = e.target.value as any;
                        const arms = getClassesForCourse(prog, courseConfigs);
                        const defaultArm = arms[0] || '1';
                        const fullCls = formatFullClass(newStudent.formLevel || 'Form 1', defaultArm);
                        setNewStudent({
                          ...newStudent,
                          program: prog,
                          classArm: defaultArm,
                          classForm: fullCls
                        });
                      }}
                      className="w-full p-2 border-2 border-yellow-400 rounded-lg text-xs font-bold bg-white focus:outline-none focus:border-[#14532d]"
                    >
                      <option value="General Art">General Art (GArt 1 - 15)</option>
                      <option value="Visual Art">Visual Art (V Art 1 - 5)</option>
                      <option value="Business">Business (B1 - B5)</option>
                      <option value="Home Economics">Home Economics (H1 - H5)</option>
                      <option value="Agric">Agric (Agric 1 - 3)</option>
                      <option value="Science">Science (Science 1 - 6)</option>
                    </select>
                  </div>

                  {/* School Form Level */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">School Form Level *</label>
                    <select
                      value={newStudent.formLevel || 'Form 1'}
                      onChange={(e) => {
                        const lvl = e.target.value as any;
                        const fullCls = formatFullClass(lvl, newStudent.classArm || '1');
                        setNewStudent({
                          ...newStudent,
                          formLevel: lvl,
                          classForm: fullCls
                        });
                      }}
                      className="w-full p-2 border border-stone-300 rounded-lg text-xs font-bold bg-white focus:outline-none focus:border-[#14532d]"
                    >
                      <option value="Form 1">Form 1</option>
                      <option value="Form 2">Form 2</option>
                      <option value="Form 3">Form 3</option>
                    </select>
                  </div>

                  {/* Class Arm (Corresponds to Program) */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Class Arm ({newStudent.program || 'Science'}) *
                    </label>
                    <select
                      value={newStudent.classArm || ''}
                      onChange={(e) => {
                        const arm = e.target.value;
                        const fullCls = formatFullClass(newStudent.formLevel || 'Form 1', arm);
                        setNewStudent({
                          ...newStudent,
                          classArm: arm,
                          classForm: fullCls
                        });
                      }}
                      className="w-full p-2 border border-stone-300 rounded-lg text-xs font-mono font-bold text-[#14532d] bg-white focus:outline-none focus:border-[#14532d]"
                    >
                      {getClassesForCourse(newStudent.program || 'Science', courseConfigs).map(arm => (
                        <option key={arm} value={arm}>{arm}</option>
                      ))}
                    </select>
                  </div>

                  {/* Full Class Designation (Synchronized) */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                      <span>Full Class Designation</span>
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                        Form Level & Course Arm Synchronized
                      </span>
                    </label>
                    <div className="w-full p-2.5 border-2 border-[#14532d] rounded-lg bg-emerald-50/60 font-mono font-extrabold text-sm text-[#14532d] flex items-center justify-between">
                      <span>{newStudent.classForm || formatFullClass(newStudent.formLevel || 'Form 1', newStudent.classArm || 'Science 1')}</span>
                      <span className="text-xs font-sans font-normal text-stone-500">
                        Course: {newStudent.program}
                      </span>
                    </div>
                  </div>

                  {/* House */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">House</label>
                    <select
                      value={newStudent.house || 'Royal House'}
                      onChange={(e) => setNewStudent({ ...newStudent, house: e.target.value as any })}
                      className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#14532d]"
                    >
                      <option value="Modesty House">Modesty House (Red)</option>
                      <option value="Unity House">Unity House (Blue)</option>
                      <option value="Fraternity House">Fraternity House (Yellow)</option>
                      <option value="Royal House">Royal House (Green)</option>
                      <option value="Integrity House">Integrity House (Purple)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={async () => {
                      if (!newStudent.studentName?.trim()) {
                        alert('Student Full Name is required.');
                        return;
                      }

                      // Ensure unique index number
                      let finalIdx = newStudent.indexNumber?.trim();
                      if (!finalIdx) {
                        finalIdx = generateUniqueIndexNumber(students, newStudent.academicYear || '2025');
                      } else if (!isIndexNumberUnique(finalIdx, null, students)) {
                        finalIdx = generateUniqueIndexNumber(students, newStudent.academicYear || '2025');
                        alert(`Index was already assigned! Automatically updated to next unique index: ${finalIdx}`);
                      }

                      const finalFullClass = formatFullClass(newStudent.formLevel || 'Form 1', newStudent.classArm || 'Science 1');
                      const id = `std-${Date.now()}`;
                      
                      const studentRecord: StudentResult = {
                        ...(newStudent as StudentResult),
                        id,
                        indexNumber: finalIdx,
                        classForm: finalFullClass
                      };

                      const posInfo = calculateStudentPositionInClass(studentRecord, students);
                      studentRecord.positionInClass = posInfo.position;
                      studentRecord.totalStudentsInClass = posInfo.totalInClass;

                      addStudentResult(studentRecord);
                      setIsAddingStudent(false);
                      await syncToFirebaseAccount();
                      showToast(`Successfully registered "${studentRecord.studentName}" with Unique Index: ${studentRecord.indexNumber} (Rank: ${studentRecord.positionInClass} in ${studentRecord.classForm})!`);
                    }}
                    className="px-6 py-2.5 bg-[#14532d] hover:bg-[#0b331c] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4 text-yellow-400" />
                    <span>Save & Enroll Student Result</span>
                  </button>
                </div>
              </div>
            )}

            {/* Students Table */}
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                    <th className="p-3">Index Number</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Program</th>
                    <th className="p-3">Class</th>
                    <th className="p-3 text-center">Aggregate</th>
                    <th className="p-3 text-center">Position</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#14532d]">
                        {st.indexNumber}
                      </td>
                      <td className="p-3 font-semibold text-stone-900">
                        {st.studentName}
                      </td>
                      <td className="p-3 text-stone-600">
                        {st.program}
                      </td>
                      <td className="p-3 text-stone-600">
                        {st.classForm}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-yellow-900">
                        {st.aggregate}
                      </td>
                      <td className="p-3 text-center font-semibold text-emerald-800">
                        {st.positionInClass}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setActiveResultStudentId(st.id);
                              setActiveTab('results');
                              setTimeout(() => {
                                window.print();
                              }, 250);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded transition-colors text-[11px] font-semibold cursor-pointer"
                            title="Print student terminal report slip"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Print</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveResultStudentId(st.id);
                              setActiveTab('results');
                            }}
                            className="px-2 py-1 bg-stone-100 hover:bg-[#14532d] hover:text-white text-stone-700 rounded transition-colors text-[11px] font-semibold cursor-pointer"
                          >
                            View Slip
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(`Delete record for ${st.studentName}?`)) {
                                deleteStudentResult(st.id);
                                await syncToFirebaseAccount();
                                showToast(`Deleted result record for ${st.studentName}`);
                              }
                            }}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Delete result"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 8: PTA NOTICES MANAGEMENT */}
        {activeTab === 'pta-manager' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <span className="text-xs font-bold text-yellow-900 uppercase tracking-widest">
                    Parent-Teacher Association Portal
                  </span>
                  <h2 className="font-heading text-lg font-bold text-stone-900 mt-1">
                    Post New Official PTA Announcement
                  </h2>
                  <p className="text-xs text-stone-500">
                    Announcements published here display immediately on the public PTA Portal for parents and guardians.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('pta')}
                  className="inline-flex items-center gap-1 text-xs text-[#14532d] font-bold hover:underline"
                >
                  <span>Open Public PTA Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handlePostPtaNotice} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-700 mb-1">
                      Announcement Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newNotice.title}
                      onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                      placeholder="e.g. 2025 Annual General Meeting & Campus Infrastructure Levy"
                      className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:border-[#14532d]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newNotice.category}
                      onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value as any })}
                      className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                    >
                      <option value="General Meeting">General Meeting</option>
                      <option value="Dues & Levies">Dues & Levies</option>
                      <option value="Academic Welfare">Academic Welfare</option>
                      <option value="Special Notice">Special Notice</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={newNotice.date}
                      onChange={(e) => setNewNotice({ ...newNotice, date: e.target.value })}
                      className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Priority</label>
                    <select
                      value={newNotice.priority}
                      onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value as any })}
                      className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Important">Important</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Venue</label>
                    <input
                      type="text"
                      value={newNotice.venue}
                      onChange={(e) => setNewNotice({ ...newNotice, venue: e.target.value })}
                      className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Time</label>
                    <input
                      type="text"
                      value={newNotice.time}
                      onChange={(e) => setNewNotice({ ...newNotice, time: e.target.value })}
                      className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Quick 1-Line Summary
                  </label>
                  <input
                    type="text"
                    value={newNotice.summary}
                    onChange={(e) => setNewNotice({ ...newNotice, summary: e.target.value })}
                    placeholder="Brief excerpt displayed on cards..."
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Announcement Content & Agenda *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    placeholder="Provide full text, numbered agenda items, or directions for parents..."
                    className="w-full p-3 text-xs sm:text-sm border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:border-[#14532d]"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#14532d] hover:bg-[#0b331c] text-white font-bold rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post PTA Announcement Live</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Notices with Delete */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
              <div className="border-b border-stone-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-base font-bold text-stone-900">
                    Existing PTA Announcements ({ptaNotices.length})
                  </h3>
                  <p className="text-xs text-stone-500">
                    Manage, edit, or clear all official PTA announcements and security postings.
                  </p>
                </div>
                {ptaNotices.length > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to clear ALL PTA announcements and reset PTA security notices? This will remove all existing postings from the public PTA page.')) {
                        clearAllPtaNotices();
                        await syncToFirebaseAccount();
                        showToast('Cleared all PTA announcements and reset PTA security records live!');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-bold transition-colors cursor-pointer w-fit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All PTA Notices & Security</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                      <th className="p-3">Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Venue / Time</th>
                      <th className="p-3 text-right">Delete Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {ptaNotices.map((n) => (
                      <tr key={n.id} className="hover:bg-amber-50/40">
                        <td className="p-3 font-semibold text-stone-900">
                          {n.title}
                        </td>
                        <td className="p-3 text-stone-600">
                          {n.category}
                        </td>
                        <td className="p-3 font-mono text-stone-500">
                          {n.date}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            n.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : n.priority === 'Important'
                              ? 'bg-yellow-100 text-yellow-900'
                              : 'bg-stone-100 text-stone-700'
                          }`}>
                            {n.priority}
                          </span>
                        </td>
                        <td className="p-3 text-stone-500 text-[11px]">
                          {n.venue || n.time || 'General Notice'}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeletePtaNotice(n.id, n.title)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded text-xs font-semibold transition-colors cursor-pointer"
                            title="Delete this PTA announcement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {ptaNotices.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-stone-400">
                          No PTA announcements currently posted.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: TEACHER MODE PASSWORD CONFIGURATION */}
        {activeTab === 'teacher-password' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6 max-w-3xl">
            <div className="border-b border-stone-200 pb-4">
              <span className="text-xs font-bold text-yellow-900 uppercase tracking-widest">
                Security Administration
              </span>
              <h2 className="font-heading text-xl font-bold text-stone-900 mt-1">
                Teacher Mode Password Configuration
              </h2>
              <p className="text-xs text-stone-500">
                Developer can change the password for Teacher Mode. Teachers require this password to input marks, scores, and student names.
              </p>
            </div>

            <form onSubmit={handleSaveTeacherPassword} className="space-y-5">
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-stone-500 block">Current Active Teacher Password:</span>
                  <span className="text-base font-mono font-bold text-[#14532d]">{teacherPassword}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateTeacherPassword('CarpeDiem1936');
                    setNewTeacherPw('CarpeDiem1936');
                    showToast('Teacher password reset to initial "CarpeDiem1936"');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 cursor-pointer"
                >
                  Reset to "CarpeDiem1936"
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Set New Password for Teachers:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={newTeacherPw}
                    onChange={(e) => setNewTeacherPw(e.target.value)}
                    placeholder="Enter new teacher password..."
                    className="w-full px-4 py-3 pl-10 text-sm font-mono border-2 border-stone-300 rounded-xl focus:outline-none focus:border-[#14532d] bg-stone-50"
                  />
                  <Key className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  Teachers will immediately need this new password to access the marks entry desk.
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('teacher')}
                  className="text-xs text-[#14532d] font-bold hover:underline flex items-center gap-1"
                >
                  <span>Test Teacher Portal Login</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#14532d] hover:bg-[#0b331c] text-white font-bold rounded-xl text-sm shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Teacher Password</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 10: SUPABASE PRIMARY CLOUD DATABASE */}
        {activeTab === 'supabase-sync' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-2.5 py-0.5 rounded-md">
                    Primary Cloud Storage
                  </span>
                  <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                    PostgreSQL Database
                  </span>
                </div>
                <h2 className="font-heading text-lg sm:text-xl font-bold text-stone-900">
                  Supabase Cloud Storage & Real-Time Sync
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Supabase is configured as the primary cloud database for Ghanata Senior High School. All school metadata, student results, founder/headteacher portraits, audio fanfares, and class configurations are persisted to your PostgreSQL tables.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                  getSupabaseConfig().isConfigured 
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${getSupabaseConfig().isConfigured ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
                  <span>{getSupabaseConfig().isConfigured ? 'Supabase Connected' : 'Configuration Required'}</span>
                </span>
              </div>
            </div>

            {/* Supabase Connection Setup Form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
                alert('Please enter both your Supabase Project URL and Anon Public Key.');
                return;
              }
              setSupabaseConfig(supabaseUrlInput.trim(), supabaseKeyInput.trim());
              setIsTestingSupabase(true);
              setSupabaseTestResult(null);
              const res = await testSupabaseConnection();
              setIsTestingSupabase(false);
              setSupabaseTestResult(res);
              if (res.success) {
                showToast('Supabase successfully verified and set as Primary Storage!');
                await syncToFirebaseAccount();
              }
            }} className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-stone-900 text-sm">
                  Supabase Cloud Credentials (Saved in Browser & Live Active)
                </h3>
                <span className="text-[11px] text-stone-500">
                  Project: <strong className="font-mono text-emerald-800">wgizaplbphqmulqgylzx</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Supabase Project URL:
                  </label>
                  <input
                    type="url"
                    required
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-[#14532d]"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">Found under Supabase Dashboard &gt; Project Settings &gt; API</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Supabase Anon Public API Key:
                  </label>
                  <input
                    type="password"
                    required
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-[#14532d]"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">Found under Project Settings &gt; API &gt; Project API keys</p>
                </div>
              </div>

              {supabaseTestResult && (
                <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
                  supabaseTestResult.success 
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}>
                  {supabaseTestResult.success ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{supabaseTestResult.message}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isTestingSupabase}
                  className="px-5 py-2.5 bg-[#14532d] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-yellow-400" />
                  <span>{isTestingSupabase ? 'Testing & Saving...' : 'Save & Verify Supabase Primary Storage'}</span>
                </button>

                <button
                  type="button"
                  disabled={isTestingSupabase}
                  onClick={async () => {
                    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
                      alert('Please provide Supabase Project URL and Anon Key first.');
                      return;
                    }
                    setSupabaseConfig(supabaseUrlInput.trim(), supabaseKeyInput.trim());
                    setIsTestingSupabase(true);
                    setSupabaseTestResult(null);
                    const res = await testSupabaseConnection();
                    setIsTestingSupabase(false);
                    setSupabaseTestResult(res);
                  }}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Test Connection Only</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const ok = await syncToFirebaseAccount();
                    if (ok) {
                      showToast('Successfully pushed all records, students, portraits and audio to Supabase Primary Cloud Database!');
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Sync All Records to Supabase Now</span>
                </button>
              </div>
            </form>

            {/* SQL Table Initialization Schema */}
            <div className="bg-stone-900 text-white rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-yellow-400">
                    Supabase PostgreSQL Tables Setup (Run in Supabase SQL Editor)
                  </h4>
                  <p className="text-xs text-stone-400">
                    If this is a new Supabase project, copy and run this SQL query once to create the required tables.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-yellow-300 border border-stone-700 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
                >
                  {copiedSql ? '✓ Copied SQL!' : 'Copy SQL Schema'}
                </button>
              </div>

              <pre className="bg-stone-950 p-4 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48 border border-stone-800">
                {SUPABASE_SETUP_SQL}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 11: FIREBASE SECONDARY BACKUP */}
        {activeTab === 'firebase-sync' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                Secondary Cloud Backup
              </span>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-stone-900 mt-0.5">
                Firebase Firestore Backup (philipophitial1@gmail.com)
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Secondary backup storage. Primary writes are automatically routed to your Supabase PostgreSQL cloud database.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  🔥
                </div>
                <div>
                  <h3 className="font-heading font-bold text-stone-900 text-sm">
                    Firebase Cloud Firestore (Secondary)
                  </h3>
                  <p className="text-xs text-stone-600">
                    Account: <strong className="font-mono">philipophitial1@gmail.com</strong> (Project ID: melodic-cocoa-22ts5)
                  </p>
                </div>
              </div>

              {firebaseSyncStatus && (
                <div className="bg-white border border-stone-300 rounded-lg p-3 text-xs text-stone-800 font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{firebaseSyncStatus}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: COURSES & CLASSES MANAGER */}
        {activeTab === 'courses-classes' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-8">
            <div className="border-b border-stone-200 pb-4">
              <span className="text-xs font-bold text-yellow-900 uppercase tracking-widest">
                Academic Structure & Programs
              </span>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-stone-900 mt-0.5">
                Courses & Classes Real-Time Manager
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Admin can add new courses (programs) with customized core and elective subjects, as well as new classes for any program. Changes manifest across the website instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Add New Course (Program) Form */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#14532d] text-white flex items-center justify-center font-bold">
                    +
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-stone-900 text-sm">
                      Add New Course / Program
                    </h3>
                    <p className="text-xs text-stone-500">Create a brand new academic program</p>
                  </div>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCourseName.trim()) {
                    alert('Please enter a course name.');
                    return;
                  }
                  const cores = newCourseCoreSubjects.split(',').map(s => s.trim()).filter(Boolean);
                  const electives = newCourseElectives.split(',').map(s => s.trim()).filter(Boolean);
                  const cls = newCourseFirstClass.trim() ? [newCourseFirstClass.trim()] : [`${newCourseName.trim()} 1`];
                  const courseKey = newCourseName.trim().toLowerCase().replace(/\s+/g, '-');
                  addCourse(courseKey, {
                    name: newCourseName.trim(),
                    classes: cls,
                    classCount: cls.length,
                    coreSubjects: cores.length > 0 ? cores : ['Social Studies', 'General Science', 'General Mathematics', 'English Language'],
                    defaultElectives: electives.length > 0 ? electives : ['Elective 1', 'Elective 2']
                  });
                  setNewCourseName('');
                  setNewCourseFirstClass('');
                  showToast(`Successfully created new course "${newCourseName.trim()}" live!`);
                }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Course / Program Name:
                    </label>
                    <input
                      type="text"
                      required
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      placeholder="e.g. Information Technology, Technical, Hospitality"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-[#14532d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Core Subjects (comma separated):
                    </label>
                    <input
                      type="text"
                      value={newCourseCoreSubjects}
                      onChange={(e) => setNewCourseCoreSubjects(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-[#14532d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Default Electives (comma separated):
                    </label>
                    <input
                      type="text"
                      value={newCourseElectives}
                      onChange={(e) => setNewCourseElectives(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-[#14532d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Initial Class Name:
                    </label>
                    <input
                      type="text"
                      value={newCourseFirstClass}
                      onChange={(e) => setNewCourseFirstClass(e.target.value)}
                      placeholder="e.g. IT 1 (defaults to Course 1)"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-[#14532d]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#14532d] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Course Live</span>
                  </button>
                </form>
              </div>

              {/* Add New Class to Course Form */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                    +
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-stone-900 text-sm">
                      Add New Class to Existing Course
                    </h3>
                    <p className="text-xs text-stone-500">Expand class capacity for any program</p>
                  </div>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedProgramForClass || !newClassName.trim()) {
                    alert('Please select a course and enter a class name.');
                    return;
                  }
                  addClassToCourse(selectedProgramForClass, newClassName.trim());
                  setNewClassName('');
                  showToast(`Successfully added class "${newClassName.trim()}" to ${selectedProgramForClass}!`);
                }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Select Course / Program:
                    </label>
                    <select
                      value={selectedProgramForClass}
                      onChange={(e) => setSelectedProgramForClass(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-[#14532d]"
                    >
                      {Object.keys(courseConfigs).map(prog => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      New Class Name:
                    </label>
                    <input
                      type="text"
                      required
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="e.g. Science 7, B 6, IT 2"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-[#14532d]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Class to Course Live</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Current Active Courses & Classes Table/Grid */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <h3 className="font-heading font-bold text-stone-900 text-sm">
                Active Courses & Associated Classes Overview ({Object.keys(courseConfigs).length} Programs)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(courseConfigs).map(([progName, config]) => (
                  <div key={progName} className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-stone-900 text-sm">
                        {progName}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          {config.classes.length} Classes
                        </span>
                        {schoolInfo.customCourseConfigs?.[progName] && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete custom course "${progName}"?`)) {
                                deleteCourse(progName);
                                showToast(`Deleted course ${progName}`);
                              }
                            }}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete custom course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-600">
                      <div className="font-medium text-stone-700">Classes:</div>
                      <div className="flex flex-wrap gap-1">
                        {config.classes.map(c => (
                          <span key={c} className="inline-flex items-center gap-1 bg-white border border-stone-200 px-2 py-0.5 rounded text-[11px] font-mono text-stone-800 shadow-2xs">
                            <span>{c}</span>
                            <button
                              onClick={() => deleteClassFromCourse(progName, c)}
                              className="text-stone-400 hover:text-rose-600 font-bold ml-1"
                              title={`Remove class ${c}`}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-500 space-y-1">
                      <div><strong className="text-stone-700">Cores:</strong> {config.coreSubjects.join(', ')}</div>
                      <div><strong className="text-stone-700">Electives:</strong> {config.defaultElectives.join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 13: BATCH PROMOTION & ALUMNI ARCHIVE SYSTEM */}
        {activeTab === 'batch-promotions' && (
          <div className="space-y-8">
            {/* Header & Overview Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-900 mb-1">
                    <GraduationCap className="w-3.5 h-3.5 text-yellow-700" />
                    <span>Automated Academic Transition Protocol</span>
                  </div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-stone-900">
                    Academic Year Batch Promotion & Alumni Archive Manager
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    When an academic year or batch completes, student records automatically transition according to official Ghanata SHS rules.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('results')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer w-fit"
                >
                  <Eye className="w-3.5 h-3.5 text-yellow-400" />
                  <span>View Public Results Page</span>
                </button>
              </div>

              {/* Live Batch Transition Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Active Form 1 Students
                  </span>
                  <div className="text-2xl font-extrabold text-[#14532d] font-mono">
                    {students.filter(s => !s.isArchived && s.formLevel === 'Form 1').length}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Will advance to <strong>Form 2</strong>
                  </p>
                </div>

                <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                    Active Form 2 Students
                  </span>
                  <div className="text-2xl font-extrabold text-blue-900 font-mono">
                    {students.filter(s => !s.isArchived && s.formLevel === 'Form 2').length}
                  </div>
                  <p className="text-[11px] text-blue-700 font-medium">
                    Will advance to <strong>Form 3</strong>
                  </p>
                </div>

                <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                    Active Form 3 Students
                  </span>
                  <div className="text-2xl font-extrabold text-amber-900 font-mono">
                    {students.filter(s => !s.isArchived && s.formLevel === 'Form 3').length}
                  </div>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Will <strong>Graduate & Move to Archive</strong>
                  </p>
                </div>

                <div className="bg-stone-100 border border-stone-300 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                    Graduated Alumni in Archive
                  </span>
                  <div className="text-2xl font-extrabold text-stone-900 font-mono">
                    {students.filter(s => s.isArchived || s.status === 'Graduated').length}
                  </div>
                  <p className="text-[11px] text-stone-600 font-medium">
                    Historical completed records stored
                  </p>
                </div>
              </div>
            </div>

            {/* Execute Promotion Action Box */}
            <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 border border-stone-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-400 text-stone-950 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Annual Batch Promotion Execution</span>
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-white">
                    Promote All Batches to Next Academic Year
                  </h3>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Advances Form 1 & Form 2 students to their next form, and automatically moves Form 3 graduates into the Alumni Archive.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-yellow-300 mb-1">
                      New Academic Session:
                    </label>
                    <input
                      type="text"
                      value={nextAcademicYearInput}
                      onChange={(e) => setNextAcademicYearInput(e.target.value)}
                      placeholder="2025/2026"
                      className="px-3 py-1.5 bg-stone-800 text-white border border-stone-700 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const form3Count = students.filter(s => !s.isArchived && s.formLevel === 'Form 3').length;
                      const activeCount = students.filter(s => !s.isArchived && (s.formLevel === 'Form 1' || s.formLevel === 'Form 2')).length;

                      if (window.confirm(`Execute Annual Academic Transition for ${nextAcademicYearInput} Session?\n\n- ${activeCount} students (Form 1 & Form 2) will advance to their next form.\n- ${form3Count} Form 3 students will complete senior high school and move to the Archived Alumni Registry tagged with year completed.\n\nContinue?`)) {
                        const result = promoteAllBatches(nextAcademicYearInput);
                        await syncToFirebaseAccount();
                        showToast(`Academic Year Transition Complete! Promoted ${result.promoted} students and archived ${result.archived} Form 3 graduates to the Alumni Registry for ${nextAcademicYearInput}.`);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-extrabold rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg active:scale-95 shrink-0"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Execute Batch Promotion</span>
                  </button>
                </div>
              </div>

              <div className="bg-stone-800/80 rounded-xl p-4 border border-stone-700 text-xs text-stone-300 space-y-2">
                <div className="font-bold text-yellow-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Rule Execution Summary:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-stone-300 text-[11px]">
                  <li><strong>Form 1 students</strong> automatically advance to <strong>Form 2</strong> (`{nextAcademicYearInput}`).</li>
                  <li><strong>Form 2 students</strong> automatically advance to <strong>Form 3</strong> (`{nextAcademicYearInput}`).</li>
                  <li><strong>Form 3 students</strong> complete senior high school: moved to <strong>Archived Alumni Registry</strong> tagged with <strong>Year Completed</strong> and issued a permanent Alumni Transcript badge.</li>
                  <li>All changes synchronize in real time to Supabase Primary Cloud & Firebase Secondary Backup.</li>
                </ul>
              </div>
            </div>

            {/* Archived & Graduated Alumni Registry Table */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
              <div className="border-b border-stone-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-widest bg-amber-100 px-2.5 py-0.5 rounded-full mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                    <span>Archived & Graduated Alumni Registry</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-stone-900">
                    Graduated Batch Records ({students.filter(s => s.isArchived || s.status === 'Graduated').length})
                  </h3>
                  <p className="text-xs text-stone-500">
                    Students who completed senior high school are archived here with their completion year recorded.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                      <th className="p-3">Index Number</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Course / Program</th>
                      <th className="p-3 text-center">Batch Completed</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {students
                      .filter(s => s.isArchived || s.status === 'Graduated')
                      .map((st) => (
                        <tr key={st.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="p-3 font-mono font-bold text-[#14532d]">
                            {st.indexNumber}
                          </td>
                          <td className="p-3 font-semibold text-stone-900">
                            {st.studentName}
                          </td>
                          <td className="p-3 text-stone-600">
                            {st.program}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-yellow-900">
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[11px]">
                              {st.yearCompleted || st.academicYear || 'Graduated'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                              Graduated Alumni
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setActiveResultStudentId(st.id);
                                  setActiveTab('results');
                                }}
                                className="px-2.5 py-1 bg-[#14532d] text-white hover:bg-[#0b331c] rounded transition-colors text-[11px] font-bold cursor-pointer"
                              >
                                View Transcript
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Un-archive record for ${st.studentName} and move back to active student roster?`)) {
                                    updateStudentResult(st.id, { isArchived: false, status: 'Active' });
                                    await syncToFirebaseAccount();
                                    showToast(`Restored ${st.studentName} to active student list.`);
                                  }
                                }}
                                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded text-[11px] font-medium cursor-pointer"
                                title="Unarchive student"
                              >
                                Restore
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                    {students.filter(s => s.isArchived || s.status === 'Graduated').length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-stone-400">
                          <GraduationCap className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                          <p className="font-bold text-stone-700">No Archived Alumni Records Yet</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            When Form 3 batches graduate using "Execute Batch Promotion", their completed terminal records will appear here.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
