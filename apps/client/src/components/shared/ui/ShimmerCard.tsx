import React from "react";

const ShimmerCard = () => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
      <div className="animate-pulse">
        {/* Heading Placeholder */}
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>

        {/* Detail Lines Placeholder */}
        <div className="space-y-3 mb-6">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          
          {/* Specializations Placeholder */}
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="h-5 bg-blue-100 rounded-full w-20"></div>
            <div className="h-5 bg-blue-100 rounded-full w-24"></div>
          </div>
        </div>

        {/* Button Placeholders */}
        <div className="flex justify-end gap-3">
          <div className="h-10 w-24 bg-gray-300 rounded-md"></div>
          <div className="h-10 w-24 bg-gray-300 rounded-md"></div>
        </div>
      </div>
    </div>
  );
};

export default ShimmerCard;
