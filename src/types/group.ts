import type { Timestamp } from "firebase/firestore";

export interface Member {
  id: string;
  name: string;
  color: string;
  createdAt: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Settlement {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  date: Timestamp;
  createdAt: Timestamp;
  note: string;
}

export interface Group {
  id: string;
  name: string;
  color?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  members: Member[];
  categories: Category[];
  settlements: Settlement[];
}
