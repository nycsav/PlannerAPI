import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firebaseConfig } from './utils/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixMondayMoves() {
  console.log('Starting migration: Replacing "Monday move" with "Next move"...');
  
  const cardsRef = collection(db, 'discover_cards');
  const snapshot = await getDocs(cardsRef);
  
  let updatedCount = 0;
  
  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();
    
    if (data.moves && Array.isArray(data.moves)) {
      const updatedMoves = data.moves.map((move: string) => 
        move.replace(/Your Monday move:/gi, 'Next move:')
           .replace(/Monday move:/gi, 'Next move:')
      );
      
      // Only update if something changed
      if (JSON.stringify(updatedMoves) !== JSON.stringify(data.moves)) {
        await updateDoc(doc(db, 'discover_cards', docSnapshot.id), {
          moves: updatedMoves
        });
        console.log(`✅ Updated: ${docSnapshot.id}`);
        updatedCount++;
      }
    }
  }
  
  console.log(`\n🎉 Migration complete! Updated ${updatedCount} documents.`);
}

fixMondayMoves().catch(console.error);
