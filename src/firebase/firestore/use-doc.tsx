'use client';
    
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

const isTimestamp = (value: any): value is Timestamp => {
  return value && typeof value.toDate === 'function';
};

const convertTimestamps = <T>(data: T): T => {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => convertTimestamps(item)) as any;
  }

  const newData = { ...data };
  for (const key in newData) {
    const value = newData[key as keyof T];
    if (isTimestamp(value)) {
      (newData as any)[key] = value.toDate();
    } else if (typeof value === 'object' && value !== null) {
      (newData as any)[key] = convertTimestamps(value);
    }
  }

  return newData;
};


/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
  setData: Dispatch<SetStateAction<WithId<T> | null>>;
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Handles nullable references.
 * 
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {DocumentReference<DocumentData> | null | undefined} docRef -
 * The Firestore DocumentReference. Waits if null/undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
export function useDoc<T = any>(
  memoizedDocRef: (DocumentReference<DocumentData> & {__memo?: boolean}) | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // If the doc ref is null/undefined (e.g., waiting for user), don't fetch.
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false); // Not loading because we are not fetching.
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
           const docData = convertTimestamps(snapshot.data() as T);
           setData({ ...docData, id: snapshot.id });
        } else {
          // Document does not exist
          setData(null);
        }
        setError(null); // Clear any previous error on successful snapshot (even if doc doesn't exist)
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        // trigger global error propagation
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]); // Re-run if the memoizedDocRef changes.

  return { data, isLoading, error, setData };
}
