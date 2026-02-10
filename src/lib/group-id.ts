import { nanoid } from "nanoid";

export function generateGroupId(): string {
  return nanoid(12);
}

export function generateMemberId(): string {
  return nanoid(8);
}

export function generateCategoryId(): string {
  return nanoid(8);
}

export function generateSettlementId(): string {
  return nanoid(8);
}
