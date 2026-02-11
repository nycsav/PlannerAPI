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

async function dedupe() {
  const snapshot = await db.collection('discover_cards').get();
  const byTitle = {};

  snapshot.docs.forEach(doc => {
    const title = doc.data().title;
    if (!byTitle[title]) byTitle[title] = [];
    byTitle[title].push({ id: doc.id, createdAt: doc.data().createdAt });
  });

  let deleteCount = 0;
  const batch = db.batch();

  for (const [title, docs] of Object.entries(byTitle)) {
    if (docs.length > 1) {
      console.log('Duplicate: ' + title + ' (' + docs.length + ' copies)');
      docs.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      // Keep newest, delete the rest
      docs.slice(1).forEach(d => {
        batch.delete(db.collection('discover_cards').doc(d.id));
        deleteCount++;
      });
    }
  }

  if (deleteCount > 0) {
    await batch.commit();
    console.log('Deleted ' + deleteCount + ' duplicates');
  } else {
    console.log('No duplicates found');
  }
}

dedupe().catch(e => console.error(e));
