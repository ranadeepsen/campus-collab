require('dotenv').config({ path: '.env.local' });

async function deleteUsers() {
  const clerk = require('@clerk/backend');
  const client = clerk.createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  const emails = ['sayanblp@gmail.com', 'senaldo1307@gmail.com', 'deysantoshkumar70@gmail.com'];
  
  for (const email of emails) {
    try {
      const users = await client.users.getUserList({ emailAddress: [email] });
      if (users.data && users.data.length > 0) {
        await client.users.deleteUser(users.data[0].id);
        console.log(`Deleted ${email} from Clerk (Webhook will wipe from MongoDB)`);
      } else {
        console.log(`${email} not found in Clerk`);
      }
    } catch (e) {
      console.error(`Error deleting ${email}:`, e.message);
    }
  }
}

deleteUsers().catch(console.error);
