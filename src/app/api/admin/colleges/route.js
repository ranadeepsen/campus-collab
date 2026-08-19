import { NextResponse } from 'next/server';
import connectDB from '@/server/lib/db';
import College from '@/server/models/College';
import User from '@/server/models/User';
import { verifyAdminSession } from '@/server/lib/adminAuth';

export async function GET() {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const colleges = await College.find().sort({ name: 1 }).lean();
    
    // Get student counts
    for (let college of colleges) {
      college.studentCount = await User.countDocuments({ 'profile.college': college._id });
    }

    return NextResponse.json(colleges);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, email_domains, departments, logo } = await req.json();
    
    await connectDB();
    const newCollege = await College.create({
      name, email_domains, departments, logo
    });

    return NextResponse.json(newCollege);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
