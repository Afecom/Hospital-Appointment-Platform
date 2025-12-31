import AppShell from "@/components/shared/layout/AppShell";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { ReactNode } from "react";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log(session);
  if (!session) redirect("/auth/login", RedirectType.replace);
  return <AppShell user={session.user}>{children}</AppShell>;
}
