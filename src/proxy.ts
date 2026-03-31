import { middlewareAuth as auth } from "@/lib/auth.config";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Protected routes
  const protectedPaths = ["/dashboard", "/library"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isApiProtected = pathname.startsWith("/api/watchlogs");

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isApiProtected && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Redirect logged-in users away from auth pages
  const authPages = ["/login", "/signup"];
  if (authPages.includes(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/library/:path*",
    "/api/watchlogs/:path*",
    "/login",
    "/signup",
  ],
};
