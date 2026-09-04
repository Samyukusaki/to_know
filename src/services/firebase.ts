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

// Convert undefined fields to avoid Firestore errors
function cleanVideoPayload(video: VideoItem): Record<string, any> {
  const data: Record<string, any> = { ...video };
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) {
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
