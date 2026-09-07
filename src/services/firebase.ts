import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { VideoItem } from '../types/video';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// CRITICAL: Must use firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const VIDEOS_COLLECTION = 'videos';

// Convert undefined fields and sanitize values to avoid Firestore rule errors
function cleanVideoPayload(video: VideoItem): Record<string, any> {
  const data: Record<string, any> = { ...video };

  // Sanitize id: must be string matching ^[a-zA-Z0-9_\-]+$
  if (!data.id || typeof data.id !== 'string' || !/^[a-zA-Z0-9_\-]+$/.test(data.id)) {
    data.id = `tk-${Date.now()}`;
  }

  // Sanitize url: must not be empty or raw base64 data
  if (
    !data.url ||
    typeof data.url !== 'string' ||
    data.url.length < 5 ||
    data.url.startsWith('data:') ||
    data.url.startsWith('blob:')
  ) {
    data.url = 'https://www.facebook.com/share/1DpGT8ZZ7y/?mibextid=wwXIfr';
  }

  // Ensure title is present and valid string
  if (!data.title || typeof data.title !== 'string') {
    data.title = 'វីដេអូចំណេះដឹង នាំដឹង - To Know';
  }

  // Sanitize platform
  const validPlatforms = ['facebook', 'youtube', 'direct', 'other'];
  if (!validPlatforms.includes(data.platform)) {
    data.platform = 'facebook';
  }

  // Sanitize category
  const validCategories = [
    'បច្ចេកវិទ្យា',
    'វិទ្យាសាស្ត្រ',
    'ចំណេះដឹងទូទៅ',
    'ប្រវត្តិសាស្ត្រ',
    'សុខភាព & ខួរក្បាល',
    'គន្លឹះខ្លីៗ',
  ];
  if (!validCategories.includes(data.category)) {
    data.category = 'ចំណេះដឹងទូទៅ';
  }

  // Sanitize status
  const validStatuses = ['published', 'draft', 'scheduled'];
  if (!validStatuses.includes(data.status)) {
    data.status = 'published';
  }

  // If embedUrl is base64 or invalid, remove it
  if (data.embedUrl && (data.embedUrl.startsWith('data:') || data.embedUrl.startsWith('blob:'))) {
    delete data.embedUrl;
  }

  // Remove undefined or null properties
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined || data[key] === null) {
      delete data[key];
    }
  });

  return data;
}

/**
 * Real-time subscription to all videos from Firestore
 */
export function subscribeToVideos(
  onSuccess: (videos: VideoItem[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  try {
    const colRef = collection(db, VIDEOS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: VideoItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as VideoItem);
        });
        onSuccess(items);
      },
      (error) => {
        onError?.(error);
        console.warn('Firestore subscription fallback to local cache:', error);
      }
    );
  } catch (error) {
    onError?.(error);
    console.warn('Firestore collection access failed, fallback to local storage:', error);
    return () => {};
  }
}

/**
 * Save / Update a single video in Firestore
 */
export async function saveVideoToCloud(video: VideoItem): Promise<void> {
  const docPath = `${VIDEOS_COLLECTION}/${video.id}`;
  try {
    const docRef = doc(db, VIDEOS_COLLECTION, video.id);
    await setDoc(docRef, cleanVideoPayload(video), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Delete a video from Firestore
 */
export async function deleteVideoFromCloud(videoId: string): Promise<void> {
  const docPath = `${VIDEOS_COLLECTION}/${videoId}`;
  try {
    const docRef = doc(db, VIDEOS_COLLECTION, videoId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * Seed or batch import videos to Cloud Firestore
 */
export async function batchSaveVideosToCloud(videos: VideoItem[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    videos.forEach((v) => {
      const docRef = doc(db, VIDEOS_COLLECTION, v.id);
      batch.set(docRef, cleanVideoPayload(v), { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, VIDEOS_COLLECTION);
  }
}

/**
 * Reset all videos on Cloud with provided default dataset
 */
export async function resetCloudVideos(defaultVideos: VideoItem[]): Promise<void> {
  try {
    // Delete existing
    const colRef = collection(db, VIDEOS_COLLECTION);
    const existingSnap = await getDocs(colRef);
    const batch = writeBatch(db);
    existingSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    // Add default videos
    defaultVideos.forEach((v) => {
      const docRef = doc(db, VIDEOS_COLLECTION, v.id);
      batch.set(docRef, cleanVideoPayload(v));
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, VIDEOS_COLLECTION);
  }
}

/**
 * Google Sign In Helper
 */
export async function signInWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

/**
 * Sign out helper
 */
export async function logOut() {
  return await signOut(auth);
}

const SETTINGS_COLLECTION = 'app_settings';
const SECURITY_DOC_ID = 'security';

/**
 * Real-time listener for Admin Passcode across all devices & browsers
 */
export function subscribeToAdminPasscode(
  onPasscodeChange: (passcode: string) => void
): Unsubscribe {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SECURITY_DOC_ID);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && typeof data.passcode === 'string' && data.passcode.trim()) {
            onPasscodeChange(data.passcode.trim());
          }
        }
      },
      (error) => {
        console.warn('Firestore security settings listener notice:', error);
      }
    );
  } catch (error) {
    console.warn('Failed to subscribe to security passcode in Firestore:', error);
    return () => {};
  }
}

/**
 * Persist new Admin Passcode to Cloud Firestore so all devices update immediately
 */
export async function updateAdminPasscodeInCloud(newPasscode: string): Promise<void> {
  const docPath = `${SETTINGS_COLLECTION}/${SECURITY_DOC_ID}`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SECURITY_DOC_ID);
    await setDoc(
      docRef,
      {
        passcode: newPasscode.trim(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

