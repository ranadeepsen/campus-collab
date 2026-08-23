import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';

export async function DELETE(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Attempt to delete from Clerk first
    try {
      const client = await clerkClient();
      await client.users.deleteUser(userId);
    } catch (clerkErr) {
      console.error('Error deleting from Clerk:', clerkErr);
      // If it fails, we might still want to delete from our DB just in case, but usually Clerk is source of truth
    }

    // Also delete from MongoDB directly as a fallback in case webhook fails
    await User.findOneAndDelete({ clerkId: userId });

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
