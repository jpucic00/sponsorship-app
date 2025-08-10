import React from "react";
import {
  Search,
  Heart,
  Users,
  SchoolIcon,
  UserCheck,
  Link2,
} from "lucide-react";

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

interface ActiveFiltersDisplayProps {
  hasActiveFilters: boolean;
  searchTerm: string;
  filterSponsored: string;
  filterGender: string;
  filterSchool: string;
  filterSponsor: string;
  filterProxy: string;
  schools: School[] | any;
  sponsors: Sponsor[] | any;
  proxies: Proxy[] | any;
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
  // Helper function to safely extract arrays from API responses
  const safeExtractArray = <T,>(data: any, defaultValue: T[] = []): T[] => {
    if (!data) return defaultValue;
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.results && Array.isArray(data.results)) return data.results;
    if (data.items && Array.isArray(data.items)) return data.items;
    return defaultValue;
  };

  // Get safe arrays for processing
  const safeSchools = safeExtractArray<School>(schools);
  const safeSponsors = safeExtractArray<Sponsor>(sponsors);
  const safeProxies = safeExtractArray<Proxy>(proxies);

  // Helper functions to get display names
  const getSchoolName = (schoolId: string) => {
    const school = safeSchools.find((s) => s.id.toString() === schoolId);
    return school
      ? `${school.name} - ${school.location}`
      : `School ID: ${schoolId}`;
  };

  const getSponsorName = (sponsorId: string) => {
    const sponsor = safeSponsors.find((s) => s.id.toString() === sponsorId);
    return sponsor ? sponsor.fullName : `Sponsor ID: ${sponsorId}`;
  };

  const getProxyName = (proxyId: string) => {
    if (proxyId === "none") return "No Proxy";
    if (proxyId === "direct") return "Direct Contact";

    const proxy = safeProxies.find((p) => p.id.toString() === proxyId);
    return proxy ? `${proxy.fullName} (${proxy.role})` : `Proxy ID: ${proxyId}`;
  };

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-600 mr-2">
          Active filters:
        </span>

        {/* Search Term */}
        {searchTerm.trim() && (
          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <Search size={14} />
            <span>Search: "{searchTerm}"</span>
          </div>
        )}

        {/* Sponsorship Status */}
        {filterSponsored !== "all" && (
          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <Heart size={14} />
            <span>
              {filterSponsored === "sponsored" ? "Sponsored" : "Needs Sponsor"}
            </span>
          </div>
        )}

        {/* Gender */}
        {filterGender !== "all" && (
          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
            <Users size={14} />
            <span>{filterGender}</span>
          </div>
        )}

        {/* School */}
        {filterSchool !== "all" && (
          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            <SchoolIcon size={14} />
            <span className="max-w-xs truncate">
              {getSchoolName(filterSchool)}
            </span>
          </div>
        )}

        {/* Sponsor */}
        {filterSponsor !== "all" && (
          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
            <UserCheck size={14} />
            <span className="max-w-xs truncate">
              {filterSponsor === "none"
                ? "No Sponsor"
                : getSponsorName(filterSponsor)}
            </span>
          </div>
        )}

        {/* Proxy */}
        {filterProxy !== "all" && (
          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
            <Link2 size={14} />
            <span className="max-w-xs truncate">
              {getProxyName(filterProxy)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
