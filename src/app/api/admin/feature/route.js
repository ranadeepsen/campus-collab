import { NextResponse } from 'next/server';
import connectDB from '@/server/lib/db';
import Club from '@/server/models/Club';
import Event from '@/server/models/Event';
import { verifyAdminSession } from '@/server/lib/adminAuth';

export async function POST(req) {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { targetId, type, is_featured, featured_until } = await req.json();

    if (!targetId || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    let Model;
    if (type === 'club') Model = Club;
    else if (type === 'event') Model = Event;
    else return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    const updated = await Model.findByIdAndUpdate(targetId, {
      is_featured,
      featured_until: featured_until || null
    }, { new: true });

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("[ADMIN_FEATURE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
