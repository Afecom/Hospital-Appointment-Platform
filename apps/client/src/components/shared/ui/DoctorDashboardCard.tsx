import Link from "next/link";

interface DashboardCardProps {
  text: string;
  path?: string;
  data: number;
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

  if (path) {
    return <Link href={path}>{content}</Link>;
  }

  return content;
}
