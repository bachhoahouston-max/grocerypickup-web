import { NextResponse } from "next/server";

export function middleware(request) {
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";
  const { pathname, searchParams, origin } = request.nextUrl;

  const isMobile = /(android|iphone|ipad|ipod|opera mini|iemobile|mobile)/i.test(
    userAgent
  );

  const redirected = request.cookies.get("redirected_once")?.value === "true";

  if (isMobile && pathname === "/" && !redirected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/categories/all";
    redirectUrl.searchParams.set("from", "middleware");

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("redirected_once", "true", {
      path: "/",
      maxAge: 60 * 5, // 5 minutes
    });

    return response;
  }

  if (pathname === "/" && (searchParams.get("allowHome") === "true" || redirected)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
