import React from "react";

interface School {
  id: number;
  name: string;
  location: string;
}

interface Sponsor {
  id: number;
  fullName: string;
}

interface Proxy {
  id: number;
  fullName: string;
}

interface ActiveFiltersDisplayProps {
  hasActiveFilters: boolean;
  searchTerm: string;
  filterSponsored: string;
  filterGender: string;
  filterSchool: string;
  filterSponsor: string;
  filterProxy: string;
  schools: School[];
  sponsors: Sponsor[];
  proxies: Proxy[];
}

export const ActiveFiltersDisplay: React.FC<ActiveFiltersDisplayProps> = ({
  hasActiveFilters,
  searchTerm,
  filterSponsored,
  filterGender,
  filterSchool,
  filterSponsor,
  filterProxy,
  schools,
  sponsors,
  proxies,
}) => {
  if (!hasActiveFilters) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
      <div className="flex items-center space-x-2 flex-wrap">
        <span className="text-sm font-medium text-blue-700">
          Active filters:
        </span>
        {searchTerm && (
          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Search: "{searchTerm}"
          </span>
        )}
        {filterSponsored !== "all" && (
          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Status: {filterSponsored}
          </span>
        )}
        {filterGender !== "all" && (
          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Gender: {filterGender}
          </span>
        )}
        {filterSchool !== "all" && (
          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            School:{" "}
            {schools.find((s) => s.id.toString() === filterSchool)?.name}
          </span>
        )}
        {filterSponsor !== "all" && (
          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Sponsor:{" "}
            {filterSponsor === "none"
              ? "No Sponsor"
              : sponsors.find((s) => s.id.toString() === filterSponsor)
                  ?.fullName}
          </span>
        )}
        {filterProxy !== "all" && (
          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Proxy:{" "}
            {filterProxy === "none"
              ? "No Proxy"
              : filterProxy === "direct"
              ? "Direct Contact"
              : proxies.find((p) => p.id.toString() === filterProxy)?.fullName}
          </span>
        )}
      </div>
    </div>
  );
};
