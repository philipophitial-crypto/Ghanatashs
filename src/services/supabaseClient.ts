import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  URL: 'ghanata_supabase_url',
  ANON_KEY: 'ghanata_supabase_anon_key'
};

const PERMANENT_SUPABASE_URL = 'https://wgizaplbphqmulqgylzx.supabase.co';
const PERMANENT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnaXphcGxicGhxbXVscWd5bHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMzM3NDAsImV4cCI6MjEwNDgwOTc0MH0.0xFqBIqaHBh7SxZ6YPnXA1PS19pi_E6RqL3f0PDue-Y';

export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  let url = (import.meta as any).env?.VITE_SUPABASE_URL || PERMANENT_SUPABASE_URL;
  let anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || PERMANENT_SUPABASE_ANON_KEY;

  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem(STORAGE_KEYS.URL);
    const customKey = localStorage.getItem(STORAGE_KEYS.ANON_KEY);
    if (customUrl && customUrl.startsWith('https://')) url = customUrl;
    if (customKey && customKey.startsWith('ey')) anonKey = customKey;
  }

  const isConfigured = Boolean(
    url && 
    anonKey && 
    !url.includes('your-project.supabase.co') && 
    !url.includes('placeholder') &&
    url.startsWith('https://')
  );

  return { url, anonKey, isConfigured };
}

export function setSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEYS.URL, url.trim());
    if (anonKey) localStorage.setItem(STORAGE_KEYS.ANON_KEY, anonKey.trim());
    cachedClient = null;
  }
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }
  return cachedClient;
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase credentials are not configured yet. Please provide your Project URL and Anon Key.'
    };
  }

  try {
    const { error } = await client.from('schools').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Connected to Supabase, but the "schools" table has not been created yet. Please run the SQL schema script in your Supabase SQL Editor.'
        };
      }
      return {
        success: false,
        message: `Supabase query error: ${error.message}`
      };
    }
    return {
      success: true,
      message: 'Successfully connected to Supabase Primary Cloud Database!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect to Supabase: ${err?.message || err}`
    };
  }
}

// Primary save function to Supabase PostgreSQL database with permanent deletion sync
export async function saveSchoolDataToSupabase(data: {
  schoolInfo: any;
  founder: any;
  headTeacher: any;
  contactInfo: any;
  students: any[];
  fanfare: any;
  ptaNotices?: any[];
  courseConfigs?: any;
}): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  try {
    const { error: schoolError } = await client
      .from('schools')
      .upsert({
        id: 'ghanata_shs_main',
        owner: 'philipophitial1@gmail.com',
        school_info: data.schoolInfo,
        founder: data.founder,
        head_teacher: data.headTeacher,
        contact_info: data.contactInfo,
        fanfare: data.fanfare,
        pta_notices: data.ptaNotices || null,
        course_configs: data.courseConfigs || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (schoolError) {
      console.warn('Supabase school primary save note:', schoolError.message);
      return false;
    }

    const activeStudentIds = new Set<string>();

    // Upsert current students
    for (const student of data.students || []) {
      const studentId = student.id || student.studentId || 'std_' + Date.now();
      activeStudentIds.add(studentId);
      await client
        .from('students')
        .upsert({
          student_id: studentId,
          owner: 'philipophitial1@gmail.com',
          data: student,
          updated_at: new Date().toISOString()
        }, { onConflict: 'student_id' });
    }

    // Permanently remove students from cloud that are no longer in state
    const { data: existingStudents } = await client
      .from('students')
      .select('student_id')
      .eq('owner', 'philipophitial1@gmail.com');

    if (existingStudents) {
      for (const record of existingStudents) {
        if (!activeStudentIds.has(record.student_id)) {
          await client
            .from('students')
            .delete()
            .eq('student_id', record.student_id);
        }
      }
    }

    console.log('Successfully saved and synchronized all student records to Supabase Primary Storage');
    return true;
  } catch (error: any) {
    console.warn('Supabase primary save error:', error?.message || error);
    return false;
  }
}

// Directly and permanently deletes a student from the Supabase PostgreSQL database
export async function deleteStudentFromSupabase(studentId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
      .from('students')
      .delete()
      .eq('student_id', studentId);
    if (error) {
      console.warn('Supabase delete student error:', error.message);
      return false;
    }
    console.log(`Student ${studentId} permanently deleted from Supabase`);
    return true;
  } catch (err) {
    console.warn('Supabase delete student error:', err);
    return false;
  }
}

// Directly upserts a single student record to Supabase
export async function saveSingleStudentToSupabase(student: any): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const studentId = student.id || student.studentId || 'std_' + Date.now();
    const { error } = await client
      .from('students')
      .upsert({
        student_id: studentId,
        owner: 'philipophitial1@gmail.com',
        data: student,
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_id' });
    if (error) {
      console.warn('Supabase save student error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase save student error:', err);
    return false;
  }
}

// Primary load function from Supabase PostgreSQL database
export async function loadSchoolDataFromSupabase() {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  try {
    const { data: schoolData, error: schoolError } = await client
      .from('schools')
      .select('*')
      .eq('id', 'ghanata_shs_main')
      .maybeSingle();

    if (schoolError || !schoolData) {
      return null;
    }

    const { data: studentsData } = await client
      .from('students')
      .select('data')
      .eq('owner', 'philipophitial1@gmail.com');

    const students = studentsData ? studentsData.map(s => s.data) : [];

    return {
      schoolInfo: schoolData.school_info,
      founder: schoolData.founder,
      headTeacher: schoolData.head_teacher,
      contactInfo: schoolData.contact_info,
      fanfare: schoolData.fanfare,
      ptaNotices: schoolData.pta_notices || undefined,
      courseConfigs: schoolData.course_configs || undefined,
      students: students.length > 0 ? students : undefined
    };
  } catch (error: any) {
    console.warn('Supabase primary load note:', error?.message || error);
    return null;
  }
}

// Real-time Postgres Changes subscription from Supabase for instant live additions and deletions
export function subscribeToSchoolDataSupabase(onDataUpdate: (data: {
  schoolInfo?: any;
  founder?: any;
  headTeacher?: any;
  contactInfo?: any;
  fanfare?: any;
  students?: any[];
  ptaNotices?: any[];
  courseConfigs?: any;
}) => void) {
  const client = getSupabaseClient();
  if (!client) {
    return () => {};
  }

  try {
    const channel = client
      .channel('public:ghanata_shs_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schools', filter: 'id=eq.ghanata_shs_main' },
        (payload: any) => {
          const newRecord = payload.new;
          if (newRecord) {
            onDataUpdate({
              schoolInfo: newRecord.school_info,
              founder: newRecord.founder,
              headTeacher: newRecord.head_teacher,
              contactInfo: newRecord.contact_info,
              fanfare: newRecord.fanfare,
              ptaNotices: newRecord.pta_notices,
              courseConfigs: newRecord.course_configs
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        async () => {
          const { data: studentsData } = await client
            .from('students')
            .select('data')
            .eq('owner', 'philipophitial1@gmail.com');
          if (studentsData) {
            onDataUpdate({
              students: studentsData.map(s => s.data)
            });
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (e) {
    console.warn('Supabase real-time channel note:', e);
    return () => {};
  }
}

export const SUPABASE_SETUP_SQL = `-- Run this in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
CREATE TABLE IF NOT EXISTS public.schools (
  id TEXT PRIMARY KEY,
  owner TEXT,
  school_info JSONB,
  founder JSONB,
  head_teacher JSONB,
  contact_info JSONB,
  fanfare JSONB,
  pta_notices JSONB,
  course_configs JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.students (
  student_id TEXT PRIMARY KEY,
  owner TEXT,
  data JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Row Level Security policies
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read access to schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public insert and update to schools" ON public.schools FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read access to students" ON public.students FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public insert and update to students" ON public.students FOR ALL USING (true);
`;
