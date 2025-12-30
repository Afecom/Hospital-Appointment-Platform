
export default function LogCardComponent({
  activity,
  timestamp,
}: {
  activity: string;
  timestamp: string;
}) {
  return (
    <div className="border-b last:border-b-0 py-2">
      <p className="text-gray-800">{activity}</p>
      <p className="text-sm text-gray-500">{timestamp}</p>
    </div>
  );
}

