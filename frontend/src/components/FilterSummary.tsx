import React from "react";

interface Child {
  id: number;
  isSponsored: boolean;
  school: {
    name: string;
  };
}

interface PaginationInfo {
  totalCount: number;
}

interface FilterSummaryProps {
  hasActiveFilters: boolean;
  children: Child[];
  pagination: PaginationInfo;
}

export const FilterSummary: React.FC<FilterSummaryProps> = ({
  hasActiveFilters,
  children,
  pagination,
}) => {
  if (!hasActiveFilters) return null;

  const sponsoredOnPage = children.filter((c) => c.isSponsored).length;
  const unsponsoredOnPage = children.filter((c) => !c.isSponsored).length;
  const uniqueSchoolsOnPage = new Set(children.map((c) => c.school.name)).size;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Filter Results Summary
        </h3>
        <p className="text-blue-700">
          Showing <span className="font-bold">{pagination.totalCount}</span>{" "}
          children matching your filters
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <span className="text-sm text-blue-600">
            Sponsored on current page: {sponsoredOnPage}
          </span>
          <span className="text-blue-400">•</span>
          <span className="text-sm text-blue-600">
            Unsponsored on current page: {unsponsoredOnPage}
          </span>
          <span className="text-blue-400">•</span>
          <span className="text-sm text-blue-600">
            Schools on current page: {uniqueSchoolsOnPage}
          </span>
        </div>
      </div>
    </div>
  );
};
