/**
 * Firestore Migration Script: Update "Monday move" to "Next move"
 *
 * This script updates all documents in the 'discover_cards' collection,
 * replacing any text that says "Your Monday move:" or "Monday move:"
 * with "Next move:" in the moves array.
 *
 * Usage:
 *   npx ts-node scripts/migrate-monday-move.ts
 */

import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin
// Try to use service account first, then fall back to application default credentials
if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.join(__dirname, '../functions/serviceAccountKey.json');
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized with service account');
  } catch (error) {
    // Fall back to application default credentials (works if Firebase CLI is logged in)
    try {
      admin.initializeApp({
        projectId: 'plannerapi-prod'
      });
      console.log('✅ Firebase Admin initialized with application default credentials');
    } catch (fallbackError) {
      console.error('❌ Error initializing Firebase Admin');
      console.error('   Make sure you are logged in with Firebase CLI: firebase login');
      console.error('   Or download serviceAccountKey.json from Firebase Console');
      process.exit(1);
    }
  }
}

const db = admin.firestore();

async function migrateMondayMove() {
  console.log('\n========================================');
  console.log('🚀 STARTING MIGRATION');
  console.log('========================================\n');

  try {
    // Fetch all documents from discover_cards collection
    const cardsRef = db.collection('discover_cards');
    const snapshot = await cardsRef.get();

    if (snapshot.empty) {
      console.log('ℹ️  No documents found in discover_cards collection');
      return;
    }

    console.log(`📊 Found ${snapshot.size} documents to process\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    const batch = db.batch();
    let batchCount = 0;
    const MAX_BATCH_SIZE = 500; // Firestore batch write limit

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const moves = data.moves;

      if (!moves || !Array.isArray(moves)) {
        console.log(`⏭️  Skipping ${doc.id}: no moves array`);
        skippedCount++;
        continue;
      }

      // Check if any move contains "Monday move" or "Your Monday move"
      const needsUpdate = moves.some((move: string) =>
        move.includes('Monday move:') || move.includes('Your Monday move:')
      );

      if (!needsUpdate) {
        skippedCount++;
        continue;
      }

      // Replace "Monday move:" and "Your Monday move:" with "Next move:"
      const updatedMoves = moves.map((move: string) =>
        move
          .replace(/Your Monday move:/gi, 'Next move:')
          .replace(/Monday move:/gi, 'Next move:')
      );

      // Add update to batch
      batch.update(doc.ref, { moves: updatedMoves });
      batchCount++;
      updatedCount++;

      console.log(`✏️  Updating ${doc.id}:`);
      console.log(`   Before: ${moves[0].substring(0, 50)}...`);
      console.log(`   After:  ${updatedMoves[0].substring(0, 50)}...\n`);

      // Commit batch if we've reached the limit
      if (batchCount >= MAX_BATCH_SIZE) {
        console.log(`💾 Committing batch of ${batchCount} updates...`);
        await batch.commit();
        batchCount = 0;
      }
    }

    // Commit any remaining updates
    if (batchCount > 0) {
      console.log(`💾 Committing final batch of ${batchCount} updates...`);
      await batch.commit();
    }

    console.log('\n========================================');
    console.log('✅ MIGRATION COMPLETE');
    console.log('========================================');
    console.log(`📈 Updated: ${updatedCount} documents`);
    console.log(`⏭️  Skipped: ${skippedCount} documents (already migrated or no moves)`);
    console.log(`📊 Total processed: ${snapshot.size} documents\n`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateMondayMove()
  .then(() => {
    console.log('🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
