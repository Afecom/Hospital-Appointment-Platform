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

  console.log(`[PROXY] Request for: ${pathname}`);

  // Allow static and public resources
  if (
    isPublicPath(pathname) ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    console.log("[PROXY] Allowing public path");
    return NextResponse.next();
  }

  // Allow the login page to be accessed by unauthenticated users
  if (pathname === "/auth/login") {
    console.log("[PROXY] Allowing login page");
    return NextResponse.next();
  }

  const sessionRes = await authClient.getSession({
    fetchOptions: {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    },
  });

  console.log("[PROXY] Session response:", sessionRes);

  if (sessionRes.error || !sessionRes.data?.user) {
    console.log(
      "[PROXY] No session found or error occurred. Redirecting to login.",
      sessionRes.error
    );
    const loginUrl = new URL("/auth/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  const user = sessionRes.data?.user;
  const isOnboardingComplete = user?.isOnboardingComplete;
  console.log(
    `[PROXY] User authenticated: ${user?.id}, Onboarding complete: ${isOnboardingComplete}`
  );

  // If user is logged in but not completed onboarding, only allow /user/complete-profile
  if (!isOnboardingComplete) {
    if (!pathname.startsWith("/auth/complete-profile")) {
      console.log(
        "[PROXY] Onboarding incomplete. Redirecting to complete profile."
      );
      const completeUrl = new URL("/auth/complete-profile", req.nextUrl.origin);
      return NextResponse.redirect(completeUrl);
    }
    console.log("[PROXY] Allowing access to complete profile page.");
    return NextResponse.next();
  }

  // If user has completed onboarding they should not access auth routes
  if (isOnboardingComplete && pathname.startsWith("/auth")) {
    console.log(
      "[PROXY] Onboarding complete. Redirecting from auth page to home."
    );
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
  console.log(`[PROXY] Path segment: ${firstSeg}, User role: ${userRole}`);

  if (firstSeg && rolePaths.includes(firstSeg)) {
    if (userRole !== firstSeg) {
      const defaultPath = RoleHomePages[user?.role as Role];
      console.log(
        `[PROXY] Role mismatch. Redirecting to default role page: ${defaultPath}`
      );
      const home = new URL(defaultPath, req.nextUrl.origin);
      return NextResponse.redirect(home);
    }
  }

  console.log("[PROXY] Allowing access.");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
