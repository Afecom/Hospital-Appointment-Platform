import { redirect, RedirectType } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { RoleHomePages, DefaultRedirect } from "@/lib/redirect-config";
import { Role } from "../../generated/prisma/enums";

export default async function Home() {
  const sessionRes = await auth.api.getSession({
    headers: await headers(),
  });
  const session = sessionRes?.session;
  const user = sessionRes?.user;

  if (!session) {
    return redirect(DefaultRedirect, RedirectType.replace);
  }
  const role = user?.role as Role;
  const defaultPath = RoleHomePages[role] || DefaultRedirect;
  return redirect(defaultPath, RedirectType.replace);
}
