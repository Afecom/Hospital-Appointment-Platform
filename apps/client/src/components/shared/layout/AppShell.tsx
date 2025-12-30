"use client";
import { LayoutProvider } from "@/context/LayoutContext";
import HeaderSection from "./header";
import { ReactNode } from "react";
import { Role } from "../../../../generated/prisma/enums";
import Sidebar, { SidebarItem } from "./sidebar";
import { useRouter } from "next/navigation";

export default function AppShell({
  user,
  children,
}: {
  user: any;
  children: ReactNode;
}) {
  const router = useRouter();
  if (!user) router.replace("/auth/login");
  return (
    <LayoutProvider>
      <div className="min-h-screen flex flex-col ">
        <HeaderSection role={Role.user} />
        <div className="flex flex-1">
          <Sidebar
            name={user.fullName}
            img={user.imageUrl}
            phone={user.phoneNumber}
          >
            <SidebarItem role={user.role}></SidebarItem>
          </Sidebar>
          <main className="flex-1 ml-10 md:ml-13 md:border-l-2 p-4 md:border-l-blue-950">
            {children}
          </main>
        </div>
      </div>
    </LayoutProvider>
  );
}
