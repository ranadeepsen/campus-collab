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
    const collegeId = searchParams.get('collegeId');
    const clubId = searchParams.get('clubId');
    const search = searchParams.get('search');
    
    const query = { user_type: 'current', status: 'verified', _id: { $ne: user._id } };
    
    if (department) {
      query['profile.department'] = department;
    }
    
    if (collegeId) {
      query['profile.college'] = collegeId;
    }

    if (search) {
      query['profile.name'] = { $regex: search, $options: 'i' };
    }

    if (clubId) {
      // Need to find members of this club
      const Club = (await import('@/server/models/Club')).default;
      const club = await Club.findById(clubId).select('memberIds').lean();
      if (club && club.memberIds) {
        query['_id'] = { ...query['_id'], $in: club.memberIds };
      }
    }
    
    let students = await User.find(query)
      .select('profile.name profile.photo profile.college profile.department profile.yearOfStudy isAmbassador')
      .populate('profile.college', 'name')
      .limit(50)
      .lean();

    const Connection = (await import('@/server/models/Connection')).default;
    const connections = await Connection.find({
      $or: [
        { requester: user._id },
        { recipient: user._id }
      ]
    }).lean();

    students = students.map(student => {
      const conn = connections.find(c => 
        (c.requester.toString() === student._id.toString() && c.recipient.toString() === user._id.toString()) ||
        (c.recipient.toString() === student._id.toString() && c.requester.toString() === user._id.toString())
      );

      let connectionStatus = 'none';
      if (conn) {
        if (conn.status === 'accepted') connectionStatus = 'connected';
        else if (conn.status === 'pending') {
          connectionStatus = conn.requester.toString() === user._id.toString() ? 'pending_sent' : 'pending_received';
        }
      }

      return {
        ...student,
        connectionStatus
      };
    });
    
    return NextResponse.json(students);
  } catch (error) {
    console.error("[STUDENTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
