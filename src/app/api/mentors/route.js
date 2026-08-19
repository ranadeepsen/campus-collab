import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import AmbassadorProfile from '@/server/models/AmbassadorProfile';
import User from '@/server/models/User';
import { getAccessState } from '@/server/lib/getAccessState';

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const access = getAccessState(user);
    if (!access.canConnectWithAmbassador && user.user_type === 'prospective') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get('college');
    const department = searchParams.get('department');

    const query = {};
    if (collegeId) query.college = collegeId;
    if (department) query.department = department;

    const mentors = await AmbassadorProfile.find(query)
      .populate('user', 'profile.name profile.photo profile.yearOfStudy profile.interests')
      .populate('college', 'name')
      .sort({ rating: -1, totalPoints: -1 });
    
    return NextResponse.json(mentors);
  } catch (error) {
    console.error("[MENTORS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
