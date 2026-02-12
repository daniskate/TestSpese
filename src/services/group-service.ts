import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Group, Member, Settlement } from "@/types";
import { generateGroupId, generateMemberId, generateSettlementId } from "@/lib/group-id";
import { createDefaultCategories, MEMBER_COLORS } from "@/lib/default-categories";
import type { Timestamp } from "firebase/firestore";

export async function createGroup(name: string, userId: string): Promise<string> {
  const id = generateGroupId();
  const now = serverTimestamp();

  await setDoc(doc(db, "groups", id), {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    members: [],
    categories: createDefaultCategories(),
    settlements: [],
    userId, // Owner of the group
    userIds: [userId], // Array of users with access
  });

  return id;
}

export async function createGroupWithMembers(
  name: string,
  memberNames: string[],
  color: string,
  userId: string,
  icon: string = "👥"
): Promise<string> {
  const id = generateGroupId();
  const now = serverTimestamp();
  const currentDate = new Date();

  const members: Member[] = memberNames.map((memberName, index) => ({
    id: generateMemberId(),
    name: memberName,
    color: MEMBER_COLORS[index % MEMBER_COLORS.length]!,
    createdAt: currentDate as unknown as Timestamp,
  }));

  await setDoc(doc(db, "groups", id), {
    id,
    name,
    color,
    icon,
    createdAt: now,
    updatedAt: now,
    members,
    categories: createDefaultCategories(),
    settlements: [],
    userId, // Owner of the group
    userIds: [userId], // Array of users with access
  });

  return id;
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const snap = await getDoc(doc(db, "groups", groupId));
  if (!snap.exists()) return null;
  return snap.data() as Group;
}

export async function addMember(
  groupId: string,
  name: string,
  existingMembers: Member[]
): Promise<Member> {
  const member: Member = {
    id: generateMemberId(),
    name,
    color: MEMBER_COLORS[existingMembers.length % MEMBER_COLORS.length]!,
    createdAt: serverTimestamp() as unknown as Timestamp,
  };

  await updateDoc(doc(db, "groups", groupId), {
    members: arrayUnion(member),
    updatedAt: serverTimestamp(),
  });

  return member;
}

export async function addSettlement(
  groupId: string,
  fromMemberId: string,
  toMemberId: string,
  amount: number,
  note: string = ""
): Promise<void> {
  const now = new Date();
  const settlement: Settlement = {
    id: generateSettlementId(),
    fromMemberId,
    toMemberId,
    amount,
    date: now as unknown as Timestamp,
    createdAt: now as unknown as Timestamp,
    note,
  };

  await updateDoc(doc(db, "groups", groupId), {
    settlements: arrayUnion(settlement),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCategories(
  groupId: string,
  categories: Group["categories"]
): Promise<void> {
  await updateDoc(doc(db, "groups", groupId), {
    categories,
    updatedAt: serverTimestamp(),
  });
}

export async function removeSettlement(
  groupId: string,
  settlement: Settlement
): Promise<void> {
  await updateDoc(doc(db, "groups", groupId), {
    settlements: arrayRemove(settlement),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGroup(groupId: string): Promise<void> {
  // Delete all expenses in the subcollection first
  const expensesRef = collection(db, "groups", groupId, "expenses");
  const expensesSnapshot = await getDocs(expensesRef);

  // Delete all expense documents
  const deletePromises = expensesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // Delete the group document itself
  await deleteDoc(doc(db, "groups", groupId));
}

export async function updateGroupColor(
  groupId: string,
  color: string
): Promise<void> {
  await updateDoc(doc(db, "groups", groupId), {
    color,
    updatedAt: serverTimestamp(),
  });
}

export async function updateMemberColor(
  groupId: string,
  memberId: string,
  color: string,
  members: Member[]
): Promise<void> {
  const updatedMembers = members.map((m) =>
    m.id === memberId ? { ...m, color } : m
  );

  await updateDoc(doc(db, "groups", groupId), {
    members: updatedMembers,
    updatedAt: serverTimestamp(),
  });
}
