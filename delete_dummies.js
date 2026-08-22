require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const emailsToDelete = ['alice@mit.edu', 'bob@mit.edu', 'charlie@stanford.edu', 'david@mit.edu'];
  
  const users = await db.collection('users').find({ email: { $in: emailsToDelete } }).toArray();
  const userIds = users.map(u => u._id);
  
  if (userIds.length > 0) {
    await db.collection('users').deleteMany({ email: { $in: emailsToDelete } });
    await db.collection('posts').deleteMany({ author: { $in: userIds } });
    await db.collection('club_memberships').deleteMany({ user: { $in: userIds } });
    await db.collection('connections').deleteMany({
      $or: [
        { requester: { $in: userIds } },
        { recipient: { $in: userIds } }
      ]
    });
    console.log(`Successfully deleted ${users.length} dummy users.`);
  } else {
    console.log('No dummy users found.');
  }
  process.exit(0);
});
