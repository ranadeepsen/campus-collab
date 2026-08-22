import { NextResponse } from 'next/server';
import connectDB from '@/server/lib/db';
import AmbassadorConnection from '@/server/models/AmbassadorConnection';
import User from '@/server/models/User';
import Message from '@/server/models/Message';

export async function GET(req) {
  try {
    // Basic auth check if needed, typically standard in Vercel Cron
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find connections where prospect sent a message over 3 days ago
    const connections = await AmbassadorConnection.find({
      status: 'accepted',
      firstProspectMessageAt: { $lt: threeDaysAgo }
    });

    let flaggedCount = 0;

    for (const conn of connections) {
      if (!conn.threadId) continue;

      // Check if ambassador has sent ANY message after the prospect's first message
      const ambassadorReply = await Message.findOne({
        thread: conn.threadId,
        sender: conn.ambassadorId,
        createdAt: { $gt: conn.firstProspectMessageAt }
      });

      if (!ambassadorReply) {
        // Flag the ambassador
        const ambassador = await User.findById(conn.ambassadorId);
        if (ambassador) {
          ambassador.responseFlags = (ambassador.responseFlags || 0) + 1;
          if (ambassador.responseFlags >= 3) {
            ambassador.ambassadorHidden = true;
          }
          await ambassador.save();
          flaggedCount++;
        }

        // Reset the timer or mark it so we don't flag them again for the same connection
        // Set firstProspectMessageAt to null to avoid repeated flags for the exact same offense
        conn.firstProspectMessageAt = null;
        await conn.save();
      }
    }

    return NextResponse.json({ success: true, flaggedCount });
  } catch (error) {
    console.error("[CRON_AMBASSADOR_CHECKS_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
