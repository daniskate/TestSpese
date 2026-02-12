import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useParams } from "react-router";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Group, Expense, Member } from "@/types";
import { useCurrentMember } from "@/hooks/useCurrentMember";
import { addRecentGroup } from "@/hooks/useRecentGroups";
import { calculateDebts, getMemberBalance } from "@/lib/debt-calculator";
import type { Debt } from "@/types";

interface GroupContextValue {
  group: Group | null;
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  currentMemberId: string | null;
  currentMember: Member | null;
  selectMember: (memberId: string) => void;
  clearMember: () => void;
  debts: Debt[];
  getMemberBalanceValue: (memberId: string) => number;
}

const GroupContext = createContext<GroupContextValue | null>(null);

export function GroupProvider({ children }: { children: ReactNode }) {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentMemberId, selectMember, clearMember } = useCurrentMember(
    groupId ?? ""
  );

  // Listen to group document
  useEffect(() => {
    if (!groupId) return;

    const unsubscribe = onSnapshot(
      doc(db, "groups", groupId),
      (snap) => {
        if (snap.exists()) {
          setGroup(snap.data() as Group);
          setError(null);
        } else {
          setGroup(null);
          setError("Gruppo non trovato");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Group listener error:", err);
        setError("Errore nel caricamento del gruppo");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [groupId]);

  // Auto-join: Add current user to group if not already in userIds
  useEffect(() => {
    async function autoJoinGroup() {
      if (!group || !groupId || !user) return;

      // Check if user is already in the group
      const userIds = group.userIds || [];
      if (userIds.includes(user.uid)) {
        // User already has access
        return;
      }

      try {
        // Add user to group's userIds
        console.log("🔗 Auto-joining group via shared link:", group.name);
        await updateDoc(doc(db, "groups", groupId), {
          userIds: arrayUnion(user.uid),
          // Also set userId if not set (for backwards compatibility)
          ...((!group.userId) && { userId: user.uid }),
        });
        console.log("✅ Successfully joined group:", group.name);
      } catch (error) {
        console.error("❌ Error auto-joining group:", error);
      }
    }

    autoJoinGroup();
  }, [group, groupId, user]);

  // Save to recent groups when loaded
  useEffect(() => {
    if (group && groupId) {
      addRecentGroup({
        id: groupId,
        name: group.name,
        memberCount: group.members.length,
        lastVisited: Date.now(),
      });
    }
  }, [group, groupId]);

  // Listen to expenses sub-collection
  useEffect(() => {
    if (!groupId) return;

    const expensesRef = collection(db, "groups", groupId, "expenses");
    const q = query(expensesRef, orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Expense[];
        setExpenses(data);
      },
      (err) => {
        console.error("Expenses listener error:", err);
      }
    );

    return unsubscribe;
  }, [groupId]);

  const currentMember =
    group?.members.find((m) => m.id === currentMemberId) ?? null;

  const debts = group
    ? calculateDebts(expenses, group.settlements, group.members)
    : [];

  const getMemberBalanceValue = (memberId: string) =>
    getMemberBalance(memberId, expenses, group?.settlements ?? []);

  return (
    <GroupContext.Provider
      value={{
        group,
        expenses,
        loading,
        error,
        currentMemberId,
        currentMember,
        selectMember,
        clearMember,
        debts,
        getMemberBalanceValue,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error("useGroup must be used within a GroupProvider");
  }
  return context;
}
