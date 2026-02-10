import { useState, useCallback } from "react";

const STORAGE_KEY = "spesedivise_recent_groups";

export interface RecentGroup {
  id: string;
  name: string;
  memberCount: number;
  lastVisited: number;
}

function loadGroups(): RecentGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentGroup[];
  } catch {
    return [];
  }
}

function saveGroups(groups: RecentGroup[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch {
    // localStorage not available
  }
}

export function addRecentGroup(group: RecentGroup) {
  const groups = loadGroups();
  const filtered = groups.filter((g) => g.id !== group.id);
  const updated = [group, ...filtered].slice(0, 20);
  saveGroups(updated);
}

export function useRecentGroups() {
  const [groups, setGroups] = useState<RecentGroup[]>(loadGroups);

  const refresh = useCallback(() => {
    setGroups(loadGroups());
  }, []);

  const removeGroup = useCallback(
    (groupId: string) => {
      const updated = groups.filter((g) => g.id !== groupId);
      saveGroups(updated);
      setGroups(updated);
    },
    [groups]
  );

  return { groups, refresh, removeGroup };
}
