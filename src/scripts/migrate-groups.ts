/**
 * Migration script to add userIds to existing groups
 *
 * This script adds userId and userIds fields to all groups that don't have them.
 * Run this once after implementing authentication to make existing groups visible.
 *
 * Usage:
 * 1. Open browser console on your deployed app
 * 2. Copy and paste this function
 * 3. Call: await migrateGroupsToAuth("YOUR_USER_ID")
 *
 * Or run via Node.js with Firebase Admin SDK
 */

import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

export async function migrateGroupsToAuth(userId: string) {
  if (!userId) {
    console.error("Please provide a valid user ID");
    return;
  }

  console.log("🔄 Starting migration...");
  console.log("User ID:", userId);

  try {
    const groupsRef = collection(db, "groups");
    const snapshot = await getDocs(groupsRef);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const groupDoc of snapshot.docs) {
      const data = groupDoc.data();

      // Skip if already has userIds
      if (data.userIds && Array.isArray(data.userIds) && data.userIds.length > 0) {
        console.log(`⏭️  Skipped: ${data.name} (already has userIds)`);
        skipped++;
        continue;
      }

      try {
        await updateDoc(doc(db, "groups", groupDoc.id), {
          userId: userId,
          userIds: [userId],
        });
        console.log(`✅ Updated: ${data.name}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating ${data.name}:`, error);
        errors++;
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`  ✅ Updated: ${updated}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log(`  📦 Total: ${snapshot.docs.length}`);
    console.log("\n✨ Migration complete!");

  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

// For browser console usage
if (typeof window !== "undefined") {
  (window as any).migrateGroupsToAuth = migrateGroupsToAuth;
  console.log("💡 Migration function loaded! Call: await migrateGroupsToAuth('YOUR_USER_ID')");
}
