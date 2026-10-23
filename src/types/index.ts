export interface SubjectScore {
  id: string;
  name: string;
  isCore: boolean;
  // 5 Official Assessment Components:
  midsemScore: number;          // Midsem exam (Max 20)
  portfolioScore: number;       // Portfolio (Max 10)
  individualProjectScore: number; // Individual project (Max 10)
  groupProjectScore: number;    // Group project (Max 10)
  examScore: number;            // Exams score (Max 50)
  classScore?: number;          // Continuous Assessment Total (Max 50)
  totalScore: number;           // Max 100
  grade: 'A1' | 'B2' | 'B3' | 'C4' | 'C5' | 'C6' | 'D7' | 'E8' | 'F9';
  interpretation: string;
  position?: string;
  remarks: string;
}

export type ProgramType = 
  | 'General Art'
  | 'Visual Art'
  | 'Business'
  | 'Home Economics'
  | 'Agric'
  | 'Science';

export type FormLevel = 'Form 1' | 'Form 2' | 'Form 3';
export type SemesterType = 'Semester 1' | 'Semester 2';
export type HouseType = 
  | 'Modesty House' 
  | 'Unity House' 
  | 'Fraternity House' 
  | 'Royal House' 
  | 'Integrity House';

export interface StudentResult {
  id: string;
  indexNumber: string;
  studentName: string;
  gender: 'Male' | 'Female';
  program: ProgramType;
  formLevel: FormLevel;        // Form 1, Form 2, Form 3
  semester: SemesterType;      // Semester 1, Semester 2
  classArm: string;            // e.g. "Science 1", "GArt 4", "B2"
  classForm: string;           // e.g. "Form 3 Science 1", "Form 1 GArt 2"
  academicYear: string;        // e.g. "2024/2025"
  admissionYear?: string;      // Year the student came to the school, e.g. "2024" or "2025"
  term?: string;               // Legacy / display compatibility
  house: HouseType;
  dateOfBirth: string;
  photoUrl: string;
  subjects: SubjectScore[];
  aggregate: number;
  gpa: number;
  positionInClass: string;
  totalStudentsInClass: number;
  conductRemarks: string;
  headTeacherRemarks: string;
  promotedToNextClass: boolean;
  publishedDate: string;
}

export interface PtaNotice {
  id: string;
  title: string;
  category: 'General Meeting' | 'Levies & Welfare' | 'Academic Report' | 'Development Projects' | 'Emergency Notice';
  date: string;
  author: string;
  summary: string;
  content: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  venue?: string;
  time?: string;
}

export interface HeadTeacherProfile {
  name: string;
  title: string;
  salutation: string;
  imageUrl: string;
  tenure: string;
  qualification: string;
  welcomeMessage: string;
  email: string;
  phone: string;
  signatureUrl?: string;
}

export interface FounderProfile {
  name: string;
  title: string;
  yearsOfLife: string;
  imageUrl: string;
  foundingYear: number;
  originalName: string;
  originalLocation: string;
  relocationYear: number;
  currentLocation: string;
  biography: string;
  quote: string;
  keyContributions: string[];
}

export interface CourseConfig {
  name: string;
  classes: string[];
  classCount: number;
  coreSubjects: string[];
  defaultElectives: string[];
}

export interface SchoolInformation {
  name: string;
  shortName: string;
  mottoLatin: string;
  mottoEnglish: string;
  secondaryMotto: string;
  vision: string;
  mission: string;
  briefHistory: string[];
  postOfficeBox: string;
  town: string;
  district: string;
  region: string;
  country: string;
  email: string;
  secondaryEmail: string;
  phone: string;
  secondaryPhone: string;
  category: string;
  established: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  anthem: {
    title: string;
    stanzas: string[];
    audioUrl?: string;
    audioFileName?: string;
    customFanfareNote?: string;
  };
  campusAddress?: string;
  officeHours?: string;
  gpsCoordinates?: string;
  logoUrl?: string;
  coreValues: string[];
  customCourseConfigs?: Record<string, CourseConfig>;
}
