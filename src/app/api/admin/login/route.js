import { NextResponse } from 'next/server';

/**
 * Legacy username/password admin login — deprecated.
 * Admin access now uses Clerk sign-in + Admin collection (see verifyAdminSession).
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "This login endpoint is deprecated. Sign in with Clerk at /sign-in, then visit /admin.",
    },
    { status: 410 }
  );
}
