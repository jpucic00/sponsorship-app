// File: frontend/src/components/ChildrenFilters.tsx
import React from "react";
import {
  Filter,
  Heart,
  Users,
  SchoolIcon,
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

  // Data - Allow various response structures
  schools: School[] | any;
  sponsors: Sponsor[] | any;
  proxies: Proxy[] | any;

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
  // Helper function to safely extract arrays from API responses
  const safeExtractArray = <T,>(data: any, defaultValue: T[] = []): T[] => {
    if (!data) return defaultValue;
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.results && Array.isArray(data.results)) return data.results;
    if (data.items && Array.isArray(data.items)) return data.items;

    // For debugging - log unexpected structures
    console.warn("Unexpected data structure in ChildrenFilters:", data);
    return defaultValue;
  };

  // Get safe arrays for processing
  const safeProxies = safeExtractArray<Proxy>(proxies);
  const safeSchools = safeExtractArray<School>(schools);
  const safeSponsors = safeExtractArray<Sponsor>(sponsors);

  // Prepare options for searchable selects
  const schoolOptions = [
    { value: "all", label: "All Schools" },
    ...safeSchools.map((school) => ({
      value: school.id.toString(),
      label: school.name,
      sublabel: school.location,
    })),
  ];

  const sponsorOptions = [
    { value: "all", label: "All" },
    { value: "none", label: "No Sponsor" },
    ...safeSponsors.map((sponsor) => ({
      value: sponsor.id.toString(),
      label: sponsor.fullName,
      sublabel: sponsor.proxy ? `via ${sponsor.proxy.fullName}` : undefined,
    })),
  ];

  const proxyOptions = [
    { value: "all", label: "All" },
    { value: "none", label: "No Proxy" },
    { value: "direct", label: "Direct Contact" },
    ...safeProxies.map((proxy) => ({
      value: proxy.id.toString(),
      label: proxy.fullName,
      sublabel: proxy.role,
    })),
  ];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
      {/* Filter Toggle */}
      <div className="flex items-center space-x-4">
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
        <div className="w-full mt-6 pt-6 border-t border-gray-200 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 relative overflow-visible">
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
                  <option value="all">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
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
              icon={<SchoolIcon size={16} className="inline mr-1" />}
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
        </div>
      )}
    </div>
  );
};
