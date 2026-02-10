import React from "react";

export default function EmptyState({ message }: { message: string }) {
  return <div className="py-6 text-center text-slate-600">{message}</div>;
}
