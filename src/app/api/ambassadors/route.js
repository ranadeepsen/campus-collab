import { NextResponse } from 'next/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import AmbassadorApplication from '@/server/models/AmbassadorApplication';
import AmbassadorConnection from '@/server/models/AmbassadorConnection';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic');
    const collegeId = url.searchParams.get('collegeId');

    await connectDB();

    const query = {
      ambassadorStatus: 'active',
      ambassadorHidden: { $ne: true }
    };

    if (topic && topic !== 'All') {
      const matchingApps = await AmbassadorApplication.find({
        status: 'approved',
        topics: topic
      }).select('user');
      
      const userIds = matchingApps.map(app => app.user);
      query._id = { $in: userIds };
    }

    if (collegeId && collegeId !== 'All') {
      query['profile.college'] = collegeId;
    }

    let ambassadors = await User.find(query)
      .populate('profile.college', 'name')
      .select('profile ambassadorPoints')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch ratings for all active ambassadors
    const allAmbassadorIds = ambassadors.map(a => a._id);
    const ratingsData = await AmbassadorConnection.aggregate([
      { $match: { ambassadorId: { $in: allAmbassadorIds }, rating: { $ne: null } } },
      { $group: { _id: "$ambassadorId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    const ratingsMap = {};
    ratingsData.forEach(r => {
      ratingsMap[r._id.toString()] = { avgRating: r.avgRating, count: r.count };
    });

    ambassadors = ambassadors.map(amb => ({
      ...amb,
      rating: ratingsMap[amb._id.toString()]?.avgRating || 0,
      ratingCount: ratingsMap[amb._id.toString()]?.count || 0
    }));

    const leaderboard = await User.find({
      ambassadorStatus: 'active',
      ambassadorHidden: { $ne: true }
    })
      .populate('profile.college', 'name')
      .select('profile ambassadorPoints')
      .sort({ ambassadorPoints: -1 })
      .limit(10)
      .lean();
      
    // Attach ratings to leaderboard too
    const lbIds = leaderboard.map(a => a._id);
    const lbRatings = await AmbassadorConnection.aggregate([
      { $match: { ambassadorId: { $in: lbIds }, rating: { $ne: null } } },
      { $group: { _id: "$ambassadorId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    const lbRatingsMap = {};
    lbRatings.forEach(r => lbRatingsMap[r._id.toString()] = r.avgRating);
    
    const enrichedLeaderboard = leaderboard.map(amb => ({
      ...amb,
      rating: lbRatingsMap[amb._id.toString()] || 0
    }));

    return NextResponse.json({ ambassadors, leaderboard: enrichedLeaderboard });
  } catch (error) {
    console.error("[AMBASSADORS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
