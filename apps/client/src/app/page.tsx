import { redirect, RedirectType } from "next/navigation";
import { headers } from "next/headers";
// import { auth } from "@/lib/auth"; // Removed direct import of auth
import { RoleHomePages, DefaultRedirect } from "@/lib/redirect-config";
import { Role } from "../../generated/prisma/enums";

export default async function Home() {
  const cookieHeader = headers().get("cookie") || "";
  const authOrigin = process.env.NEXT_PUBLIC_VERCEL_URL // Use Vercel URL in production
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000"; // Fallback for local development

  const sessionRes = await fetch(`${authOrigin}/api/auth/session`, {
    headers: {
      cookie: cookieHeader,
    },
    // Ensure the request is not cached, as session data is dynamic
    cache: "no-store",
  });

  const { session } = await sessionRes.json();

  if (!session) {
    return redirect(DefaultRedirect, RedirectType.replace);
  }
  const role = session.user.role as Role;
  const defaultPath = RoleHomePages[role] || DefaultRedirect;
  return redirect(defaultPath, RedirectType.replace);
}
