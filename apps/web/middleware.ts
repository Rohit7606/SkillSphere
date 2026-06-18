import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/login(.*)', '/register(.*)', '/api/webhooks(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  
  // RBAC: check role metadata for admin routes
  if (isAdminRoute(req)) {
    const session = await auth();
    // Assuming role is stored in public metadata
    const role = (session.sessionClaims?.metadata as any)?.role;
    // Temporarily disabled for MVP demo so any logged in user can view the admin portal
    // if (role !== 'admin') {
    //   return NextResponse.redirect(new URL('/dashboard', req.url));
    // }
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
