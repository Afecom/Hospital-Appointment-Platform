import Link from "next/link";

interface DashboardCardProps {
  text: string;
  path?: string;
  data: number;
  isLoading: boolean;
  icon: React.ReactNode;
  active?: number;
  onClick?: () => void;
}

export default function DoctorDashboardCard({
  text,
  path,
  data,
  icon,
  active,
  onClick,
  isLoading,
}: DashboardCardProps) {
  const content = (
    <div
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div>{icon}</div>
        <div className="ml-4">
          <h2 className="text-xl font-bold text-primary">{text}</h2>
          <div className="flex items-center">
            <p className="text-gray-600 text-3xl font-extrabold">{data}</p>
            {active && (
              <p className="text-sm text-gray-500 ml-2">({active} active)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const skeleton = (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="ml-4 w-full">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />
          <div className="flex items-center">
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-16 ml-3 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) return skeleton;

  if (path) {
    return <Link href={path}>{content}</Link>;
  }

  return content;
}
