const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function deleteUsers() {
  const clerk = require('@clerk/backend');
  
  const client = clerk.createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  const emails = ['sayanblp@gmail.com', 'senaldo1307@gmail.com', 'deysantoshkumar70@gmail.com'];
  
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  for (const email of emails) {
    try {
      const users = await client.users.getUserList({ emailAddress: [email] });
      if (users.data && users.data.length > 0) {
        await client.users.deleteUser(users.data[0].id);
        console.log(`Deleted ${email} from Clerk`);
      } else {
        console.log(`${email} not found in Clerk`);
      }

      const res = await mongoose.connection.collection('users').deleteMany({ email: email });
      console.log(`Deleted ${res.deletedCount} instances of ${email} from MongoDB`);
    } catch (e) {
      console.error(`Error deleting ${email}:`, e.message);
    }
  }

  process.exit(0);
}

deleteUsers().catch(console.error);
