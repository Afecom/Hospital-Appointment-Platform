import { redirect, RedirectType } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { RoleHomePages, DefaultRedirect } from "@/lib/redirect-config";
import { Role } from "../../generated/prisma/enums";

export default async function Home() {
  const sessionRes = await authClient.getSession();
  const session = sessionRes.data?.session;
  const user = sessionRes.data?.user;

  if (!session) {
    return redirect(DefaultRedirect, RedirectType.replace);
  }
  const role = user?.role as Role;
  const defaultPath = RoleHomePages[role] || DefaultRedirect;
  return redirect(defaultPath, RedirectType.replace);
}
