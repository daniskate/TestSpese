import { useState, useCallback } from "react";

const STORAGE_KEY_PREFIX = "spesedivise_member_";

export function useCurrentMember(groupId: string) {
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`${STORAGE_KEY_PREFIX}${groupId}`);
    } catch {
      return null;
    }
  });

  const selectMember = useCallback(
    (memberId: string) => {
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${groupId}`, memberId);
      } catch {
        // localStorage not available
      }
      setCurrentMemberId(memberId);
    },
    [groupId]
  );

  const clearMember = useCallback(() => {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${groupId}`);
    } catch {
      // localStorage not available
    }
    setCurrentMemberId(null);
  }, [groupId]);

  return { currentMemberId, selectMember, clearMember };
}
