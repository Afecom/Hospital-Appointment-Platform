import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardCard({
  data,
  text,
  path,
  icon,
  active,
  onClick,
}: {
  data?: number;
  text: string;
  path?: string;
  icon: ReactNode;
  active?: number;
  onClick?: () => void;
}) {
  const content = (
    <div
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div>{icon}</div>
        <div className="ml-4">
          <h2 className="font-bold text-xl text-primary">{text}</h2>
          <div className="flex items-center">
            <p className="text-gray-600 text-3xl font-extrabold">{data}</p>
            {active !== undefined && (
              <p className="text-sm text-gray-500 ml-2">({active} active)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (path) {
    return <Link href={path}>{content}</Link>;
  }

  return content;
}
