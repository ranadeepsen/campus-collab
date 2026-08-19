import { NextResponse } from 'next/server';

/**
 * Legacy admin logout — deprecated. Admin sessions use Clerk sign-out.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Deprecated. Sign out via Clerk instead." },
    { status: 410 }
  );
}
