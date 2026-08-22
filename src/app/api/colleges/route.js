import { NextResponse } from 'next/server';
import connectDB from '@/server/lib/db';
import College from '@/server/models/College';

export async function GET() {
  try {
    await connectDB();
    const colleges = await College.find({ is_active: true }).sort({ name: 1 }).select('name _id departments').lean();
    return NextResponse.json(colleges);
  } catch (error) {
    console.error("[PUBLIC_COLLEGES_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
