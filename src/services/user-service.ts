import { doc, setDoc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/config/firebase";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Save or update user profile in Firestore
 */
export async function saveUserProfile(uid: string, email: string, displayName: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  const now = new Date();

  const existingUser = await getDoc(userRef);

  if (existingUser.exists()) {
    // Update existing user
    await setDoc(userRef, {
      uid,
      email,
      displayName,
      updatedAt: now,
    }, { merge: true });
  } else {
    // Create new user
    await setDoc(userRef, {
      uid,
      email,
      displayName,
      createdAt: now,
      updatedAt: now,
    });
  }
}

/**
 * Get user profile by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }

  return null;
}

/**
 * Get multiple user profiles by UIDs
 */
export async function getUserProfiles(uids: string[]): Promise<UserProfile[]> {
  if (uids.length === 0) return [];

  // Firestore has a limit of 10 items for 'in' queries
  // If we have more than 10, we need to batch the queries
  const batchSize = 10;
  const profiles: UserProfile[] = [];

  for (let i = 0; i < uids.length; i += batchSize) {
    const batch = uids.slice(i, i + batchSize);
    const q = query(collection(db, "users"), where("uid", "in", batch));
    const snapshot = await getDocs(q);

    snapshot.docs.forEach((doc) => {
      profiles.push(doc.data() as UserProfile);
    });
  }

  return profiles;
}
