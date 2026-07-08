import { NextResponse } from "next/server";

const PUBLIC_STAFF_ROUTES = [
  "/staff/login",
  "/staff/forgot-password",
  "/staff/reset-password",
  "/staff/auth/callback",
  "/auth/callback",
  "/staff/unauthorized",
];

function isPublicStaffRoute(pathname) {
  return PUBLIC_STAFF_ROUTES.some((route) => pathname.startsWith(route));
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/assets") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Set request header to pass the pathname to server layout/components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (isPublicStaffRoute(pathname)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Allow staff route rendering to pass through middleware.
  // Real auth verification must happen in the Node.js/server layout or server pages,
  // not inside Edge middleware, to prevent Edge runtime crashes.
  if (pathname.startsWith("/staff")) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*"],
};
