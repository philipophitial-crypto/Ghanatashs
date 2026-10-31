import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  SchoolInformation as SchoolInfo, 
  FounderProfile, 
  HeadTeacherProfile, 
  StudentResult, 
  PtaNotice, 
  CourseConfig 
} from '../types';
import { 
  DEFAULT_SCHOOL_INFO, 
  DEFAULT_FOUNDER, 
  DEFAULT_HEADTEACHER, 
  INITIAL_STUDENTS, 
  DEFAULT_PTA_NOTICES, 
  DEFAULT_TEACHER_PASSWORD,
  COURSE_CONFIGS 
} from '../data/defaultData';
import { saveSchoolDataToFirebase, loadSchoolDataFromFirebase, subscribeToSchoolData, getIsQuotaExhausted } from '../services/firebaseClient';
import { 
  saveSchoolDataToSupabase, 
  loadSchoolDataFromSupabase, 
  subscribeToSchoolDataSupabase, 
  getSupabaseConfig,
  deleteStudentFromSupabase,
  saveSingleStudentToSupabase
} from '../services/supabaseClient';
import { calculateClassPositions, formatFullClass } from '../utils/studentUtils';

interface SchoolContextType {
  schoolInfo: SchoolInfo;
  updateSchoolInfo: (info: Partial<SchoolInfo>) => void;
  founder: FounderProfile;
  updateFounder: (profile: Partial<FounderProfile>) => void;
  headTeacher: HeadTeacherProfile;
  updateHeadTeacher: (profile: Partial<HeadTeacherProfile>) => void;
  students: StudentResult[];
  addStudentResult: (student: StudentResult) => void;
  updateStudentResult: (id: string, updated: Partial<StudentResult>) => void;
  deleteStudentResult: (id: string) => void;
  ptaNotices: PtaNotice[];
  addPtaNotice: (notice: PtaNotice) => void;
  deletePtaNotice: (id: string) => void;
  clearAllPtaNotices: () => void;
  teacherPassword: string;
  updateTeacherPassword: (pw: string) => void;
  isTeacherAuthenticated: boolean;
  loginTeacher: (pw: string) => boolean;
  logoutTeacher: () => void;
  isDevAuthenticated: boolean;
  loginDev: (pw: string) => boolean;
  logoutDev: () => void;
  resetAllToDefaults: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeResultStudentId: string | null;
  setActiveResultStudentId: (id: string | null) => void;
  firebaseSyncStatus: string | null;
  syncToFirebaseAccount: (override?: {
    schoolInfo?: Partial<SchoolInfo>;
    founder?: Partial<FounderProfile>;
    headTeacher?: Partial<HeadTeacherProfile>;
    students?: StudentResult[];
    ptaNotices?: PtaNotice[];
    courseConfigs?: Record<string, CourseConfig>;
  }) => Promise<boolean>;
  promoteAllBatches: (nextAcademicYear?: string) => { promoted: number; archived: number };
  courseConfigs: Record<string, CourseConfig>;
  addCourse: (courseKey: string, config: CourseConfig) => void;
  deleteCourse: (courseKey: string) => void;
  addClassToCourse: (courseKey: string, className: string) => void;
  removeClassFromCourse: (courseKey: string, className: string) => void;
  deleteClassFromCourse: (courseKey: string, className: string) => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SCHOOL_INFO: 'ghanata_school_info_v4',
  FOUNDER: 'ghanata_founder_v4',
  HEADTEACHER: 'ghanata_headteacher_v4',
  STUDENTS: 'ghanata_students_v4',
  PTA_NOTICES: 'ghanata_pta_notices_v4',
  TEACHER_PW: 'ghanata_teacher_pw_v4',
  DEV_AUTH: 'ghanata_dev_auth_v4',
  COURSES: 'ghanata_courses_v4'
};

function sanitizeSchoolInfo(info: Partial<SchoolInfo> | undefined): Partial<SchoolInfo> | undefined {
  if (!info) return info;
  let vision = info.vision;
  let mission = info.mission;

  if (!vision || vision.includes('premier center') || vision.includes('intellectual rigor')) {
    vision = DEFAULT_SCHOOL_INFO.vision;
  }

  if (!mission || mission.includes('mentorship') || mission.includes('holistic secondary education')) {
    mission = DEFAULT_SCHOOL_INFO.mission;
  }

  return {
    ...info,
    vision,
    mission
  };
}

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHOOL_INFO);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.anthem || !parsed.anthem.stanzas || !parsed.anthem.stanzas[0]?.includes("God's grace abide")) {
          parsed.anthem = DEFAULT_SCHOOL_INFO.anthem;
        }
        const sanitized = sanitizeSchoolInfo(parsed) as SchoolInfo;
        return { ...DEFAULT_SCHOOL_INFO, ...sanitized };
      }
      return DEFAULT_SCHOOL_INFO;
    } catch {
      return DEFAULT_SCHOOL_INFO;
    }
  });

  const [headTeacher, setHeadTeacher] = useState<HeadTeacherProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HEADTEACHER);
      return saved ? JSON.parse(saved) : DEFAULT_HEADTEACHER;
    } catch {
      return DEFAULT_HEADTEACHER;
    }
  });

  const [founder, setFounder] = useState<FounderProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOUNDER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.imageUrl || parsed.imageUrl.includes('unsplash.com')) {
          parsed.imageUrl = DEFAULT_FOUNDER.imageUrl;
        }
        return { ...DEFAULT_FOUNDER, ...parsed };
      }
      return DEFAULT_FOUNDER;
    } catch {
      return DEFAULT_FOUNDER;
    }
  });

  const [students, setStudents] = useState<StudentResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      const list = saved ? JSON.parse(saved) : INITIAL_STUDENTS;
      return calculateClassPositions(list);
    } catch {
      return calculateClassPositions(INITIAL_STUDENTS);
    }
  });

  const [ptaNotices, setPtaNotices] = useState<PtaNotice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PTA_NOTICES);
      return saved ? JSON.parse(saved) : DEFAULT_PTA_NOTICES;
    } catch {
      return DEFAULT_PTA_NOTICES;
    }
  });

  const [teacherPassword, setTeacherPasswordState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEACHER_PW);
      return saved || DEFAULT_TEACHER_PASSWORD;
    } catch {
      return DEFAULT_TEACHER_PASSWORD;
    }
  });

  const [isDevAuthenticated, setIsDevAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.DEV_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeResultStudentId, setActiveResultStudentId] = useState<string | null>(null);
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<string | null>('Connecting to Google Cloud Storage...');
  const isRemoteUpdate = useRef<boolean>(false);

  const [courseConfigs, setCourseConfigs] = useState<Record<string, CourseConfig>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
      return saved ? JSON.parse(saved) : COURSE_CONFIGS;
    } catch {
      return COURSE_CONFIGS;
    }
  });

  // Load from Supabase (Primary Storage) on mount, falling back to Firebase / local
  useEffect(() => {
    loadSchoolDataFromSupabase().then(supabaseData => {
      if (supabaseData) {
        if (supabaseData.schoolInfo) setSchoolInfo((prev: SchoolInfo) => ({ ...prev, ...sanitizeSchoolInfo(supabaseData.schoolInfo) }));
        if (supabaseData.founder) setFounder((prev: FounderProfile) => ({ ...prev, ...supabaseData.founder }));
        if (supabaseData.headTeacher) setHeadTeacher((prev: HeadTeacherProfile) => ({ ...prev, ...supabaseData.headTeacher }));
        if (supabaseData.students && supabaseData.students.length > 0) setStudents(calculateClassPositions(supabaseData.students));
        if (supabaseData.ptaNotices && supabaseData.ptaNotices.length > 0) setPtaNotices(supabaseData.ptaNotices);
        if (supabaseData.courseConfigs && Object.keys(supabaseData.courseConfigs).length > 0) setCourseConfigs(supabaseData.courseConfigs);
        setFirebaseSyncStatus('Connected to Supabase Primary Storage (philipophitial1@gmail.com)');
        return;
      }

      // If Supabase has no data yet, load from secondary Firebase cloud storage
      loadSchoolDataFromFirebase().then(remoteData => {
        if (remoteData) {
          if (remoteData.schoolInfo) {
            const sanitizedRemote = sanitizeSchoolInfo(remoteData.schoolInfo);
            setSchoolInfo((prev: SchoolInfo) => ({
              ...prev,
              ...sanitizedRemote,
              anthem: {
                ...(prev.anthem || DEFAULT_SCHOOL_INFO.anthem),
                ...(sanitizedRemote?.anthem || {}),
                stanzas: (sanitizedRemote?.anthem?.stanzas && sanitizedRemote.anthem.stanzas.length > 0)
                  ? sanitizedRemote.anthem.stanzas
                  : (prev.anthem?.stanzas || DEFAULT_SCHOOL_INFO.anthem.stanzas),
                title: sanitizedRemote?.anthem?.title || prev.anthem?.title || DEFAULT_SCHOOL_INFO.anthem.title
              }
            }));
          }
          if (remoteData.founder) setFounder((prev: FounderProfile) => ({ ...prev, ...remoteData.founder }));
          if (remoteData.headTeacher) setHeadTeacher((prev: HeadTeacherProfile) => ({ ...prev, ...remoteData.headTeacher }));
          if (remoteData.students && remoteData.students.length > 0) setStudents(calculateClassPositions(remoteData.students));
          if (remoteData.ptaNotices && remoteData.ptaNotices.length > 0) setPtaNotices(remoteData.ptaNotices);
          if (remoteData.courseConfigs && Object.keys(remoteData.courseConfigs).length > 0) setCourseConfigs(remoteData.courseConfigs);
          setFirebaseSyncStatus('Synced with Cloud Storage (philipophitial1@gmail.com)');
        }
      }).catch(err => {
        console.warn('Firebase initial load note:', err);
      });
    }).catch(err => {
      console.warn('Supabase initial load note:', err);
    });

    // Real-time Supabase subscription
    const unsubSupabase = subscribeToSchoolDataSupabase(remoteData => {
      if (remoteData) {
        isRemoteUpdate.current = true;
        setTimeout(() => { isRemoteUpdate.current = false; }, 400);
        if (remoteData.schoolInfo) setSchoolInfo((prev: SchoolInfo) => ({ ...prev, ...sanitizeSchoolInfo(remoteData.schoolInfo) }));
        if (remoteData.founder) setFounder((prev: FounderProfile) => ({ ...prev, ...remoteData.founder }));
        if (remoteData.headTeacher) setHeadTeacher((prev: HeadTeacherProfile) => ({ ...prev, ...remoteData.headTeacher }));
        if (remoteData.students && remoteData.students.length > 0) setStudents(calculateClassPositions(remoteData.students));
        if (remoteData.ptaNotices && remoteData.ptaNotices.length > 0) setPtaNotices(remoteData.ptaNotices);
        if (remoteData.courseConfigs && Object.keys(remoteData.courseConfigs).length > 0) setCourseConfigs(remoteData.courseConfigs);
        setFirebaseSyncStatus('Live synced via Supabase Primary Storage');
      }
    });

    // Real-time Firebase subscription (active when Supabase is not configured)
    const unsubFirebase = subscribeToSchoolData(remoteData => {
      if (remoteData && !getSupabaseConfig().isConfigured) {
        isRemoteUpdate.current = true;
        setTimeout(() => { isRemoteUpdate.current = false; }, 400);
        if (remoteData.schoolInfo) setSchoolInfo((prev: SchoolInfo) => ({ ...prev, ...sanitizeSchoolInfo(remoteData.schoolInfo) }));
        if (remoteData.founder) setFounder((prev: FounderProfile) => ({ ...prev, ...remoteData.founder }));
        if (remoteData.headTeacher) setHeadTeacher((prev: HeadTeacherProfile) => ({ ...prev, ...remoteData.headTeacher }));
        if (remoteData.students && remoteData.students.length > 0) setStudents(calculateClassPositions(remoteData.students));
        if (remoteData.ptaNotices && remoteData.ptaNotices.length > 0) setPtaNotices(remoteData.ptaNotices);
        if (remoteData.courseConfigs && Object.keys(remoteData.courseConfigs).length > 0) setCourseConfigs(remoteData.courseConfigs);
      }
    });

    return () => {
      unsubSupabase();
      unsubFirebase();
    };
  }, []);

  // Ensure cloud databases store the updated official Vision & Mission
  useEffect(() => {
    const timer = setTimeout(() => {
      syncToFirebaseAccount({
        schoolInfo: {
          vision: DEFAULT_SCHOOL_INFO.vision,
          mission: DEFAULT_SCHOOL_INFO.mission
        }
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Keep local storage synchronized as instant offline mirror
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHOOL_INFO, JSON.stringify(schoolInfo));
    } catch (e) {
      console.warn('Local storage mirror note (SchoolInfo):', e);
    }
  }, [schoolInfo]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HEADTEACHER, JSON.stringify(headTeacher));
    } catch (e) {
      console.warn('Local storage mirror note (HeadTeacher):', e);
    }
  }, [headTeacher]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOUNDER, JSON.stringify(founder));
    } catch (e) {
      console.warn('Local storage mirror note (Founder):', e);
    }
  }, [founder]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.warn('Local storage mirror note (Students):', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PTA_NOTICES, JSON.stringify(ptaNotices));
    } catch (e) {
      console.warn('Local storage mirror note (PTA):', e);
    }
  }, [ptaNotices]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHER_PW, teacherPassword);
    } catch (e) {
      console.warn('Local storage mirror note (Password):', e);
    }
  }, [teacherPassword]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courseConfigs));
    } catch (e) {
      console.warn('Local storage mirror note (Courses):', e);
    }
  }, [courseConfigs]);

  // Direct sync to Cloud Storage with immediate feedback
  const syncToFirebaseAccount = async (override?: {
    schoolInfo?: Partial<SchoolInfo>;
    founder?: Partial<FounderProfile>;
    headTeacher?: Partial<HeadTeacherProfile>;
    students?: StudentResult[];
    ptaNotices?: PtaNotice[];
    courseConfigs?: Record<string, CourseConfig>;
  }): Promise<boolean> => {
    if (getIsQuotaExhausted()) {
      setFirebaseSyncStatus('Changes saved in local storage (Firestore free daily write quota reached; auto-resets at 00:00 UTC)');
      return true;
    }
    const mergedSchoolInfo = { ...schoolInfo, ...(override?.schoolInfo || {}) };
    const mergedFounder = { ...founder, ...(override?.founder || {}) };
    const mergedHeadTeacher = { ...headTeacher, ...(override?.headTeacher || {}) };
    const mergedStudents = override?.students || students;
    const mergedPtaNotices = override?.ptaNotices || ptaNotices;
    const mergedCourseConfigs = override?.courseConfigs || courseConfigs;

    // 1. Primary Save to Supabase Cloud Database
    const successSupabase = await saveSchoolDataToSupabase({
      schoolInfo: mergedSchoolInfo,
      founder: mergedFounder,
      headTeacher: mergedHeadTeacher,
      contactInfo: { campusAddress: mergedSchoolInfo.campusAddress, officeHours: mergedSchoolInfo.officeHours, gpsCoordinates: mergedSchoolInfo.gpsCoordinates },
      students: mergedStudents,
      fanfare: mergedSchoolInfo.anthem,
      ptaNotices: mergedPtaNotices,
      courseConfigs: mergedCourseConfigs
    });

    // 2. Secondary backup to Firebase (only if quota is not exhausted)
    let successFirebase = false;
    if (!getIsQuotaExhausted()) {
      successFirebase = await saveSchoolDataToFirebase({
        schoolInfo: mergedSchoolInfo,
        founder: mergedFounder,
        headTeacher: mergedHeadTeacher,
        contactInfo: { campusAddress: mergedSchoolInfo.campusAddress, officeHours: mergedSchoolInfo.officeHours, gpsCoordinates: mergedSchoolInfo.gpsCoordinates },
        students: mergedStudents,
        fanfare: mergedSchoolInfo.anthem,
        ptaNotices: mergedPtaNotices,
        courseConfigs: mergedCourseConfigs
      });
    }

    if (successSupabase) {
      setFirebaseSyncStatus('All records saved to Supabase Primary Cloud Database (philipophitial1@gmail.com)');
      return true;
    } else if (successFirebase) {
      setFirebaseSyncStatus('Saved to Cloud Database (philipophitial1@gmail.com)');
      return true;
    } else {
      setFirebaseSyncStatus('All records saved in local storage (Configure Supabase credentials in Developer Portal to sync live)');
      return true;
    }
  };

  const updateSchoolInfo = (info: Partial<SchoolInfo>) => {
    setSchoolInfo(prev => ({ ...prev, ...info }));
  };

  const updateFounder = (profile: Partial<FounderProfile>) => {
    setFounder(prev => ({ ...prev, ...profile }));
  };

  const updateHeadTeacher = (profile: Partial<HeadTeacherProfile>) => {
    setHeadTeacher(prev => ({ ...prev, ...profile }));
  };

  const addStudentResult = (student: StudentResult) => {
    setStudents(prev => {
      const uncalculated = [student, ...prev.filter(s => s.id !== student.id)];
      const next = calculateClassPositions(uncalculated);
      const updatedStudent = next.find(s => s.id === student.id) || student;
      saveSingleStudentToSupabase(updatedStudent);
      setTimeout(() => {
        syncToFirebaseAccount({ students: next });
      }, 0);
      return next;
    });
  };

  const updateStudentResult = (id: string, updated: Partial<StudentResult>) => {
    setStudents(prev => {
      const uncalculated = prev.map(s => s.id === id ? { ...s, ...updated } : s);
      const next = calculateClassPositions(uncalculated);
      const updatedStudent = next.find(s => s.id === id);
      if (updatedStudent) {
        saveSingleStudentToSupabase(updatedStudent);
      }
      setTimeout(() => {
        syncToFirebaseAccount({ students: next });
      }, 0);
      return next;
    });
  };

  const deleteStudentResult = (id: string) => {
    deleteStudentFromSupabase(id);
    setStudents(prev => {
      const filtered = prev.filter(s => s.id !== id);
      const next = calculateClassPositions(filtered);
      setTimeout(() => {
        syncToFirebaseAccount({ students: next });
      }, 0);
      return next;
    });
  };

  const addPtaNotice = (notice: PtaNotice) => {
    setPtaNotices(prev => [notice, ...prev]);
  };

  const deletePtaNotice = (id: string) => {
    setPtaNotices(prev => prev.filter(n => n.id !== id));
  };

  const clearAllPtaNotices = () => {
    setPtaNotices([]);
    setTimeout(() => {
      syncToFirebaseAccount({ ptaNotices: [] });
    }, 0);
  };

  const promoteAllBatches = (nextAcademicYear = '2025/2026'): { promoted: number; archived: number } => {
    let promoted = 0;
    let archived = 0;

    setStudents(prev => {
      const updated = prev.map(student => {
        // Skip already archived/graduated students
        if (student.isArchived || student.status === 'Graduated') {
          return student;
        }

        const currentForm = student.formLevel;

        if (currentForm === 'Form 3') {
          // Form 3 batch completes senior high school -> moves to archive
          archived++;
          const graduationYear = student.academicYear || '2024/2025';
          return {
            ...student,
            isArchived: true,
            status: 'Graduated' as const,
            yearCompleted: graduationYear,
            headTeacherRemarks: `Graduated from Ghanata Senior High School (${graduationYear} Academic Batch). Wish you success in future endeavors.`,
            promotedToNextClass: true,
            publishedDate: new Date().toISOString().split('T')[0]
          };
        } else if (currentForm === 'Form 2') {
          // Form 2 moves to Form 3
          promoted++;
          const nextForm = 'Form 3';
          const newClassForm = formatFullClass(nextForm, student.classArm);
          return {
            ...student,
            formLevel: 'Form 3' as const,
            classForm: newClassForm,
            academicYear: nextAcademicYear,
            promotedToNextClass: true,
            publishedDate: new Date().toISOString().split('T')[0]
          };
        } else if (currentForm === 'Form 1') {
          // Form 1 moves to Form 2
          promoted++;
          const nextForm = 'Form 2';
          const newClassForm = formatFullClass(nextForm, student.classArm);
          return {
            ...student,
            formLevel: 'Form 2' as const,
            classForm: newClassForm,
            academicYear: nextAcademicYear,
            promotedToNextClass: true,
            publishedDate: new Date().toISOString().split('T')[0]
          };
        }

        return student;
      });

      const recalculated = calculateClassPositions(updated);

      setTimeout(() => {
        syncToFirebaseAccount({ students: recalculated });
      }, 0);

      return recalculated;
    });

    return { promoted, archived };
  };

  const updateTeacherPassword = (pw: string) => {
    setTeacherPasswordState(pw);
  };

  const loginTeacher = (pw: string) => {
    if (pw === teacherPassword) {
      setIsTeacherAuthenticated(true);
      return true;
    }
    return false;
  };

  const logoutTeacher = () => {
    setIsTeacherAuthenticated(false);
  };

  const loginDev = (pw: string) => {
    if (pw === 'GhanataDev2024!' || pw === 'admin123' || pw === teacherPassword) {
      setIsDevAuthenticated(true);
      try {
        sessionStorage.setItem(STORAGE_KEYS.DEV_AUTH, 'true');
      } catch (e) {
        console.warn('SessionStorage note:', e);
      }
      return true;
    }
    return false;
  };

  const logoutDev = () => {
    setIsDevAuthenticated(false);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.DEV_AUTH);
    } catch (e) {
      console.warn('SessionStorage note:', e);
    }
  };

  const resetAllToDefaults = () => {
    setSchoolInfo(DEFAULT_SCHOOL_INFO);
    setFounder(DEFAULT_FOUNDER);
    setHeadTeacher(DEFAULT_HEADTEACHER);
    setStudents(INITIAL_STUDENTS);
    setPtaNotices(DEFAULT_PTA_NOTICES);
    setTeacherPasswordState(DEFAULT_TEACHER_PASSWORD);
    setCourseConfigs(COURSE_CONFIGS);
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Storage clear note:', e);
    }
    syncToFirebaseAccount({
      schoolInfo: DEFAULT_SCHOOL_INFO,
      founder: DEFAULT_FOUNDER,
      headTeacher: DEFAULT_HEADTEACHER,
      students: INITIAL_STUDENTS,
      ptaNotices: DEFAULT_PTA_NOTICES,
      courseConfigs: COURSE_CONFIGS
    });
  };

  const addCourse = (courseKey: string, config: CourseConfig) => {
    setCourseConfigs(prev => ({ ...prev, [courseKey]: config }));
  };

  const deleteCourse = (courseKey: string) => {
    setCourseConfigs(prev => {
      const next = { ...prev };
      delete next[courseKey];
      return next;
    });
  };

  const addClassToCourse = (courseKey: string, className: string) => {
    setCourseConfigs(prev => {
      const current = prev[courseKey];
      if (!current) return prev;
      if (current.classes.includes(className)) return prev;
      return {
        ...prev,
        [courseKey]: {
          ...current,
          classes: [...current.classes, className]
        }
      };
    });
  };

  const removeClassFromCourse = (courseKey: string, className: string) => {
    setCourseConfigs(prev => {
      const current = prev[courseKey];
      if (!current) return prev;
      return {
        ...prev,
        [courseKey]: {
          ...current,
          classes: current.classes.filter((c: string) => c !== className)
        }
      };
    });
  };

  return (
    <SchoolContext.Provider
      value={{
        schoolInfo,
        updateSchoolInfo,
        founder,
        updateFounder,
        headTeacher,
        updateHeadTeacher,
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
        isTeacherAuthenticated,
        loginTeacher,
        logoutTeacher,
        isDevAuthenticated,
        loginDev,
        logoutDev,
        resetAllToDefaults,
        activeTab,
        setActiveTab,
        activeResultStudentId,
        setActiveResultStudentId,
        firebaseSyncStatus,
        syncToFirebaseAccount,
        courseConfigs,
        addCourse,
        deleteCourse,
        addClassToCourse,
        removeClassFromCourse,
        deleteClassFromCourse: removeClassFromCourse
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
