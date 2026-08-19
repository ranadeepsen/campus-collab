import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Club from '@/server/models/Club';
import User from '@/server/models/User';

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    
    // Only show clubs for the user's college if they belong to one
    // Prospective students might see all or selected, let's keep it simple for MVP
    const query = user?.profile?.college ? { college: user.profile.college, removed_by_admin: { $ne: true } } : { removed_by_admin: { $ne: true } };
    
    const clubs = await Club.find(query).populate('college', 'name').sort({ is_featured: -1, trending: -1, createdAt: -1 });
    
    return NextResponse.json(clubs);
  } catch (error) {
    console.error("[CLUBS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
