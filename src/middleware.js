import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/auth/webhook(.*)'
]);

const isOnboardingRoute = createRouteMatcher([
  '/role-selection',
  '/verify-email',
  '/verification-pending',
  '/complete-profile',
]);

const isMainAppRoute = createRouteMatcher([
  '/',
  '/hub(.*)',
  '/clubs(.*)',
  '/events(.*)',
  '/mentors(.*)',
  '/messages(.*)',
  '/saved(.*)',
  '/notifications(.*)',
  '/leaderboard(.*)',
  '/explore(.*)',
  '/settings(.*)',
  '/support(.*)',
]);

const isProspectiveRestricted = createRouteMatcher([
  '/hub(.*)',
  '/clubs(.*)',
  '/events(.*)',
  '/messages(.*)',
  '/saved(.*)',
  '/leaderboard(.*)',
  '/explore(.*)',
]);

function getOnboardingRedirect(metadata) {
  const { user_type, status, profileCompleted } = metadata;

  if (!user_type) return '/role-selection';

  if (profileCompleted) {
    if (status === 'rejected') return '/verify-email';
    return null;
  }

  if (user_type === 'current' && status === 'unverified') return '/verify-email';
  if (user_type === 'current' && status === 'pending_review') return '/verification-pending';
  if (status === 'rejected') return '/verify-email';
  if (status === 'verified') return '/complete-profile';

  return '/role-selection';
}

export default clerkMiddleware(async (auth, req) => {
  // Fully bypass Clerk for the custom admin authentication
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
    return;
  }

  const { sessionClaims, userId } = await auth();

  // FIX: If user is logged in and visits exactly /sign-in or /sign-up, redirect them server-side.
  // This prevents the client-side Clerk component from rendering and creating a browser history trap!
  if (userId && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
    const metadata = sessionClaims?.publicMetadata || {};
    const onboardingRedirect = getOnboardingRedirect(metadata);
    return NextResponse.redirect(new URL(onboardingRedirect || '/', req.url));
  }

  if (isPublicRoute(req)) return;

  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  const metadata = sessionClaims?.publicMetadata || {};

  if (isOnboardingRoute(req)) return;

  if (isMainAppRoute(req)) {
    const onboardingRedirect = getOnboardingRedirect(metadata);
    if (onboardingRedirect) {
      return NextResponse.redirect(new URL(onboardingRedirect, req.url));
    }

    if (metadata.user_type === 'prospective' && isProspectiveRestricted(req)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
