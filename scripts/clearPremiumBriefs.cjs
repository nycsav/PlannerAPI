/**
 * Clear all documents from premium_briefs collection
 */
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'plannerapi-prod',
  });
}

const db = admin.firestore();

async function clearCollection() {
  console.log('🗑️  Clearing premium_briefs collection...\n');

  try {
    const snapshot = await db.collection('premium_briefs').get();
    console.log(`Found ${snapshot.size} documents to delete\n`);

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
      console.log(`  Deleting: ${doc.id}`);
    });

    await batch.commit();
    console.log('\n✅ Collection cleared successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

clearCollection();
