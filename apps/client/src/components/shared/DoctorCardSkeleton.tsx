"use client";

const DoctorCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col border border-gray-100">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
        <div>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="grow space-y-2">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
        <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    </div>
  );
};

export default DoctorCardSkeleton;
