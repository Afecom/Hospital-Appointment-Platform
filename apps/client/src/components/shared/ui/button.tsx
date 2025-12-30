import { ReactNode } from "react";

export default function ButtonComponent({ children }: { children: ReactNode }) {
  return (
    <button className="hover:rounded-md hover:cursor-pointer hover:p-1 transition-all hover:bg-blue-950 hover:border hover:border-green-400 hover:text-white">
      {children}
    </button>
  );
}
