import AppShell from "@/components/shared/layout/AppShell";
import { authClient } from "@/lib/auth-client";
import { redirect, RedirectType } from "next/navigation";
import { ReactNode } from "react";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await authClient.getSession();
  if (!session) redirect("/auth/login", RedirectType.replace);
  return <AppShell user={session.data?.user}>{children}</AppShell>;
}
