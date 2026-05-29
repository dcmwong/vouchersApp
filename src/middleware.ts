import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// /api/images self-authenticates (Clerk session OR x-api-key token), so it must
// not be force-blocked by the middleware. It still reads the Clerk session when
// present, but allows token-authenticated headless clients (e.g. iOS Shortcuts).
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/images",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth().protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
