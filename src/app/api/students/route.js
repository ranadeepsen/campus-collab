import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
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
    if (!access.canUseCampusHub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const query = { user_type: 'current', status: 'verified', _id: { $ne: user._id } };
    
    if (department) {
      query['profile.department'] = department;
    }
    
    const students = await User.find(query)
      .select('profile.name profile.photo profile.college profile.department profile.yearOfStudy isAmbassador')
      .populate('profile.college', 'name')
      .limit(50);
    
    return NextResponse.json(students);
  } catch (error) {
    console.error("[STUDENTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
