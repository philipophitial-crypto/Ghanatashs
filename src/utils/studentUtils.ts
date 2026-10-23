import { StudentResult, ProgramType, FormLevel, CourseConfig } from '../types';
import { COURSE_CONFIGS } from '../data/defaultData';

/**
 * Returns the exact class arms available for a given Course/Program.
 * e.g., Science -> ['Science 1', 'Science 2', ... 'Science 6']
 * General Art -> ['GArt 1', 'GArt 2', ... 'GArt 15']
 * Business -> ['B1', 'B2', ... 'B5']
 * Home Economics -> ['H1', ... 'H5']
 * Visual Art -> ['V Art 1', ... 'V Art 5']
 * Agric -> ['Agric 1', ... 'Agric 3']
 */
export function getClassesForCourse(
  program: ProgramType | string, 
  customConfigs?: Record<string, CourseConfig>
): string[] {
  const allConfigs = { ...COURSE_CONFIGS, ...(customConfigs || {}) };
  const config = (allConfigs as any)[program];
  if (config && Array.isArray(config.classes) && config.classes.length > 0) {
    return config.classes;
  }
  
  switch (program) {
    case 'Science':
      return ['Science 1', 'Science 2', 'Science 3', 'Science 4', 'Science 5', 'Science 6'];
    case 'General Art':
      return Array.from({ length: 15 }, (_, i) => `GArt ${i + 1}`);
    case 'Business':
      return ['B1', 'B2', 'B3', 'B4', 'B5'];
    case 'Visual Art':
      return ['V Art 1', 'V Art 2', 'V Art 3', 'V Art 4', 'V Art 5'];
    case 'Home Economics':
      return ['H1', 'H2', 'H3', 'H4', 'H5'];
    case 'Agric':
      return ['Agric 1', 'Agric 2', 'Agric 3'];
    default:
      return ['Class 1', 'Class 2', 'Class 3'];
  }
}

/**
 * Formats the official Full Class Designation corresponding to form level and class arm.
 * e.g., Form 1 + Science 1 => "Form 1 Science 1"
 * Form 3 + B2 => "Form 3 B2"
 * Form 2 + GArt 4 => "Form 2 GArt 4"
 */
export function formatFullClass(formLevel: FormLevel | string, classArm: string): string {
  const cleanForm = (formLevel || 'Form 1').trim();
  const cleanArm = (classArm || '').trim();
  if (!cleanArm) return cleanForm;
  
  // If classArm already includes Form Level, return it clean
  if (cleanArm.toLowerCase().startsWith('form')) {
    return cleanArm;
  }
  
  return `${cleanForm} ${cleanArm}`;
}

/**
 * Automatically and uniquely generates an index number for a student.
 * The year attached to the index is the year the student came to the school (Year of Admission).
 * Format: GHS/{yearCameToSchool}/{3-digit Serial}
 * e.g., Student came to school in 2024 -> GHS/2024/001
 * Student came to school in 2025 -> GHS/2025/007
 */
export function generateUniqueIndexNumber(
  existingStudents: { id?: string; indexNumber: string }[],
  yearCameToSchool: string | number = 2025
): string {
  // Extract 4-digit admission year (e.g. "2024/2025" => "2024", 2024 => "2024")
  let yearStr = '2025';
  if (typeof yearCameToSchool === 'string' && yearCameToSchool.includes('/')) {
    const parts = yearCameToSchool.split('/');
    yearStr = parts[0] || '2025';
  } else if (yearCameToSchool) {
    yearStr = String(yearCameToSchool).trim();
  }

  const prefix = `GHS/${yearStr}/`;
  const usedIndices = new Set(
    existingStudents
      .map(s => s.indexNumber?.trim().toUpperCase())
      .filter(Boolean)
  );

  let maxSerial = 0;
  for (const s of existingStudents) {
    if (!s.indexNumber) continue;
    // Check for GHS/YYYY/XXX matching this exact admission year
    const match = s.indexNumber.match(new RegExp(`GHS[\\/-]${yearStr}[\\/-](\\d+)`, 'i'));
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSerial) {
        maxSerial = num;
      }
    } else {
      const generalMatch = s.indexNumber.match(/GHS[\/-]\d{4}[\/-](\d+)/i);
      if (generalMatch) {
        const num = parseInt(generalMatch[1], 10);
        if (!isNaN(num) && num > maxSerial) {
          maxSerial = num;
        }
      }
    }
  }

  let nextSerial = Math.max(maxSerial + 1, 1);
  let candidate = `${prefix}${String(nextSerial).padStart(3, '0')}`;

  while (usedIndices.has(candidate.toUpperCase())) {
    nextSerial++;
    candidate = `${prefix}${String(nextSerial).padStart(3, '0')}`;
  }

  return candidate;
}

/**
 * Calculates the default year a student came to school based on their Form Level and academic year.
 * In a standard 3-year SHS system (e.g., in 2024/2025 session):
 * - Form 1 came to school in: 2024
 * - Form 2 came to school in: 2023
 * - Form 3 came to school in: 2022
 */
export function getYearCameToSchool(formLevel: FormLevel | string, academicYear = '2024/2025'): string {
  const baseYear = parseInt(academicYear.split('/')[0] || '2024', 10);
  switch (formLevel) {
    case 'Form 1':
      return String(baseYear);
    case 'Form 2':
      return String(baseYear - 1);
    case 'Form 3':
      return String(baseYear - 2);
    default:
      return String(baseYear);
  }
}

/**
 * Validates whether an index number is unique among all other students.
 */
export function isIndexNumberUnique(
  indexNumber: string, 
  currentStudentId: string | null | undefined, 
  existingStudents: StudentResult[]
): boolean {
  if (!indexNumber || !indexNumber.trim()) return false;
  const target = indexNumber.trim().toUpperCase();
  return !existingStudents.some(
    s => s.id !== currentStudentId && s.indexNumber?.trim().toUpperCase() === target
  );
}

/**
 * Computes overall total score and average mark across all subjects for a student.
 */
export function getStudentOverallScore(student: { subjects?: { totalScore?: number }[] }): {
  totalMarks: number;
  averageMark: number;
} {
  const subjects = student.subjects || [];
  if (subjects.length === 0) return { totalMarks: 0, averageMark: 0 };
  const totalMarks = subjects.reduce((sum, s) => sum + (Number(s.totalScore) || 0), 0);
  const averageMark = totalMarks / subjects.length;
  return { totalMarks, averageMark: Number(averageMark.toFixed(2)) };
}

/**
 * Returns the ordinal suffix for a rank number (e.g. 1 -> 1st, 2 -> 2nd, 3 -> 3rd, 4 -> 4th, 21 -> 21st).
 */
export function getOrdinalSuffix(n: number): string {
  if (n <= 0) return '1st';
  const pr = new Intl.PluralRules('en', { type: 'ordinal' });
  const suffixes: Record<string, string> = {
    one: 'st',
    two: 'nd',
    few: 'rd',
    other: 'th'
  };
  return `${n}${suffixes[pr.select(n)] || 'th'}`;
}

/**
 * Automatically calculates the exact position in class for EVERY student in their respective class.
 * Ranks all students belonging to the same designated class (e.g. "Form 1 Science 1")
 * based on overall average percentage and total marks in descending order.
 */
export function calculateClassPositions<T extends StudentResult>(students: T[]): T[] {
  // Group students by their designated class (classForm or formatFullClass)
  const classGroups = new Map<string, T[]>();

  for (const s of students) {
    const classKey = (s.classForm || formatFullClass(s.formLevel, s.classArm) || 'General').trim().toLowerCase();
    if (!classGroups.has(classKey)) {
      classGroups.set(classKey, []);
    }
    classGroups.get(classKey)!.push(s);
  }

  const updatedStudentsMap = new Map<string, { position: string; totalInClass: number }>();

  // For each class group, rank students
  for (const [, classMembers] of classGroups.entries()) {
    const totalCount = classMembers.length;

    // Sort descending by averageMark, then totalMarks, then aggregate (lower is better in BECE/WASSCE)
    const sorted = [...classMembers].sort((a, b) => {
      const aScore = getStudentOverallScore(a);
      const bScore = getStudentOverallScore(b);
      if (bScore.averageMark !== aScore.averageMark) {
        return bScore.averageMark - aScore.averageMark;
      }
      if (bScore.totalMarks !== aScore.totalMarks) {
        return bScore.totalMarks - aScore.totalMarks;
      }
      return (Number(a.aggregate) || 99) - (Number(b.aggregate) || 99);
    });

    let currentRank = 1;
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0) {
        const prevScore = getStudentOverallScore(sorted[i - 1]);
        const currScore = getStudentOverallScore(sorted[i]);
        if (currScore.averageMark !== prevScore.averageMark || currScore.totalMarks !== prevScore.totalMarks) {
          currentRank = i + 1;
        }
      }
      const ordinal = getOrdinalSuffix(currentRank);
      updatedStudentsMap.set(sorted[i].id, {
        position: ordinal,
        totalInClass: totalCount
      });
    }
  }

  return students.map(s => {
    const rankInfo = updatedStudentsMap.get(s.id);
    if (!rankInfo) return s;
    return {
      ...s,
      positionInClass: rankInfo.position,
      totalStudentsInClass: rankInfo.totalInClass
    };
  });
}

/**
 * Calculates what the position would be for a student if their updated scores or class are saved.
 */
export function calculateStudentPositionInClass(
  targetStudent: Partial<StudentResult>,
  allStudents: StudentResult[]
): { position: string; totalInClass: number; averageScore: number; rankNumber: number } {
  const targetClassKey = (
    targetStudent.classForm || 
    formatFullClass(targetStudent.formLevel || 'Form 1', targetStudent.classArm || '') || 
    'General'
  ).trim().toLowerCase();

  // Filter peers in the same designated class (excluding this student's previous record)
  const peers = allStudents.filter(
    s => s.id !== targetStudent.id && 
         (s.classForm || formatFullClass(s.formLevel, s.classArm) || 'General').trim().toLowerCase() === targetClassKey
  );

  const targetScore = getStudentOverallScore(targetStudent);
  const totalInClass = peers.length + 1;

  // Combine target student with peers
  const combined = [
    { ...targetStudent, _isTarget: true, _score: targetScore },
    ...peers.map(p => ({ ...p, _isTarget: false, _score: getStudentOverallScore(p) }))
  ].sort((a, b) => {
    if (b._score.averageMark !== a._score.averageMark) {
      return b._score.averageMark - a._score.averageMark;
    }
    if (b._score.totalMarks !== a._score.totalMarks) {
      return b._score.totalMarks - a._score.totalMarks;
    }
    return (Number(a.aggregate) || 99) - (Number(b.aggregate) || 99);
  });

  let currentRank = 1;
  let targetRank = 1;

  for (let i = 0; i < combined.length; i++) {
    if (i > 0) {
      const prev = combined[i - 1];
      const curr = combined[i];
      if (curr._score.averageMark !== prev._score.averageMark || curr._score.totalMarks !== prev._score.totalMarks) {
        currentRank = i + 1;
      }
    }
    if (combined[i]._isTarget) {
      targetRank = currentRank;
      break;
    }
  }

  return {
    position: getOrdinalSuffix(targetRank),
    totalInClass,
    averageScore: targetScore.averageMark,
    rankNumber: targetRank
  };
}

