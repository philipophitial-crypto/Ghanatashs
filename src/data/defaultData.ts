import { SchoolInformation, HeadTeacherProfile, FounderProfile, StudentResult, SubjectScore, ProgramType, CourseConfig } from '../types';

export function calculateGrade(totalScore: number): { grade: SubjectScore['grade']; interpretation: string; points: number } {
  if (totalScore >= 80) return { grade: 'A1', interpretation: 'Excellent', points: 1 };
  if (totalScore >= 75) return { grade: 'B2', interpretation: 'Very Good', points: 2 };
  if (totalScore >= 70) return { grade: 'B3', interpretation: 'Good', points: 3 };
  if (totalScore >= 65) return { grade: 'C4', interpretation: 'Credit', points: 4 };
  if (totalScore >= 60) return { grade: 'C5', interpretation: 'Credit', points: 5 };
  if (totalScore >= 50) return { grade: 'C6', interpretation: 'Credit', points: 6 };
  if (totalScore >= 45) return { grade: 'D7', interpretation: 'Pass', points: 7 };
  if (totalScore >= 40) return { grade: 'E8', interpretation: 'Pass', points: 8 };
  return { grade: 'F9', interpretation: 'Fail', points: 9 };
}

export const FOUR_CORE_SUBJECTS = [
  'Social Studies',
  'General Science',
  'General Mathematics',
  'English Language'
];

export function getAllCourseConfigs(customConfigs?: Record<string, CourseConfig>): Record<string, CourseConfig> {
  return { ...COURSE_CONFIGS, ...(customConfigs || {}) };
}

export const COURSE_CONFIGS: Record<ProgramType, CourseConfig> = {
  'General Art': {
    name: 'General Art',
    classes: Array.from({ length: 15 }, (_, i) => `GArt ${i + 1}`),
    classCount: 15,
    coreSubjects: ['Social Studies', 'General Science', 'General Mathematics', 'English Language'],
    defaultElectives: [
      'Literature-in-English',
      'Government',
      'History',
      'Economics',
      'Christian Religious Studies',
      'French'
    ]
  },
  'Visual Art': {
    name: 'Visual Art',
    classes: Array.from({ length: 5 }, (_, i) => `V Art ${i + 1}`),
    classCount: 5,
    coreSubjects: ['Social Studies', 'General Science', 'General Mathematics', 'English Language'],
    defaultElectives: [
      'General Knowledge in Art',
      'Graphic Design',
      'Picture Making',
      'Sculpture',
      'Textiles',
      'Ceramics'
    ]
  },
  'Business': {
    name: 'Business',
    classes: Array.from({ length: 5 }, (_, i) => `B${i + 1}`),
    classCount: 5,
    coreSubjects: ['Social Studies', 'General Science', 'General Mathematics', 'English Language'],
    defaultElectives: [
      'Financial Accounting',
      'Cost Accounting',
      'Business Management',
      'Economics',
      'Elective Mathematics',
      'Principles of Costing'
    ]
  },
  'Home Economics': {
    name: 'Home Economics',
    classes: Array.from({ length: 5 }, (_, i) => `H${i + 1}`),
    classCount: 5,
    coreSubjects: ['Social Studies', 'General Science', 'General Mathematics', 'English Language'],
    defaultElectives: [
      'Food & Nutrition',
      'Management-in-Living',
      'General Knowledge in Art',
      'Chemistry',
      'Clothing & Textiles',
      'Biology'
    ]
  },
  'Agric': {
    name: 'Agric',
    classes: Array.from({ length: 3 }, (_, i) => `Agric ${i + 1}`),
    classCount: 3,
    coreSubjects: ['Social Studies', 'General Science', 'General Mathematics', 'English Language'],
    defaultElectives: [
      'General Agriculture',
      'Animal Husbandry',
      'Crop Science & Horticulture',
      'Chemistry',
      'Physics',
      'Elective Mathematics'
    ]
  },
  'Science': {
    name: 'Science',
    classes: Array.from({ length: 6 }, (_, i) => `Science ${i + 1}`),
    classCount: 6,
    // Note: Core subjects except General science constant
    coreSubjects: ['Social Studies', 'General Mathematics', 'English Language'],
    defaultElectives: [
      'Physics',
      'Chemistry',
      'Biology',
      'Elective Mathematics',
      'Further Science',
      'Information & Tech'
    ]
  }
};

export function createSubjectAssessment(
  id: string,
  name: string,
  isCore: boolean,
  midsemScore = 16,
  portfolioScore = 8,
  individualProjectScore = 8,
  groupProjectScore = 8,
  examScore = 42,
  remarks = 'Satisfactory'
): SubjectScore {
  const classScore = midsemScore + portfolioScore + individualProjectScore + groupProjectScore;
  const totalScore = classScore + examScore;
  const { grade, interpretation } = calculateGrade(totalScore);
  return {
    id,
    name,
    isCore,
    midsemScore,
    portfolioScore,
    individualProjectScore,
    groupProjectScore,
    examScore,
    classScore,
    totalScore,
    grade,
    interpretation,
    remarks
  };
}

export function generateDefaultSubjectsForCourse(
  course: ProgramType, 
  customElectives?: string[]
): SubjectScore[] {
  const config = COURSE_CONFIGS[course] || COURSE_CONFIGS['Science'];
  
  // Constant core subjects
  const cores: SubjectScore[] = config.coreSubjects.map((coreName, idx) => {
    return createSubjectAssessment(
      `core-${idx}-${coreName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      coreName,
      true,
      17, // Midsem exam (max 20)
      9,  // Portfolio (max 10)
      8,  // Individual project (max 10)
      8,  // Group project (max 10)
      44, // Exam score (max 50)
      'Constant Core'
    );
  });

  // 6 Elective slots for teachers to input
  const electives: SubjectScore[] = Array.from({ length: 6 }, (_, idx) => {
    const defaultName = customElectives?.[idx] || config.defaultElectives[idx] || `Elective ${idx + 1}`;
    return createSubjectAssessment(
      `elec-${idx}`,
      defaultName,
      false,
      16, // Midsem exam (max 20)
      8,  // Portfolio (max 10)
      8,  // Individual project (max 10)
      8,  // Group project (max 10)
      42, // Exam score (max 50)
      'Elective Slot'
    );
  });

  return [...cores, ...electives];
}

export const DEFAULT_SCHOOL_INFO: SchoolInformation = {
  name: 'Ghanata Senior High School',
  shortName: 'Ghanata SHS (Dodowa)',
  mottoLatin: 'Carpe Diem',
  mottoEnglish: 'Seize the Opportunity',
  secondaryMotto: 'Enter to Learn, Depart to Serve',
  vision: 'To be a premier center of secondary education in Ghana, fostering intellectual rigor, exemplary discipline, moral uprightness, and innovative leadership for national and global advancement.',
  mission: 'To provide high-quality, holistic secondary education through dedicated teaching, state-of-the-art academic and technical mentorship, character development, and a culture of perseverance, ensuring every student discovers their highest potential.',
  briefHistory: [
    'Ghanata Senior High School was established on 2nd February, 1936 by the visionary Ghanaian educationist and cleric, the late Rev. Emmanuel Osabutey-Aguedze. The institution began in Adidome in the Volta Region under the name "Gold Coast Sub-Senior College", established out of a passionate desire to provide affordable, high-quality secondary education to young people who lacked access to colonial-era public colleges.',
    'In its pursuit of strategic growth and academic stability, the school relocated first to Koforidua and subsequently moved permanently to its sprawling, serene campus in Dodowa, within the Shai-Osudoku District of the Greater Accra Region in 1957.',
    'Upon Ghana gaining independence, the institution embraced the new national identity and was rechristened "Ghanata Senior High School" – a proud nod to the great ancient Ghana Empire and the modern republic.',
    'Over eight decades of dedicated service have seen Ghanata SHS evolve into a Category A institution renowned for stellar WASSCE results, outstanding performances in the National Science and Maths Quiz (NSMQ), cultural arts, sports, and civic leadership.',
    'Today, Ghanata sits on a scenic campus beneath the Shai Hills in Dodowa, equipped with modern science laboratories, library facilities, visual art studios, and a vibrant community of over 3,000 disciplined young scholars.'
  ],
  postOfficeBox: 'P.O. Box 4, Dodowa, Greater Accra Region, Ghana',
  campusAddress: 'Off the Accra-Somanya Road, Dodowa, Shai-Osudoku District, Greater Accra Region, Ghana',
  town: 'Dodowa',
  district: 'Shai-Osudoku District',
  region: 'Greater Accra Region',
  country: 'Ghana',
  email: 'info@ghanatashs.edu.gh',
  secondaryEmail: 'ghanatashsdodowa@gmail.com',
  phone: '+233 (0) 30 291 0422',
  secondaryPhone: '+233 (0) 24 456 7891',
  officeHours: 'Mon to Fri: 7:30 AM to 4:30 PM GMT',
  gpsCoordinates: 'Dodowa Valley Campus / Shai Hills Foot, Greater Accra',
  category: 'Category A Public Co-educational Senior High School',
  established: 1936,
  colors: {
    primary: '#14532d', // Ghanata Forest Green
    secondary: '#eab308', // Radiant Gold / Yellow
    accent: '#15803d', // Emerald Green Accent
  },
  anthem: {
    title: 'Official Ghanata School Anthem',
    stanzas: [
      "God's grace abide with Ghanata\nStar bright with blessings manifold\nCarpet Diem Excelling\nSempe merabllis oo Ghanata",
      "Chorus:\nEagle flighted we, descening\nBlessed with joyful braze and bronze\nVictorious our crown\nSempe merabllis oo Ghanata\nEagle flighted we, discerning\nBlessed with joyful braze and bronze\nVictorious our crown"
    ]
  },
  logoUrl: '/logo.png',
  coreValues: [
    'Carpe Diem (Diligence & Timeliness)',
    'Moral Integrity & Discipline',
    'Academic & Scientific Excellence',
    'Civic Responsibility & Service',
    'Creativity & Innovation'
  ]
};

export const DEFAULT_HEADTEACHER: HeadTeacherProfile = {
  name: 'Mr. Jackson K. Obeng-Frimpong',
  title: 'Headmaster',
  salutation: 'Mr.',
  imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  tenure: 'September 2020 to Present',
  qualification: 'M.Ed. Educational Leadership (UEW), B.Sc. Mathematics & Statistics (UCC), Dip. Ed.',
  welcomeMessage: 'Welcome to the official online home of Ghanata Senior High School, Dodowa. For nearly nine decades, our school has remained a fortress of discipline, academic integrity, and holistic moral development. As we navigate the 21st century, our focus remains on nurturing well-rounded citizens who embody our founding motto, "Carpe Diem" (seizing every moment to achieve greatness). We invite parents, alumni, and prospective scholars to explore our programs, celebrate our students\' achievements, and partner with us in sustaining the great Ghanata legacy.',
  email: 'headmaster@ghanatashs.edu.gh',
  phone: '+233 (0) 30 291 0422 (Ext. 101)',
  signatureUrl: 'https://api.iconify.design/fluent-emoji-flat:pen.svg'
};

export const DEFAULT_FOUNDER: FounderProfile = {
  name: 'Rev. Emmanuel Osabutey-Aguedze',
  title: 'Founder & Pioneer Principal',
  yearsOfLife: '1902 to 1978',
  imageUrl: '/founder.jpg',
  foundingYear: 1936,
  originalName: 'Gold Coast Sub-Senior College',
  originalLocation: 'Adidome, Volta Region',
  relocationYear: 1957,
  currentLocation: 'Dodowa, Greater Accra Region',
  biography: 'Rev. Emmanuel Osabutey-Aguedze was an iconic Ghanaian clergyman, scholar, and educational pioneer whose profound vision transformed secondary school accessibility in pre-independence Gold Coast. In February 1936, having observed that vast numbers of promising youth in the rural Volta basin and coastal communities had no access to the few elite colonial boarding schools in Cape Coast and Accra, Rev. Osabutey-Aguedze opened the doors of Gold Coast Sub-Senior College at Adidome. Driven by selflessness, he rallied local chiefs and community elders, financing tuition for underprivileged students from his personal clerical stipend. Later relocating the institution to Koforidua and finally to Dodowa in 1957, his steadfast belief in "Carpe Diem" created a cradle for thousands of doctors, magistrates, engineers, and public servants who have built modern Ghana.',
  quote: '"Education is not a privilege reserved for the few; it is a sacred lantern that must be placed in the hands of every willing child to illuminate our nation\'s path."',
  keyContributions: [
    'Established the school in 1936 during the colonial era to democratize secondary schooling',
    'Conceived the Latin motto "Carpe Diem", instilling relentless urgency and focus in students',
    'Spearheaded the peaceful transition and expansion to the permanent Dodowa campus in 1957',
    'Established the first co-educational boarding framework prioritizing girl-child education in the district'
  ]
};

export const INITIAL_STUDENTS: StudentResult[] = [
  {
    id: 'ghs-2024-001',
    indexNumber: 'GHS/2024/001',
    studentName: 'Kofi Mensah Boateng',
    gender: 'Male',
    program: 'Science',
    formLevel: 'Form 3',
    semester: 'Semester 1',
    classArm: 'Science 1',
    classForm: 'Form 3 Science 1',
    academicYear: '2024/2025',
    term: 'Semester 1',
    house: 'Modesty House',
    dateOfBirth: '2007-04-18',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        positionInClass: '1st',
    totalStudentsInClass: 46,
    conductRemarks: 'Exemplary behavior. Demonstrates humility, modesty, and stellar academic discipline.',
    headTeacherRemarks: 'Outstanding scholar. A true embodiment of "Carpe Diem". Recommended for the National Honours Board.',
    promotedToNextClass: true,
    publishedDate: '2024-12-15',
    aggregate: 6,
    gpa: 4.0,
    subjects: [
      createSubjectAssessment('core-soc', 'Social Studies', true, 18, 9, 9, 9, 45, 'Constant Core - High accuracy'),
      createSubjectAssessment('core-mat', 'General Mathematics', true, 20, 10, 10, 10, 48, 'Constant Core - Masterful problem solver'),
      createSubjectAssessment('core-eng', 'English Language', true, 18, 9, 9, 9, 47, 'Constant Core - Eloquent essayist'),
      createSubjectAssessment('elec-1', 'Physics', false, 18, 9, 9, 9, 46, 'Elective 1 - Strong experimental analysis'),
      createSubjectAssessment('elec-2', 'Chemistry', false, 17, 9, 9, 9, 45, 'Elective 2 - Excellent organic chemistry concepts'),
      createSubjectAssessment('elec-3', 'Biology', false, 18, 9, 9, 9, 46, 'Elective 3 - Detailed biological drawings'),
      createSubjectAssessment('elec-4', 'Elective Mathematics', false, 19, 10, 10, 9, 48, 'Elective 4 - Exceptional calculus mastery'),
      createSubjectAssessment('elec-5', 'Further Science', false, 17, 8, 9, 8, 44, 'Elective 5 - Good lab technique'),
      createSubjectAssessment('elec-6', 'Information & Tech', false, 18, 9, 9, 8, 44, 'Elective 6 - Superb algorithms')
    ]
  },
  {
    id: 'ghs-2024-042',
    indexNumber: 'GHS/2024/042',
    studentName: 'Abena Serwaa Osei',
    gender: 'Female',
    program: 'General Art',
    formLevel: 'Form 2',
    semester: 'Semester 1',
    classArm: 'GArt 1',
    classForm: 'Form 2 GArt 1',
    academicYear: '2024/2025',
    term: 'Semester 1',
    house: 'Unity House',
    dateOfBirth: '2007-08-22',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        positionInClass: '2nd',
    totalStudentsInClass: 52,
    conductRemarks: 'Very polite, respectful, and brings great unity to the class as Literary Debating President.',
    headTeacherRemarks: 'Commendable result. With continued focus, a straight 8 A1s in WASSCE is well within reach.',
    promotedToNextClass: true,
    publishedDate: '2024-12-15',
    aggregate: 7,
    gpa: 3.9,
    subjects: [
      createSubjectAssessment('core-soc', 'Social Studies', true, 19, 9, 9, 9, 47, 'Constant Core - Excellent citizenship insights'),
      createSubjectAssessment('core-sci', 'General Science', true, 16, 8, 8, 8, 42, 'Constant Core - Good grasp of environmental science'),
      createSubjectAssessment('core-mat', 'General Mathematics', true, 15, 8, 8, 7, 40, 'Constant Core - Good analytical steps'),
      createSubjectAssessment('core-eng', 'English Language', true, 20, 10, 10, 9, 47, 'Constant Core - Outstanding prose and vocabulary'),
      createSubjectAssessment('elec-1', 'Literature-in-English', false, 20, 10, 10, 9, 47, 'Elective 1 - Deep textual analysis'),
      createSubjectAssessment('elec-2', 'Government', false, 18, 9, 9, 9, 46, 'Elective 2 - Excellent constitutional critique'),
      createSubjectAssessment('elec-3', 'History', false, 18, 9, 9, 9, 45, 'Elective 3 - Thorough historical chronology'),
      createSubjectAssessment('elec-4', 'Economics', false, 17, 8, 9, 8, 43, 'Elective 4 - Sound price theory applications'),
      createSubjectAssessment('elec-5', 'Christian Religious Studies', false, 17, 8, 9, 8, 43, 'Elective 5 - Thoughtful theological responses'),
      createSubjectAssessment('elec-6', 'French', false, 16, 8, 8, 8, 40, 'Elective 6 - Fluent oral and written French')
    ]
  },
  {
    id: 'ghs-2024-108',
    indexNumber: 'GHS/2024/108',
    studentName: 'Kwame Adjei Tetteh',
    gender: 'Male',
    program: 'Business',
    formLevel: 'Form 1',
    semester: 'Semester 2',
    classArm: 'B1',
    classForm: 'Form 1 B1',
    academicYear: '2024/2025',
    term: 'Semester 2',
    house: 'Fraternity House',
    dateOfBirth: '2008-01-14',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        positionInClass: '3rd',
    totalStudentsInClass: 49,
    conductRemarks: 'Active in Fraternity House sports and tutorials. Promotes strong fellowship among peers.',
    headTeacherRemarks: 'Solid academic results. Encouraged to sustain this momentum into Form 2.',
    promotedToNextClass: true,
    publishedDate: '2024-12-15',
    aggregate: 9,
    gpa: 3.75,
    subjects: [
      createSubjectAssessment('core-soc', 'Social Studies', true, 16, 8, 8, 7, 40, 'Constant Core - Good civic engagement'),
      createSubjectAssessment('core-sci', 'General Science', true, 15, 7, 8, 7, 38, 'Constant Core - Satisfactory experiment work'),
      createSubjectAssessment('core-mat', 'General Mathematics', true, 18, 9, 9, 9, 44, 'Constant Core - Swift numerical operations'),
      createSubjectAssessment('core-eng', 'English Language', true, 17, 8, 8, 8, 42, 'Constant Core - Clear business report writing'),
      createSubjectAssessment('elec-1', 'Financial Accounting', false, 19, 10, 9, 9, 46, 'Elective 1 - Immaculate balance sheet layout'),
      createSubjectAssessment('elec-2', 'Cost Accounting', false, 18, 9, 8, 8, 43, 'Elective 2 - Sound costing principles'),
      createSubjectAssessment('elec-3', 'Business Management', false, 17, 8, 8, 8, 41, 'Elective 3 - Good comprehension of corporate structures'),
      createSubjectAssessment('elec-4', 'Economics', false, 15, 7, 8, 7, 37, 'Elective 4 - Sound supply and demand analysis'),
      createSubjectAssessment('elec-5', 'Elective Mathematics', false, 16, 8, 8, 7, 38, 'Elective 5 - Commendable linear programming'),
      createSubjectAssessment('elec-6', 'Principles of Costing', false, 17, 8, 8, 8, 40, 'Elective 6 - Accurate journal entries')
    ]
  },
  {
    id: 'ghs-2024-215',
    indexNumber: 'GHS/2024/215',
    studentName: 'Esi Dzifa Amegashie',
    gender: 'Female',
    program: 'Home Economics',
    formLevel: 'Form 3',
    semester: 'Semester 2',
    classArm: 'H1',
    classForm: 'Form 3 H1',
    academicYear: '2024/2025',
    term: 'Semester 2',
    house: 'Royal House',
    dateOfBirth: '2008-06-30',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        positionInClass: '1st',
    totalStudentsInClass: 44,
    conductRemarks: 'Quiet, disciplined, and very neat. Royal House prefect with outstanding food science skill.',
    headTeacherRemarks: 'Brilliant display of technical and academic prowess. A role model for vocational science.',
    promotedToNextClass: true,
    publishedDate: '2024-12-15',
    aggregate: 6,
    gpa: 4.0,
    subjects: [
      createSubjectAssessment('core-soc', 'Social Studies', true, 18, 9, 9, 9, 46, 'Constant Core - High standard of presentation'),
      createSubjectAssessment('core-sci', 'General Science', true, 18, 9, 9, 9, 44, 'Constant Core - Strong food nutrition chemistry'),
      createSubjectAssessment('core-mat', 'General Mathematics', true, 17, 9, 9, 8, 43, 'Constant Core - Accurate recipes and metrics'),
      createSubjectAssessment('core-eng', 'English Language', true, 18, 9, 8, 9, 43, 'Constant Core - Expressive writing style'),
      createSubjectAssessment('elec-1', 'Food & Nutrition', false, 20, 10, 10, 10, 47, 'Elective 1 - Flawless catering and hygiene'),
      createSubjectAssessment('elec-2', 'Management-in-Living', false, 19, 10, 10, 9, 46, 'Elective 2 - Excellent resource planning'),
      createSubjectAssessment('elec-3', 'General Knowledge in Art', false, 18, 9, 9, 9, 45, 'Elective 3 - Creative pattern drafting'),
      createSubjectAssessment('elec-4', 'Chemistry', false, 17, 8, 9, 8, 42, 'Elective 4 - Sound biochemical comprehension'),
      createSubjectAssessment('elec-5', 'Clothing & Textiles', false, 17, 9, 8, 8, 42, 'Elective 5 - Masterful garment tailoring'),
      createSubjectAssessment('elec-6', 'Biology', false, 16, 8, 8, 8, 40, 'Elective 6 - Good physiology notes')
    ]
  },
  {
    id: 'ghs-2024-301',
    indexNumber: 'GHS/2024/301',
    studentName: 'Emmanuel Nii Armah Dodoo',
    gender: 'Male',
    program: 'Visual Art',
    formLevel: 'Form 2',
    semester: 'Semester 2',
    classArm: 'V Art 1',
    classForm: 'Form 2 V Art 1',
    academicYear: '2024/2025',
    term: 'Semester 2',
    house: 'Integrity House',
    dateOfBirth: '2007-11-09',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        positionInClass: '2nd',
    totalStudentsInClass: 38,
    conductRemarks: 'Creative thinker, honest and loyal Integrity House member. Sets up festival exhibition stages.',
    headTeacherRemarks: 'Commendable artistic genius with strong academic core foundation. Keep it up!',
    promotedToNextClass: true,
    publishedDate: '2024-12-15',
    aggregate: 8,
    gpa: 3.8,
    subjects: [
      createSubjectAssessment('core-soc', 'Social Studies', true, 18, 9, 9, 8, 44, 'Constant Core - Good heritage presentations'),
      createSubjectAssessment('core-sci', 'General Science', true, 16, 8, 8, 7, 37, 'Constant Core - Satisfactory physics of light and color'),
      createSubjectAssessment('core-mat', 'General Mathematics', true, 16, 8, 8, 8, 38, 'Constant Core - Good geometric designs'),
      createSubjectAssessment('core-eng', 'English Language', true, 17, 8, 8, 8, 43, 'Constant Core - Clear artistic reviews'),
      createSubjectAssessment('elec-1', 'General Knowledge in Art', false, 20, 10, 10, 9, 47, 'Elective 1 - Deep art history insight'),
      createSubjectAssessment('elec-2', 'Graphic Design', false, 19, 10, 10, 9, 46, 'Elective 2 - Advanced digital typography'),
      createSubjectAssessment('elec-3', 'Picture Making', false, 19, 9, 9, 9, 45, 'Elective 3 - Striking watercolor composition'),
      createSubjectAssessment('elec-4', 'Sculpture', false, 19, 10, 10, 9, 45, 'Elective 4 - Expressive wood and clay busts'),
      createSubjectAssessment('elec-5', 'Textiles', false, 17, 8, 9, 8, 43, 'Elective 5 - Intricate batik and screen prints'),
      createSubjectAssessment('elec-6', 'Ceramics', false, 17, 9, 8, 8, 42, 'Elective 6 - Balanced pottery throwing')
    ]
  },
  {
    id: 'ghs-2024-405',
    indexNumber: 'GHS/2024/405',
    studentName: 'Mawusi Kwabla Agbenyega',
    gender: 'Male',
    program: 'Agric',
    formLevel: 'Form 1',
    semester: 'Semester 1',
    classArm: 'Agric 1',
    classForm: 'Form 1 Agric 1',
    academicYear: '2024/2025',
    term: 'Semester 1',
    house: 'Modesty House',
    dateOfBirth: '2007-09-15',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        positionInClass: '1st',
    totalStudentsInClass: 35,
    conductRemarks: 'Highly dedicated, punctual, and innovative in practical farm husbandry.',
    headTeacherRemarks: 'Outstanding agricultural scholar. Setting the benchmark for youth in agribusiness.',
    promotedToNextClass: true,
    publishedDate: '2024-12-15',
    aggregate: 7,
    gpa: 3.9,
    subjects: [
      createSubjectAssessment('core-soc', 'Social Studies', true, 18, 9, 9, 8, 44, 'Constant Core - Good agricultural economics'),
      createSubjectAssessment('core-sci', 'General Science', true, 18, 9, 9, 9, 44, 'Constant Core - Strong botany and soil biology'),
      createSubjectAssessment('core-mat', 'General Mathematics', true, 17, 8, 8, 8, 42, 'Constant Core - Accurate farm surveys and metrics'),
      createSubjectAssessment('core-eng', 'English Language', true, 17, 8, 8, 8, 43, 'Constant Core - Thorough research reports'),
      createSubjectAssessment('elec-1', 'General Agriculture', false, 20, 10, 10, 9, 47, 'Elective 1 - High yields in farm trial plots'),
      createSubjectAssessment('elec-2', 'Animal Husbandry', false, 19, 10, 9, 9, 46, 'Elective 2 - Excellent livestock feed formulating'),
      createSubjectAssessment('elec-3', 'Crop Science & Horticulture', false, 18, 9, 9, 9, 45, 'Elective 3 - Precise nursery and grafting'),
      createSubjectAssessment('elec-4', 'Chemistry', false, 17, 8, 9, 8, 42, 'Elective 4 - Strong pesticide analysis'),
      createSubjectAssessment('elec-5', 'Physics', false, 16, 8, 8, 8, 41, 'Elective 5 - Good farm machinery comprehension'),
      createSubjectAssessment('elec-6', 'Elective Mathematics', false, 16, 8, 8, 8, 40, 'Elective 6 - Accurate yield statistical modeling')
    ]
  }
];

export const HOUSES_DATA = [
  {
    name: 'Modesty House',
    houseNumber: 1,
    color: '#dc2626', // Red
    badgeColor: 'bg-red-600',
    textColor: 'text-red-100',
    description: 'Modesty House embodies humble excellence, quiet diligence, and moral integrity. Its scholars lead by dignified example in academics, debate, and community service.',
    motto: 'Humility and Excellence',
    colorName: 'Red'
  },
  {
    name: 'Unity House',
    houseNumber: 2,
    color: '#2563eb', // Blue
    badgeColor: 'bg-blue-600',
    textColor: 'text-blue-100',
    description: 'Unity House champions solidarity, collective resolve, and brotherhood. Renowned for sporting dominance, inter-house debates, and peer academic mentorship.',
    motto: 'Together in Strength',
    colorName: 'Blue'
  },
  {
    name: 'Fraternity House',
    houseNumber: 3,
    color: '#ca8a04', // Yellow
    badgeColor: 'bg-yellow-500',
    textColor: 'text-yellow-100',
    description: 'Fraternity House radiates fellowship, mutual respect, and vibrant cultural expression, actively participating in campus competitions and music festivals.',
    motto: 'Brotherhood and Honor',
    colorName: 'Yellow'
  },
  {
    name: 'Royal House',
    houseNumber: 4,
    color: '#16a34a', // Green
    badgeColor: 'bg-green-600',
    textColor: 'text-green-100',
    description: 'Royal House stands for noble vision, environmental stewardship, and stately leadership. Known for academic distinction, discipline, and agricultural innovation.',
    motto: 'Nobility and Service',
    colorName: 'Green'
  },
  {
    name: 'Integrity House',
    houseNumber: 5,
    color: '#9333ea', // Purple
    badgeColor: 'bg-purple-600',
    textColor: 'text-purple-100',
    description: 'Integrity House represents unshakeable honesty, moral uprightness, and dedicated scholarship, holding fast to the founding tenets of Ghanata Senior High School.',
    motto: 'Truth and Righteousness',
    colorName: 'Purple'
  }
];

export const ACADEMIC_PROGRAMS = [
  {
    id: 'general-art',
    title: 'General Art',
    classRange: 'GArt 1 to GArt 15 (15 Classes)',
    classes: Array.from({ length: 15 }, (_, i) => `GArt ${i + 1}`),
    description: 'Fosters critical thinking, constitutional literacy, diplomatic oratory, and literary excellence for national governance and legal studies.',
    coreSubjects: ['Social Studies', 'General Science', 'General Mathematics', 'English Language'],
    electives: ['Literature-in-English', 'Government', 'History', 'Economics', 'Christian Religious Studies', 'French'],
    careers: 'Law, Diplomacy, Public Administration, Journalism, Education, Politics'
  },
  {
    id: 'visual-art',
    title: 'Visual Art',
    classRange: 'V Art 1 to V Art 5 (5 Classes)',
    classes: Array.from({ length: 5 }, (_, i) => `V Art ${i + 1}`),
    description: 'Nurtures artistic genius, industrial graphic design, sculpture, ceramics, and textiles blending rich Ghanaian heritage with modern media.',
    coreSubjects: ['Social Studies', 'General Science', 'General Mathematics', 'English Language'],
    electives: ['General Knowledge in Art', 'Graphic Design', 'Picture Making', 'Sculpture', 'Textiles', 'Ceramics'],
    careers: 'Architecture, Graphic Design, Creative Direction, Fine Arts, Industrial Styling'
  },
  {
    id: 'business',
    title: 'Business',
    classRange: 'B1 to B5 (5 Classes)',
    classes: Array.from({ length: 5 }, (_, i) => `B${i + 1}`),
    description: 'Equips students with rigorous financial accounting, costing, enterprise management, and economic analysis for modern commercial leadership.',
    coreSubjects: ['Social Studies', 'General Science', 'General Mathematics', 'English Language'],
    electives: ['Financial Accounting', 'Cost Accounting', 'Business Management', 'Economics', 'Elective Mathematics', 'Principles of Costing'],
    careers: 'Chartered Accountancy, Investment Banking, Corporate Law, Business Management'
  },
  {
    id: 'home-economics',
    title: 'Home Economics',
    classRange: 'H1 to H5 (5 Classes)',
    classes: Array.from({ length: 5 }, (_, i) => `H${i + 1}`),
    description: 'Combines nutritional chemistry, catering, textile sciences, and estate management to create leaders in hospitality and dietetics.',
    coreSubjects: ['Social Studies', 'General Science', 'General Mathematics', 'English Language'],
    electives: ['Food & Nutrition', 'Management-in-Living', 'General Knowledge in Art', 'Chemistry', 'Clothing & Textiles', 'Biology'],
    careers: 'Clinical Dietetics, Hospitality Management, Food Technology, Interior Design'
  },
  {
    id: 'agric',
    title: 'Agric',
    classRange: 'Agric 1 to Agric 3 (3 Classes)',
    classes: Array.from({ length: 3 }, (_, i) => `Agric ${i + 1}`),
    description: 'Trains future agronomists and agribusiness leaders in modern animal husbandry, crop science, farm mechanization, and soil sciences.',
    coreSubjects: ['Social Studies', 'General Science', 'General Mathematics', 'English Language'],
    electives: ['General Agriculture', 'Animal Husbandry', 'Crop Science & Horticulture', 'Chemistry', 'Physics', 'Elective Mathematics'],
    careers: 'Agronomy, Agribusiness, Veterinary Medicine, Soil Science, Agricultural Engineering'
  },
  {
    id: 'science',
    title: 'Science',
    classRange: 'Science 1 to Science 6 (6 Classes)',
    classes: Array.from({ length: 6 }, (_, i) => `Science ${i + 1}`),
    description: 'Prepares future medical doctors, biomedical researchers, computer scientists, and engineers through rigorous laboratory training.',
    coreSubjects: ['Social Studies', 'General Mathematics', 'English Language'],
    electives: ['Physics', 'Chemistry', 'Biology', 'Elective Mathematics', 'Further Science', 'Information & Tech'],
    careers: 'Medicine, Engineering, Pharmacy, Computer Science, Biotechnology'
  }
];

export const DEFAULT_TEACHER_PASSWORD = 'CarpeDiem1936';
export const DEVELOPER_PASSWORD = 'Osabutey1936';

export const DEFAULT_PTA_NOTICES = [
  {
    id: 'pta-001',
    title: '3rd Term General PTA Meeting & Academic Progress Review',
    category: 'General Meeting' as const,
    date: '2025-03-22',
    author: 'PTA Executive Secretariat & Headmaster',
    summary: 'Notice is hereby given to all parents and guardians of Ghanata Senior High School regarding the upcoming 3rd Term General Meeting.',
    content: 'Notice is hereby given to all parents and guardians of students in Ghanata Senior High School that the statutory General Parent-Teacher Association (PTA) meeting for the academic term will convene at the School Assembly Hall on Saturday, 22nd March 2025 at 9:00 AM prompt.\n\nAgenda items include:\n1. Opening devotion and welcome remarks by PTA Chairman.\n2. Address by the Headmaster on terminal academic performance and WASSCE readiness.\n3. Financial report and presentation of audited welfare accounts.\n4. Consideration of proposed campus infrastructure enhancement projects (new e-library and student clinic expansion).\n5. Open forum and election of Year 1 Parent Representatives.\n\nAll parents are urged to attend promptly as vital resolutions impacting your wards will be finalized.',
    priority: 'Urgent' as const,
    venue: 'Ghanata SHS Main Assembly Hall, Dodowa',
    time: '9:00 AM to 1:00 PM GMT'
  },
  {
    id: 'pta-002',
    title: 'PTA Science Laboratory & ICT Resource Levy Update',
    category: 'Levies & Welfare' as const,
    date: '2025-02-14',
    author: 'PTA Financial Committee',
    summary: 'Status report on the voluntary PTA contribution towards refurbishing the Physics, Chemistry, and ICT Laboratories.',
    content: 'The PTA Executive Committee expresses deep gratitude to all parents who have contributed towards the science laboratory refurbishment fund. Through your generous support, 45 modern digital microscopes and 30 desktop computers have arrived on campus.\n\nParents who are yet to fulfill their voluntary quota are kindly encouraged to deposit directly into the official Ghanata PTA Consolidated Account at GCB Bank Dodowa Branch or via the official MTN Mobile Money merchant terminal. Official receipts are issued at the Bursar\'s registry during visiting days.',
    priority: 'Important' as const,
    venue: 'GCB Bank Dodowa / School Bursar Office',
    time: 'Weekdays 8:00 AM to 3:30 PM'
  },
  {
    id: 'pta-003',
    title: 'WASSCE Candidates Special Clinic & Counseling Seminar',
    category: 'Academic Report' as const,
    date: '2025-01-28',
    author: 'Academic Board & Guidance Counseling Unit',
    summary: 'A collaborative seminar for SHS 3 parents and candidates on study habits, mock exam analytics, and stress management.',
    content: 'The Guidance and Counseling Department, in conjunction with the PTA Academic Committee, invites all final-year parents to a 2-hour interactive symposium. Heads of Science, Arts, Business, Home Economics, and Visual Arts will be available to present diagnostic analysis of recent mock results and recommend targeted home support interventions before the upcoming WAEC final examinations.',
    priority: 'Normal' as const,
    venue: 'Ghanata SHS Dining Hall',
    time: '10:00 AM to 12:30 PM'
  },
  {
    id: 'pta-004',
    title: 'Commissioning of the PTA Solar-Powered Water Borehole',
    category: 'Development Projects' as const,
    date: '2024-11-18',
    author: 'PTA Projects Oversight Committee',
    summary: 'Celebration and official handover of the 50,000-liter mechanized water project serving student boarding dormitories.',
    content: 'We are pleased to announce the successful commissioning of the Ghanata SHS PTA mechanized borehole project. The system is equipped with automated solar pumps and dual storage reservoirs ensuring 24/7 unhindered potable water supply to all boarding houses (Osabutey, Dodowa, Aggrey, Freeman, and Guggisberg). Special appreciation to the alumni and executive patrons.',
    priority: 'Normal' as const,
    venue: 'Campus Boarding House Compound',
    time: 'Completed'
  }
];

