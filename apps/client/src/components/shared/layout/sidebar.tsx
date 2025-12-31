"use client";

import React, { createContext, useContext, useState } from "react";
import { MoreVertical, ChevronLast, ChevronFirst } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLayout } from "@/context/LayoutContext";
import { authClient } from "@/lib/auth-client";
import { Role } from "../../../../generated/prisma/enums";
import { NavSchema } from "@/lib/navSchema";
import { usePathname } from "next/navigation";

export const sidebarcontext = createContext({ expanded: false });

export default function Sidebar({
  children,
  img,
  name,
  phone,
}: {
  children: React.ReactNode;
  img?: string;
  name: string;
  phone: string;
}) {
  const { expanded, setExpanded } = useLayout();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function LogoutHandler() {
    setLoading(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace("/auth/login");
        },
      },
    });
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
          expanded ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={setExpanded}
      />
      <aside
        className={`max-h-dvh fixed w-0 inset-y-0 z-50 left-0 ${
          expanded ? "w-[50%] md:w-[35%] lg:w-[20%]" : "static"
        }`}
      >
        <nav
          className={`h-dvh flex flex-col bg-gray-200 rounded-md border-r-blue-950 border-r shadow-sm w-full ${
            expanded ? "" : "w-0"
          }`}
        >
          <div className="relative">
            <img
              src="data:image/png;base64,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"
              alt="logo"
              className={`overflow-hidden transition-all ${
                expanded ? "w-12" : "w-8"
              }`}
            />
            <button
              onClick={() => setExpanded()}
              className={`transition-all p-1.5 rounded-lg bg-green-400 hover:bg-blue-950 hover:cursor-pointer hover:text-white text-blue-950 mt-2 ${
                expanded ? "absolute top-0 right-2" : "mt-4 ml-2"
              }`}
            >
              {expanded ? <ChevronFirst /> : <ChevronLast />}
            </button>
          </div>
          <sidebarcontext.Provider value={{ expanded }}>
            <ul className="flex-1 px-1 mt-6">{children}</ul>
          </sidebarcontext.Provider>
          <button
            type="button"
            onClick={() => LogoutHandler()}
            className={`${
              expanded ? "" : "hidden"
            } rounded-md transition-all ml-[20%] mb-4 w-[60%] p-2 bg-green-400 text-blue-950 hover:bg-blue-950 hover:text-white hover:cursor-pointer`}
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
          <div
            className={`${
              expanded ? "" : "hidden"
            } flex items-center justify-between border-t-blue-950 border-t`}
          >
            <div className="flex p-3">
              <img
                src={img || "https://i.pravatar.cc/300"}
                alt="avatar"
                className="w-10 rounded-md h-10"
              />
              <div
                className={`flex justify-between items-center overflow-hidden transition-all ${
                  expanded ? "w-32 ml-3" : "w-0"
                }`}
              >
                <div className="leading-4">
                  <h4 className="font-semibold">{name || "John Doe"}</h4>
                  <span className="text-xs text-gray-500">
                    {phone || "0912345678"}
                  </span>
                </div>
              </div>
            </div>
            <div
              className={`mr-8 hover:bg-blue-950 hover:cursor-pointer hover:text-white hover:rounded-full hover:p-1 transition-all`}
            >
              <MoreVertical size={20} />
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}

export function SidebarItem({ alert, role }: { alert?: boolean; role: Role }) {
  const router = useRouter();
  const path = usePathname();
  const { expanded } = useContext(sidebarcontext);
  const { setExpanded } = useLayout();
  function NavHandler(path: string) {
    router.push(path);
    expanded ? setExpanded() : "";
  }
  const navSchema = NavSchema[role];
  return (
    <>
      {navSchema.map((item) => {
        const isActive = path === item.path;
        return (
          <li
            className={`
        relative flex items-center py-2 my-4
        font-medium rounded-lg cursor-pointer
        group transition-all
        ${
          isActive
            ? `bg-linear-to-tr from-green-200 to-green-100 text-blue-950`
            : `hover:bg-blue-50 text-blue-950 ${expanded ? "hover:p-4" : ""}`
        }
        ${expanded ? "px-3" : "px-0 ml-2 mb-4 hidden md:flex"}
        `}
            onClick={() => NavHandler(item.path)}
            key={item.id}
          >
            <div
              className={`${
                expanded
                  ? ``
                  : `hover:rounded-2xl hover:border hover:p-1 hover:border-green-400 ${
                      isActive
                        ? "border-2 border-green-400 rounded-full p-1"
                        : ""
                    }`
              } transition-all text-blue-950`}
            >
              {item.icon}
            </div>
            <span
              className={`overflow-hidden transition-all text-blue-950 ${
                expanded ? "w-52 ml-3" : "w-0"
              }`}
            >
              {item.text}
            </span>
            {alert && (
              <div
                className={`absolute w-2 h-2 rounded bg-green-400 ${
                  expanded ? "right-2" : "top-2 -right-7"
                }`}
              />
            )}

            {!expanded && (
              <div
                className={`
          absolute left-full rounded-md px-2 py-1 ml-11
          bg-green-400 text-white text-sm
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
          `}
              >
                {item.text}
              </div>
            )}
          </li>
        );
      })}
    </>
  );
}
