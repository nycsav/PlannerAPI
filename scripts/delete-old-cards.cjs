const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
  const serviceAccount = require(path.resolve(__dirname, '..', 'plannerapi-firebase-adminsdk.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'plannerapi-prod'
  });
}

const db = admin.firestore();
const start = new Date('2026-02-11T06:00:00.000Z'); // 1:00 AM EST
const end = new Date('2026-02-11T11:00:00.000Z');   // 6:00 AM EST

async function deleteOldCards() {
  const snapshot = await db.collection('discover_cards')
    .where('createdAt', '>=', start)
    .where('createdAt', '<', end)
    .get();

  console.log('Found ' + snapshot.size + ' documents to delete');

  if (snapshot.size === 0) {
    console.log('Nothing to delete');
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log('Deleted ' + snapshot.size + ' documents');
}

deleteOldCards().catch(e => console.error(e));
