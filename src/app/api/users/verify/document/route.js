import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import IdVerificationQueue from '@/server/models/IdVerificationQueue';
import { sendEmail } from '@/server/lib/email';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { documentUrl, collegeId, customCollegeRequest } = await req.json();

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
    
    // Save the college they selected during verification
    if (collegeId) {
      user.profile.college = collegeId;
      user.customCollegeRequest = null;
    } else if (customCollegeRequest) {
      user.profile.college = null;
      user.customCollegeRequest = customCollegeRequest;
    }

    await user.save();

    // Upsert queue entry 
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

    const adminEmail = process.env.ADMIN_EMAIL || 'ranadeepsen2004@gmail.com';
    const collegeName = customCollegeRequest ? customCollegeRequest + ' (Custom Request)' : (collegeId || 'Not provided');
    await sendEmail({
      to: adminEmail,
      subject: 'New Document Verification Request - Campus Collab',
      html: `<p>Hello Admin,</p>
             <p>A new user (<strong>${user.email}</strong>) has applied for document verification.</p>
             <p>College Selected: <strong>${collegeName}</strong></p>
             <p>Please log in to the admin panel to review the request.</p>`
    });

    return NextResponse.json({ success: true, status: 'pending_review' });
  } catch (error) {
    console.error("[DOCUMENT_VERIFY_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
