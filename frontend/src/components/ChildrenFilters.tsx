import React from "react";
import {
  Filter,
  Heart,
  Users,
  GraduationCap,
  UserCheck,
  Link2,
  X,
  ChevronDown,
} from "lucide-react";
import { SearchableSelect } from "./SearchableSelect";

interface School {
  id: number;
  name: string;
  location: string;
}

interface Sponsor {
  id: number;
  fullName: string;
  proxy?: {
    id: number;
    fullName: string;
    role: string;
  };
}

interface Proxy {
  id: number;
  fullName: string;
  role: string;
}

interface ChildrenFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  hasActiveFilters: boolean;
  getActiveFilterCount: () => number;

  // Filter values
  filterSponsored: string;
  setFilterSponsored: (value: string) => void;
  filterGender: string;
  setFilterGender: (value: string) => void;
  filterSchool: string;
  setFilterSchool: (value: string) => void;
  filterSponsor: string;
  setFilterSponsor: (value: string) => void;
  filterProxy: string;
  setFilterProxy: (value: string) => void;

  // Search terms for dropdowns
  schoolSearchTerm: string;
  setSchoolSearchTerm: (term: string) => void;
  sponsorSearchTerm: string;
  setSponsorSearchTerm: (term: string) => void;
  proxySearchTerm: string;
  setProxySearchTerm: (term: string) => void;

  // Data
  schools: School[];
  sponsors: Sponsor[];
  proxies: Proxy[];

  // Actions
  clearAllFilters: () => void;
}

export const ChildrenFilters: React.FC<ChildrenFiltersProps> = ({
  showFilters,
  setShowFilters,
  hasActiveFilters,
  getActiveFilterCount,
  filterSponsored,
  setFilterSponsored,
  filterGender,
  setFilterGender,
  filterSchool,
  setFilterSchool,
  filterSponsor,
  setFilterSponsor,
  filterProxy,
  setFilterProxy,
  schoolSearchTerm,
  setSchoolSearchTerm,
  sponsorSearchTerm,
  setSponsorSearchTerm,
  proxySearchTerm,
  setProxySearchTerm,
  schools,
  sponsors,
  proxies,
  clearAllFilters,
}) => {
  // Prepare options for searchable selects
  const schoolOptions = [
    { value: "all", label: "All Schools" },
    ...schools.map((school) => ({
      value: school.id.toString(),
      label: school.name,
      sublabel: school.location,
    })),
  ];

  const sponsorOptions = [
    { value: "all", label: "All" },
    { value: "none", label: "No Sponsor" },
    ...sponsors.map((sponsor) => ({
      value: sponsor.id.toString(),
      label: sponsor.fullName,
      sublabel: sponsor.proxy ? `via ${sponsor.proxy.fullName}` : undefined,
    })),
  ];

  const proxyOptions = [
    { value: "all", label: "All" },
    { value: "none", label: "No Proxy" },
    { value: "direct", label: "Direct Contact" },
    ...proxies.map((proxy) => ({
      value: proxy.id.toString(),
      label: proxy.fullName,
      sublabel: proxy.role,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Top row with Filter button - fixed positioning */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            showFilters || hasActiveFilters
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Filter size={20} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white/60 rounded-2xl p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Sponsorship Status Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <Heart size={16} className="inline mr-1" />
                Sponsorship Status
              </label>
              <div className="relative">
                <select
                  value={filterSponsored}
                  onChange={(e) => setFilterSponsored(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none pr-8 hover:bg-gray-50"
                >
                  <option value="all">All Children</option>
                  <option value="sponsored">Sponsored</option>
                  <option value="unsponsored">Needs Sponsor</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Gender Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <Users size={16} className="inline mr-1" />
                Gender
              </label>
              <div className="relative">
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none pr-8 hover:bg-gray-50"
                >
                  <option value="all">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* School Filter with Search */}
            <SearchableSelect
              label="School"
              icon={<GraduationCap size={16} className="inline mr-1" />}
              value={filterSchool}
              onValueChange={setFilterSchool}
              options={schoolOptions}
              searchTerm={schoolSearchTerm}
              onSearchChange={setSchoolSearchTerm}
              placeholder="Search schools..."
              emptyMessage={`No schools found matching "${schoolSearchTerm}"`}
            />

            {/* Sponsor Filter with Search */}
            <SearchableSelect
              label="Sponsor"
              icon={<UserCheck size={16} className="inline mr-1" />}
              value={filterSponsor}
              onValueChange={setFilterSponsor}
              options={sponsorOptions}
              searchTerm={sponsorSearchTerm}
              onSearchChange={setSponsorSearchTerm}
              placeholder="Search sponsors..."
              emptyMessage={`No sponsors found matching "${sponsorSearchTerm}"`}
            />

            {/* Proxy Filter with Search */}
            <SearchableSelect
              label="Proxy/Middleman"
              icon={<Link2 size={16} className="inline mr-1" />}
              value={filterProxy}
              onValueChange={setFilterProxy}
              options={proxyOptions}
              searchTerm={proxySearchTerm}
              onSearchChange={setProxySearchTerm}
              placeholder="Search proxies..."
              emptyMessage={`No proxies found matching "${proxySearchTerm}"`}
            />

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearAllFilters}
                disabled={!hasActiveFilters}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
              >
                <X size={16} />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-sm font-medium text-blue-700">
                  Active filters:
                </span>
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
                    {
                      schools.find((s) => s.id.toString() === filterSchool)
                        ?.name
                    }
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
                      : proxies.find((p) => p.id.toString() === filterProxy)
                          ?.fullName}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
