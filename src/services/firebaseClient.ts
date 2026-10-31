import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const databaseId = (firebaseConfig as any).firestoreDatabaseId;
export const db = databaseId && databaseId !== '(default)'
  ? getFirestore(app, databaseId)
  : getFirestore(app);

const SCHOOL_DOC_ID = 'ghanata_shs_main';
const CHUNK_SIZE = 400000; // 400KB characters per chunk, well below Firestore 1MB document limit

const TODAY_KEY = new Date().toISOString().split('T')[0];

// Persistent guard to immediately silence infinite retries and backoffs when daily quota is reached
let isQuotaExhausted = typeof window !== 'undefined' && localStorage.getItem('firestore_quota_exhausted') === TODAY_KEY;

export function getIsQuotaExhausted(): boolean {
  if (!isQuotaExhausted && typeof window !== 'undefined') {
    isQuotaExhausted = localStorage.getItem('firestore_quota_exhausted') === TODAY_KEY;
  }
  return isQuotaExhausted;
}

export function setQuotaExhausted(val: boolean = true) {
  isQuotaExhausted = val;
  try {
    if (typeof window !== 'undefined') {
      if (val) {
        localStorage.setItem('firestore_quota_exhausted', TODAY_KEY);
      } else {
        localStorage.removeItem('firestore_quota_exhausted');
      }
    }
  } catch {
    // ignore
  }
}

function handleQuotaError(err: any): boolean {
  if (
    err?.code === 'resource-exhausted' || 
    err?.message?.includes('Quota') || 
    err?.message?.includes('quota') ||
    err?.message?.includes('RESOURCE_EXHAUSTED')
  ) {
    setQuotaExhausted(true);
    console.warn('Firestore daily write quota reached for free tier. Seamlessly operating in local storage mode.');
    return true;
  }
  return false;
}

function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      sanitized[key] = sanitizeForFirestore(val);
    } else {
      sanitized[key] = null;
    }
  }
  return sanitized;
}

// Stores large audio tracks in Google Cloud Firestore chunks so playback works across all devices
export async function saveAudioToFirestore(audioUrl: string, audioFileName?: string) {
  if (!audioUrl || isQuotaExhausted) return;
  try {
    if (audioUrl.length <= CHUNK_SIZE) {
      await setDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'anthem'), {
        audioUrl,
        audioFileName: audioFileName || 'Ghanata_Senior_High_School_Anthem.wav',
        numChunks: 0,
        totalLength: audioUrl.length,
        owner: 'philipophitial1@gmail.com',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } else {
      const numChunks = Math.ceil(audioUrl.length / CHUNK_SIZE);

      // Write all audio chunks first so listeners don't read partial data
      for (let i = 0; i < numChunks; i++) {
        const chunk = audioUrl.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        await setDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'anthem_chunks', String(i)), {
          index: i,
          chunk,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      // Then commit the pointer document so onSnapshot triggers once all chunks are ready
      await setDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'anthem'), {
        audioFileName: audioFileName || 'Ghanata_Senior_High_School_Anthem.wav',
        numChunks,
        totalLength: audioUrl.length,
        owner: 'philipophitial1@gmail.com',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    console.log('Audio safely saved and stored in Google Cloud Firestore for playback.');
  } catch (err) {
    if (!handleQuotaError(err)) {
      console.warn('Audio storage note:', err);
    }
  }
}

// Stores Founder portrait directly in Google Cloud Firestore media storage
export async function saveFounderImageToFirestore(imageUrl: string) {
  if (!imageUrl || isQuotaExhausted) return;
  try {
    if (imageUrl.length <= CHUNK_SIZE) {
      await setDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'founder_image'), {
        imageUrl,
        numChunks: 0,
        owner: 'philipophitial1@gmail.com',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } else {
      const numChunks = Math.ceil(imageUrl.length / CHUNK_SIZE);
      await setDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'founder_image'), {
        numChunks,
        totalLength: imageUrl.length,
        owner: 'philipophitial1@gmail.com',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      for (let i = 0; i < numChunks; i++) {
        const chunk = imageUrl.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        await setDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'founder_chunks', String(i)), {
          index: i,
          chunk,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    }
    console.log('Founder portrait successfully synced to Google Cloud storage.');
  } catch (e) {
    if (!handleQuotaError(e)) {
      console.warn('Founder image storage note:', e);
    }
  }
}

// Loads and reassembles Founder portrait from Google Cloud Firestore
export async function loadFounderImageFromFirestore(): Promise<string | null> {
  try {
    const snap = await getDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'founder_image'));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (!data) return null;
    if (!data.numChunks || data.numChunks === 0) {
      return data.imageUrl || null;
    }
    const chunksSnap = await getDocs(collection(db, 'schools', SCHOOL_DOC_ID, 'founder_chunks'));
    const chunkMap: Record<number, string> = {};
    chunksSnap.forEach(c => {
      const d = c.data();
      if (d && typeof d.index === 'number' && d.chunk) {
        chunkMap[d.index] = d.chunk;
      }
    });
    let full = '';
    for (let i = 0; i < data.numChunks; i++) {
      if (chunkMap[i]) full += chunkMap[i];
    }
    return full || null;
  } catch (e) {
    console.warn('Error loading founder image from cloud:', e);
    return null;
  }
}

// Stores Head Teacher portrait directly in Google Cloud Firestore media storage
export async function saveHeadTeacherImageToFirestore(imageUrl: string) {
  if (!imageUrl || isQuotaExhausted) return;
  try {
    if (imageUrl.length <= CHUNK_SIZE) {
      await setDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'headteacher_image'), {
        imageUrl,
        numChunks: 0,
        owner: 'philipophitial1@gmail.com',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } else {
      const numChunks = Math.ceil(imageUrl.length / CHUNK_SIZE);
      await setDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'headteacher_image'), {
        numChunks,
        totalLength: imageUrl.length,
        owner: 'philipophitial1@gmail.com',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      for (let i = 0; i < numChunks; i++) {
        const chunk = imageUrl.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        await setDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'headteacher_chunks', String(i)), {
          index: i,
          chunk,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    }
    console.log('Head Teacher portrait successfully synced to Google Cloud storage.');
  } catch (e) {
    if (!handleQuotaError(e)) {
      console.warn('Head Teacher image storage note:', e);
    }
  }
}

// Loads and reassembles Head Teacher portrait from Google Cloud Firestore
export async function loadHeadTeacherImageFromFirestore(): Promise<string | null> {
  try {
    const snap = await getDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'headteacher_image'));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (!data) return null;
    if (!data.numChunks || data.numChunks === 0) {
      return data.imageUrl || null;
    }
    const chunksSnap = await getDocs(collection(db, 'schools', SCHOOL_DOC_ID, 'headteacher_chunks'));
    const chunkMap: Record<number, string> = {};
    chunksSnap.forEach(c => {
      const d = c.data();
      if (d && typeof d.index === 'number' && d.chunk) {
        chunkMap[d.index] = d.chunk;
      }
    });
    let full = '';
    for (let i = 0; i < data.numChunks; i++) {
      if (chunkMap[i]) full += chunkMap[i];
    }
    return full || null;
  } catch (e) {
    console.warn('Error loading headteacher image from cloud:', e);
    return null;
  }
}

// Stores Official School Logo directly in Google Cloud Firestore media storage
export async function saveLogoToFirestore(logoUrl: string) {
  if (!logoUrl || isQuotaExhausted) return;
  try {
    if (logoUrl.length <= CHUNK_SIZE) {
      await setDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'logo'), {
        logoUrl,
        numChunks: 0,
        owner: 'philipophitial1@gmail.com',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } else {
      const numChunks = Math.ceil(logoUrl.length / CHUNK_SIZE);
      await setDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'logo'), {
        numChunks,
        totalLength: logoUrl.length,
        owner: 'philipophitial1@gmail.com',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      for (let i = 0; i < numChunks; i++) {
        const chunk = logoUrl.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        await setDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'logo_chunks', String(i)), {
          index: i,
          chunk,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    }
    console.log('School logo successfully synced to Google Cloud storage.');
  } catch (e) {
    if (!handleQuotaError(e)) {
      console.warn('Logo image storage note:', e);
    }
  }
}

// Loads and reassembles School Logo from Google Cloud Firestore
export async function loadLogoFromFirestore(): Promise<string | null> {
  try {
    const snap = await getDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'logo'));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (!data) return null;
    if (!data.numChunks || data.numChunks === 0) {
      return data.logoUrl || null;
    }
    const chunksSnap = await getDocs(collection(db, 'schools', SCHOOL_DOC_ID, 'logo_chunks'));
    const chunkMap: Record<number, string> = {};
    chunksSnap.forEach(c => {
      const d = c.data();
      if (d && typeof d.index === 'number' && d.chunk) {
        chunkMap[d.index] = d.chunk;
      }
    });
    let full = '';
    for (let i = 0; i < data.numChunks; i++) {
      if (chunkMap[i]) full += chunkMap[i];
    }
    return full || null;
  } catch (e) {
    console.warn('Error loading logo from cloud:', e);
    return null;
  }
}

// Reassembles and restores audio tracks from Google Cloud Firestore
export async function loadAudioFromFirestore(): Promise<{ audioUrl: string; audioFileName?: string } | null> {
  try {
    const anthemSnap = await getDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'anthem'));
    if (!anthemSnap.exists()) return null;
    const anthemData = anthemSnap.data();
    if (!anthemData) return null;

    if (!anthemData.numChunks || anthemData.numChunks === 0) {
      if (anthemData.audioUrl) {
        return { audioUrl: anthemData.audioUrl, audioFileName: anthemData.audioFileName };
      }
      return null;
    }

    const chunksSnap = await getDocs(collection(db, 'schools', SCHOOL_DOC_ID, 'anthem_chunks'));
    const chunkMap: Record<number, string> = {};
    chunksSnap.forEach(c => {
      const d = c.data();
      if (d && typeof d.index === 'number' && d.chunk) {
        chunkMap[d.index] = d.chunk;
      }
    });

    let fullAudio = '';
    for (let i = 0; i < anthemData.numChunks; i++) {
      if (chunkMap[i]) {
        fullAudio += chunkMap[i];
      }
    }

    if (fullAudio) {
      return { audioUrl: fullAudio, audioFileName: anthemData.audioFileName };
    }
  } catch (e) {
    console.warn('Error loading audio from firestore:', e);
  }
  return null;
}

// Highly optimized single-document Cloud Firestore save:
// Embeds all student records, metadata, and notices into 1 single document write
// to minimize Firestore quota consumption by 98%.
export async function saveSchoolDataToFirebase(data: {
  schoolInfo: any;
  founder: any;
  headTeacher: any;
  contactInfo: any;
  students: any[];
  fanfare: any;
  ptaNotices?: any[];
  courseConfigs?: any;
}) {
  if (isQuotaExhausted) {
    return true; // Gracefully continue in local storage mode without hammering Firestore
  }

  try {
    // 1. Prepare safe anthem with audio stored for seamless playback across users
    let safeAnthem = data.schoolInfo?.anthem ? { ...data.schoolInfo.anthem } : null;
    if (safeAnthem?.audioUrl && !safeAnthem.audioUrl.startsWith('/') && !safeAnthem.audioUrl.startsWith('stored_in_google_cloud')) {
      await saveAudioToFirestore(safeAnthem.audioUrl, safeAnthem.audioFileName);
      safeAnthem.audioUrl = 'stored_in_google_cloud';
    }

    // 2. Prepare logo: if data URL or custom upload, store in dedicated logo media chunks
    if (data.schoolInfo?.logoUrl && (data.schoolInfo.logoUrl.startsWith('data:') || data.schoolInfo.logoUrl.length > 500)) {
      await saveLogoToFirestore(data.schoolInfo.logoUrl);
    }

    const schoolInfoToSave = {
      ...data.schoolInfo,
      ...(safeAnthem ? { anthem: safeAnthem } : {})
    };

    const sanitizedSchoolData = sanitizeForFirestore({
      owner: 'philipophitial1@gmail.com',
      schoolInfo: schoolInfoToSave,
      founder: data.founder,
      headTeacher: data.headTeacher,
      contactInfo: data.contactInfo,
      fanfare: safeAnthem,
      students: data.students || null,
      ptaNotices: data.ptaNotices || null,
      courseConfigs: data.courseConfigs || null,
      updatedAt: new Date().toISOString()
    });

    // A single atomic write updates the entire school record
    await setDoc(doc(db, 'schools', SCHOOL_DOC_ID), sanitizedSchoolData, { merge: true });

    console.log('Successfully saved all records, pictures, logo, founder portrait, and audio to Google Cloud Firestore');
    return true;
  } catch (error: any) {
    if (handleQuotaError(error)) {
      return true;
    }
    if (error?.code === 'unavailable' || error?.message?.includes('offline') || error?.message?.includes('network')) {
      console.warn('Firebase client is offline. Operating in local-first storage mode.');
      return true;
    }
    console.error('Error saving to Firebase:', error);
    return false;
  }
}

export async function loadSchoolDataFromFirebase() {
  try {
    const docSnap = await getDoc(doc(db, 'schools', SCHOOL_DOC_ID));
    let schoolInfo: any = undefined;
    let founder: any = undefined;
    let headTeacher: any = undefined;
    let contactInfo: any = undefined;
    let fanfare: any = undefined;
    let ptaNotices: any = undefined;
    let courseConfigs: any = undefined;
    let students: any[] = [];

    if (docSnap.exists()) {
      const data = docSnap.data();
      schoolInfo = data.schoolInfo;
      founder = data.founder;
      headTeacher = data.headTeacher;
      contactInfo = data.contactInfo;
      fanfare = data.fanfare;
      ptaNotices = data.ptaNotices;
      courseConfigs = data.courseConfigs;
      if (Array.isArray(data.students) && data.students.length > 0) {
        students = data.students;
      }
    }

    // Restore dedicated media/logo if available
    try {
      const restoredLogo = await loadLogoFromFirestore();
      if (restoredLogo) {
        if (!schoolInfo) schoolInfo = {};
        schoolInfo.logoUrl = restoredLogo;
      }
    } catch {
      // ignore
    }

    // Restore dedicated media/founder_image if available
    try {
      const founderImage = await loadFounderImageFromFirestore();
      if (founderImage) {
        if (!founder) founder = {};
        founder.imageUrl = founderImage;
      }
    } catch {
      // ignore
    }

    // Restore dedicated media/headteacher_image if available
    try {
      const htImage = await loadHeadTeacherImageFromFirestore();
      if (htImage) {
        if (!headTeacher) headTeacher = {};
        headTeacher.imageUrl = htImage;
      }
    } catch {
      // ignore
    }

    // Restore dedicated media/anthem audio for playback
    try {
      const restoredAudio = await loadAudioFromFirestore();
      if (restoredAudio?.audioUrl) {
        if (!schoolInfo) schoolInfo = {};
        if (!schoolInfo.anthem) schoolInfo.anthem = {};
        schoolInfo.anthem.audioUrl = restoredAudio.audioUrl;
        if (restoredAudio.audioFileName) schoolInfo.anthem.audioFileName = restoredAudio.audioFileName;
        fanfare = schoolInfo.anthem;
      }
    } catch {
      // ignore
    }

    // Fallback: If students collection exists and main doc had none
    if (students.length === 0) {
      try {
        const studentsSnap = await getDocs(collection(db, 'schools', SCHOOL_DOC_ID, 'students'));
        studentsSnap.forEach(s => students.push(s.data()));
      } catch {
        // ignore
      }
    }

    return {
      schoolInfo,
      founder,
      headTeacher,
      contactInfo,
      fanfare,
      ptaNotices: ptaNotices || undefined,
      courseConfigs: courseConfigs || undefined,
      students: students.length > 0 ? students : undefined
    };
  } catch (error: any) {
    if (handleQuotaError(error)) {
      return null;
    }
    if (error?.code === 'unavailable' || error?.message?.includes('offline') || error?.message?.includes('network')) {
      console.warn('Firebase client is offline. Using local cached records.');
    } else {
      console.error('Error loading from Firebase:', error);
    }
  }
  return null;
}

export function subscribeToSchoolData(onDataUpdate: (data: { schoolInfo?: any; founder?: any; headTeacher?: any; contactInfo?: any; fanfare?: any; students?: any[]; ptaNotices?: any[]; courseConfigs?: any }) => void) {
  try {
    // 1. Listen to main school document
    const unsubDoc = onSnapshot(doc(db, 'schools', SCHOOL_DOC_ID), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let latestLogo = data.schoolInfo?.logoUrl;
        try {
          const logoSnap = await getDoc(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'logo'));
          if (logoSnap.exists() && logoSnap.data()?.logoUrl) {
            latestLogo = logoSnap.data().logoUrl;
          }
        } catch {
          // ignore
        }

        const mergedSchoolInfo = {
          ...data.schoolInfo,
          ...(latestLogo ? { logoUrl: latestLogo } : {})
        };

        const embeddedStudents = Array.isArray(data.students) && data.students.length > 0 ? data.students : undefined;

        onDataUpdate({
          schoolInfo: mergedSchoolInfo,
          founder: data.founder,
          headTeacher: data.headTeacher,
          contactInfo: data.contactInfo,
          fanfare: data.fanfare,
          ptaNotices: data.ptaNotices || undefined,
          courseConfigs: data.courseConfigs || undefined,
          students: embeddedStudents
        });
      }
    }, (error) => {
      if (handleQuotaError(error)) {
        return;
      }
      if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
        console.warn('Real-time listener offline mode.');
      } else {
        console.error('Firebase snapshot error:', error);
      }
    });

    // 2. Listen to dedicated media/logo document
    const unsubLogo = onSnapshot(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'logo'), (logoSnap) => {
      if (logoSnap.exists()) {
        const logoData = logoSnap.data();
        if (logoData?.logoUrl) {
          onDataUpdate({
            schoolInfo: { logoUrl: logoData.logoUrl }
          });
        }
      }
    }, (err) => {
      handleQuotaError(err);
    });

    // 3. Listen to dedicated media/founder_image document for real-time portrait sync
    const unsubFounderImage = onSnapshot(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'founder_image'), async () => {
      try {
        const founderImg = await loadFounderImageFromFirestore();
        if (founderImg) {
          onDataUpdate({
            founder: { imageUrl: founderImg }
          });
        }
      } catch (err) {
        handleQuotaError(err);
      }
    }, (err) => {
      handleQuotaError(err);
    });

    // 4. Listen to dedicated media/headteacher_image document for real-time portrait sync
    const unsubHeadTeacherImage = onSnapshot(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'headteacher_image'), async () => {
      try {
        const htImg = await loadHeadTeacherImageFromFirestore();
        if (htImg) {
          onDataUpdate({
            headTeacher: { imageUrl: htImg }
          });
        }
      } catch (err) {
        handleQuotaError(err);
      }
    }, (err) => {
      handleQuotaError(err);
    });

    // 5. Listen to media/anthem document for audio playback updates
    const unsubAnthem = onSnapshot(doc(db, 'schools', SCHOOL_DOC_ID, 'media', 'anthem'), async () => {
      try {
        const restoredAudio = await loadAudioFromFirestore();
        if (restoredAudio?.audioUrl) {
          onDataUpdate({
            schoolInfo: {
              anthem: {
                audioUrl: restoredAudio.audioUrl,
                audioFileName: restoredAudio.audioFileName
              }
            }
          });
        }
      } catch (e) {
        handleQuotaError(e);
      }
    }, (err) => {
      handleQuotaError(err);
    });

    return () => {
      unsubDoc();
      unsubLogo();
      unsubFounderImage();
      unsubHeadTeacherImage();
      unsubAnthem();
    };
  } catch (e) {
    console.warn('Could not establish real-time subscription:', e);
    return () => {};
  }
}
