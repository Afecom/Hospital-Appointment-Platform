import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authClient } from "./lib/auth-client";
import { RoleHomePages } from "./lib/redirect-config";
import { Role } from "../generated/prisma/enums";

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/verify",
  "/auth/sign-up",
  "/_next",
  "/favicon.ico",
  "/api",
  "/assets",
  "/public",
];

function isPublicPath(pathname: string) {
  if (pathname === "/") return false;
  return PUBLIC_PATHS.some(
    (p) =>
      pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p)
  );
}

function normalizeRole(role: Role) {
  if (!role) return "";
  return role.replace(/_/g, "-");
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static and public resources
  if (
    isPublicPath(pathname) ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionRes = await authClient.getSession({
    fetchOptions: {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    },
  });

  if (sessionRes.error || !sessionRes.data?.user) {
    const loginUrl = new URL("/auth/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  const user = sessionRes.data?.user;
  const isOnboardingComplete = user?.isOnboardingComplete;

  // If user is logged in but not completed onboarding, only allow /user/complete-profile
  if (!isOnboardingComplete) {
    if (!pathname.startsWith("/auth/complete-profile")) {
      const completeUrl = new URL("/auth/complete-profile", req.nextUrl.origin);
      return NextResponse.redirect(completeUrl);
    }
    return NextResponse.next();
  }

  // If user has completed onboarding they should not access auth routes
  if (isOnboardingComplete && pathname.startsWith("/auth")) {
    const home = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(home);
  }

  // RBAC: if first path segment is a role path, ensure it matches user's role
  const firstSeg = pathname.split("/").filter(Boolean)[0] || "";
  const rolePaths = [
    "admin",
    "user",
    "doctor",
    "hospital_admin",
    "hospital_operator",
    "hospital_user",
  ];
  const userRole = normalizeRole(user?.role as Role);

  if (firstSeg && rolePaths.includes(firstSeg)) {
    if (userRole !== firstSeg) {
      const defaultPath = RoleHomePages[user?.role as Role];
      const home = new URL(defaultPath, req.nextUrl.origin);
      return NextResponse.redirect(home);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
