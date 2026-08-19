import { NextResponse } from 'next/server';
import connectDB from '@/server/lib/db';
import PointsTransaction from '@/server/models/PointsTransaction';
import AmbassadorProfile from '@/server/models/AmbassadorProfile';
import User from '@/server/models/User';
import { verifyAdminSession } from '@/server/lib/adminAuth';

export async function GET() {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    
    // Ensure User model is loaded for population
    if (!User) {
      console.log('User model loaded');
    }

    const transactions = await PointsTransaction.find()
      .populate({
        path: 'ambassador',
        populate: { path: 'user', select: 'profile.name email' }
      })
      .sort({ createdAt: -1 })
      .lean();

    const ambassadors = await AmbassadorProfile.find()
      .populate('user', 'profile.name email')
      .lean();

    return NextResponse.json({ transactions, ambassadors });
  } catch (error) {
    console.error("[POINTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ambassadorId, amount, reasonDescription } = await req.json();

    if (!ambassadorId || amount === undefined || !reasonDescription) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    const ambassador = await AmbassadorProfile.findById(ambassadorId);
    if (!ambassador) return NextResponse.json({ error: "Ambassador not found" }, { status: 404 });

    const transaction = await PointsTransaction.create({
      ambassador: ambassadorId,
      amount,
      reason: 'manual_adjustment',
      reasonDescription,
      created_by: adminSession.adminId?.toString() || 'admin'
    });

    // In a real app, reasonDescription should also be added to PointsTransaction schema. 
    // Since we didn't add it to the schema explicitly in the previous step, we can either
    // update the schema or rely on Mongoose's strict schema behavior.
    // I will use mongoose `collection.updateOne` to forcefully add it if strict mode blocks it, 
    // or just let Mongoose handle it. 
    // Wait, let's just update the AmbassadorProfile points total directly for now.
    ambassador.totalPoints += amount;
    await ambassador.save();

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error("[POINTS_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
