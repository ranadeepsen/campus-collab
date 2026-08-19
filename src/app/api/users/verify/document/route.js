import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import IdVerificationQueue from '@/server/models/IdVerificationQueue';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { documentUrl } = await req.json();

    if (!documentUrl) {
      return NextResponse.json({ error: "Document URL is required" }, { status: 400 });
    }

    await connectDB();
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      // Fallback if webhook failed locally or role-selection was bypassed
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      user = await User.create({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || 'unknown@example.com',
        user_type: 'current', // Force them to 'current' since they are uploading an ID
        status: 'unverified'
      });
    }

    user.status = 'pending_review';
    user.verification_method = 'college_id_card';
    user.verification_document = documentUrl;
    await user.save();

    // Upsert queue entry — avoid duplicates on re-upload
    await IdVerificationQueue.findOneAndUpdate(
      { user: user._id, status: 'pending' },
      { user: user._id, imageUrl: documentUrl, status: 'pending' },
      { upsert: true, new: true }
    );

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        user_type: user.user_type,
        status: user.status,
        profileCompleted: user.profileCompleted,
        isAmbassador: user.isAmbassador
      }
    });

    return NextResponse.json({ success: true, status: 'pending_review' });
  } catch (error) {
    console.error("[DOCUMENT_VERIFY_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
