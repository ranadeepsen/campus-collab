import { NextResponse } from 'next/server';
import connectDB from '@/server/lib/db';
import AmbassadorProfile from '@/server/models/AmbassadorProfile';
import College from '@/server/models/College';

export async function GET() {
  try {
    await connectDB();
    
    // Top Mentors
    const topMentors = await AmbassadorProfile.find()
      .populate('user', 'profile.name profile.photo')
      .populate('college', 'name')
      .sort({ totalPoints: -1 })
      .limit(10);
      
    // Mock Top Colleges (Since we don't have college points explicitly yet, we'll return a mock list or aggregate based on ambassadors)
    // For MVP, we aggregate ambassador points by college
    const collegeAggregation = await AmbassadorProfile.aggregate([
      { $group: { _id: "$college", totalPoints: { $sum: "$totalPoints" } } },
      { $sort: { totalPoints: -1 } },
      { $limit: 10 }
    ]);
    
    await College.populate(collegeAggregation, { path: "_id", select: "name" });
    
    const topColleges = collegeAggregation.map(c => ({
      college: c._id,
      points: c.totalPoints
    }));
    
    return NextResponse.json({ mentors: topMentors, colleges: topColleges });
  } catch (error) {
    console.error("[LEADERBOARD_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
