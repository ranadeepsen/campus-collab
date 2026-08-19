import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import College from '@/server/models/College';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const domain = email.split('@')[1];
    if (!domain) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

    await connectDB();
    const college = await College.findOne({ 
      email_domains: domain,
      is_active: true
    });
    
    if (!college) {
      return NextResponse.json({ success: true, matched: false, error: "Your college email domain is not currently supported." });
    }

    // Domain matched! Let the frontend proceed with Clerk OTP.
    return NextResponse.json({ success: true, matched: true, collegeId: college._id });
  } catch (error) {
    console.error("[EMAIL_VERIFY_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { collegeId } = await req.json();

    await connectDB();
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      // Fallback if webhook failed locally or role-selection was bypassed
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      user = await User.create({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || 'unknown@example.com',
        user_type: 'current',
        status: 'unverified'
      });
    }

    user.status = 'verified';
    user.verification_method = 'college_email';
    user.profile.college = collegeId;
    await user.save();

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        user_type: user.user_type,
        status: user.status,
        profileCompleted: user.profileCompleted,
        isAmbassador: user.isAmbassador
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[EMAIL_VERIFY_PUT_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
