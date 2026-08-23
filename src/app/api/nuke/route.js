import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';

export async function POST(req) {
  try {
    const { emails } = await req.json();
    await connectDB();
    const client = await clerkClient();

    let deletedCount = 0;
    let errors = [];

    for (const email of emails) {
      try {
        // 1. Find user in Clerk by email
        const clerkUsers = await client.users.getUserList({ emailAddress: [email] });
        if (clerkUsers.data && clerkUsers.data.length > 0) {
          const clerkId = clerkUsers.data[0].id;
          
          // 2. Delete from Clerk
          await client.users.deleteUser(clerkId);
          console.log(Deleted  from Clerk);

          // 3. Delete from MongoDB
          await User.deleteMany({ email: email });
          console.log(Deleted  from MongoDB);
          
          deletedCount++;
        } else {
          // If not in Clerk, try to just delete from MongoDB anyway just in case
          const dbRes = await User.deleteMany({ email: email });
          if (dbRes.deletedCount > 0) {
             deletedCount++;
             console.log(Deleted  from MongoDB (was not in Clerk));
          } else {
             errors.push(${email} not found anywhere);
          }
        }
      } catch (e) {
        errors.push(Error processing : );
      }
    }

    return NextResponse.json({ success: true, deletedCount, errors });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
