import db from './src/server/lib/db.js';
import User from './src/server/models/User.js';
import IdVerificationQueue from './src/server/models/IdVerificationQueue.js';

async function run() {
  await db();
  const pendingUsers = await User.find({ status: 'pending_review' });
  let count = 0;
  for (const u of pendingUsers) {
    const exists = await IdVerificationQueue.findOne({ user: u._id, status: 'pending' });
    if (!exists) {
      await IdVerificationQueue.create({
        user: u._id,
        imageUrl: u.verification_document || 'https://dummyimage.com/600x400/ccc/000.png&text=Dev+ID+Upload',
        status: 'pending'
      });
      count++;
    }
  }
  console.log('Synced', count, 'users to queue');
  process.exit(0);
}
run();
