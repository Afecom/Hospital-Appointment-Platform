
interface LogCardProps {
  activity: string;
  timestamp: string;
}

export default function ActivityLog({
  activity,
  timestamp,
}: LogCardProps) {
  return (
    <div className="border-b last:border-b-0 py-2">
      <p className="text-gray-800">{activity}</p>
      <p className="text-sm text-gray-500">{timestamp}</p>
    </div>
  );
}
