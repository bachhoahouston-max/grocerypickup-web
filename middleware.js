import { NextResponse } from "next/server";

export function middleware(request) {
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";
  const { pathname } = request.nextUrl;

  const isMobile = /(android|iphone|ipad|ipod|opera mini|iemobile|mobile)/i.test(userAgent);


  if (isMobile && pathname === "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/categories/all";
    redirectUrl.searchParams.set("from", "middleware"); // optional tracker param
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === "/" && request.nextUrl.searchParams.get("allowHome") === "true") {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
