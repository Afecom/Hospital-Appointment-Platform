import { redirect, RedirectType } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { RoleHomePages, DefaultRedirect } from "@/lib/redirect-config";
import { Role } from "../../generated/prisma/enums";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect(DefaultRedirect, RedirectType.replace);
  }
  const role = session.user.role;
  const defaultPath = RoleHomePages[role as Role] || DefaultRedirect;
  return redirect(defaultPath, RedirectType.replace);
}
