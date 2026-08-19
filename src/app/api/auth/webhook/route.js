import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import connectDB from '@/server/lib/db'
import User from '@/server/models/User'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(req) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error: Missing Svix headers', {
      status: 400,
    })
  }

  const payload = await req.text()

  let evt;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new NextResponse('Error: Verification error', {
      status: 400,
    })
  }

  const { id } = evt.data
  const eventType = evt.type

  await connectDB();

  if (eventType === 'user.created') {
    const email = evt.data.email_addresses[0]?.email_address;
    
    try {
      const newUser = await User.create({
        clerkId: id,
        email: email,
        user_type: null,
        status: 'unverified',
        profileCompleted: false,
        isAmbassador: false
      });

      // Set public metadata in Clerk to match default DB state
      const client = await clerkClient();
      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          user_type: null,
          status: 'unverified',
          profileCompleted: false,
          isAmbassador: false
        }
      });
      
      console.log(`User ${id} synchronized to MongoDB.`);
    } catch (err) {
      console.error('Error saving user to DB:', err);
      return NextResponse.json({ error: "Error saving user to DB" }, { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const email = evt.data.email_addresses[0]?.email_address;
    try {
      await User.findOneAndUpdate({ clerkId: id }, { email: email });
      console.log(`User ${id} updated in MongoDB.`);
    } catch (err) {
      console.error('Error updating user in DB:', err);
      return NextResponse.json({ error: "Error updating user in DB" }, { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      await User.findOneAndDelete({ clerkId: id });
      console.log(`User ${id} deleted from MongoDB.`);
    } catch (err) {
      console.error('Error deleting user from DB:', err);
      return NextResponse.json({ error: "Error deleting user from DB" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, message: "Webhook received" }, { status: 200 })
}
