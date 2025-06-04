import React from "react";
import { Users, Heart, GraduationCap } from "lucide-react";

interface Child {
  id: number;
  isSponsored: boolean;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

interface ChildrenStatisticsProps {
  children: Child[];
  pagination: PaginationInfo;
}

export const ChildrenStatistics: React.FC<ChildrenStatisticsProps> = ({
  children,
  pagination,
}) => {
  const sponsoredOnPage = children.filter((child) => child.isSponsored).length;
  const unsponsoredOnPage = children.filter(
    (child) => !child.isSponsored
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center space-x-3">
          <Users className="text-blue-600" size={24} />
          <div>
            <p className="text-sm font-medium text-gray-600">Total Children</p>
            <p className="text-2xl font-bold text-gray-900">
              {pagination.totalCount}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center space-x-3">
          <Heart className="text-green-600" size={24} />
          <div>
            <p className="text-sm font-medium text-gray-600">Current Page</p>
            <p className="text-2xl font-bold text-gray-900">
              {sponsoredOnPage} Sponsored
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center space-x-3">
          <Users className="text-yellow-600" size={24} />
          <div>
            <p className="text-sm font-medium text-gray-600">Current Page</p>
            <p className="text-2xl font-bold text-gray-900">
              {unsponsoredOnPage} Need Sponsors
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center space-x-3">
          <GraduationCap className="text-purple-600" size={24} />
          <div>
            <p className="text-sm font-medium text-gray-600">Page</p>
            <p className="text-2xl font-bold text-gray-900">
              {pagination.currentPage} of {pagination.totalPages}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
