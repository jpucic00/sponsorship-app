import React, { useState, useEffect, useCallback } from "react";
import { ChildrenSearchBar } from "./ChildrenSearchBar";
import { ChildrenFilters } from "./ChildrenFilters";
import { ActiveFiltersDisplay } from "./ActiveFiltersDisplay";
import { ChildrenTableDesktop } from "./ChildrenTableDesktop";
import { ChildrenCardsMobile } from "./ChildrenCardsMobile";
import { EmptyState } from "./EmptyState";
import { FilterSummary } from "./FilterSummary";
import { Pagination } from "./Pagination";

interface Child {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  class: string;
  isSponsored: boolean;
  dateEnteredRegister: string;
  lastProfileUpdate: string;
  // Image fields
  photoBase64?: string;
  photoMimeType?: string;
  photoDataUrl?: string;
  school: {
    id: number;
    name: string;
    location: string;
  };
  sponsorships: Array<{
    sponsor: {
      id: number;
      fullName: string;
      proxy?: {
        id: number;
        fullName: string;
        role: string;
      };
    };
  }>;
}

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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
}

interface ChildrenListProps {
  onViewChild: (childId: number) => void;
}

export const ChildrenList: React.FC<ChildrenListProps> = ({ onViewChild }) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
    startIndex: 1,
    endIndex: 1,
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [actualSearchTerm, setActualSearchTerm] = useState(""); // What we actually search for
  const [filterSponsored, setFilterSponsored] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterSchool, setFilterSchool] = useState("all");
  const [filterSponsor, setFilterSponsor] = useState("all");
  const [filterProxy, setFilterProxy] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Search states for filter dropdowns
  const [schoolSearchTerm, setSchoolSearchTerm] = useState("");
  const [sponsorSearchTerm, setSponsorSearchTerm] = useState("");
  const [proxySearchTerm, setProxySearchTerm] = useState("");

  const fetchData = useCallback(
    async (page: number = 1, resetPage: boolean = false) => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: resetPage ? "1" : page.toString(),
          limit: "20",
          search: actualSearchTerm.trim(),
        });

        if (filterSponsored !== "all") {
          params.append("sponsorship", filterSponsored);
        }
        if (filterGender !== "all") {
          params.append("gender", filterGender);
        }
        if (filterSchool !== "all") {
          params.append("schoolId", filterSchool);
        }
        if (filterSponsor !== "all") {
          params.append("sponsorId", filterSponsor);
        }
        if (filterProxy !== "all") {
          params.append("proxyId", filterProxy);
        }

        const [childrenRes, schoolsRes, sponsorsRes, proxiesRes] =
          await Promise.all([
            fetch(`/api/children?${params.toString()}`),
            fetch("/api/schools"),
            fetch("/api/sponsors"),
            fetch("/api/proxies"),
          ]);

        if (!childrenRes.ok) {
          throw new Error(
            `API Error: ${childrenRes.status} ${childrenRes.statusText}`
          );
        }

        const childrenData = await childrenRes.json();
        const schoolsData = await schoolsRes.json();
        const sponsorsData = await sponsorsRes.json();
        const proxiesData = await proxiesRes.json();

        setChildren(childrenData.data || []);
        setPagination(
          childrenData.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            limit: 20,
            hasNextPage: false,
            hasPrevPage: false,
            startIndex: 1,
            endIndex: 1,
          }
        );
        setSchools(schoolsData);
        setSponsors(sponsorsData.data || sponsorsData);
        setProxies(proxiesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set empty state on error
        setChildren([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false,
          startIndex: 1,
          endIndex: 1,
        });
      } finally {
        setLoading(false);
      }
    },
    [
      actualSearchTerm,
      filterSponsored,
      filterGender,
      filterSchool,
      filterSponsor,
      filterProxy,
    ]
  );

  // Initial data fetch
  useEffect(() => {
    fetchData(1, true);
  }, [
    actualSearchTerm,
    filterSponsored,
    filterGender,
    filterSchool,
    filterSponsor,
    filterProxy,
  ]);

  // Handle search execution
  const handleSearch = () => {
    setActualSearchTerm(searchTerm.trim());
  };

  const handlePageChange = (page: number) => {
    fetchData(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setActualSearchTerm("");
    setFilterSponsored("all");
    setFilterGender("all");
    setFilterSchool("all");
    setFilterSponsor("all");
    setFilterProxy("all");
    setSchoolSearchTerm("");
    setSponsorSearchTerm("");
    setProxySearchTerm("");
  };

  const hasActiveFilters =
    actualSearchTerm.trim() !== "" ||
    filterSponsored !== "all" ||
    filterGender !== "all" ||
    filterSchool !== "all" ||
    filterSponsor !== "all" ||
    filterProxy !== "all";

  const getActiveFilterCount = () => {
    return [
      actualSearchTerm.trim() !== "" && "search",
      filterSponsored !== "all" && "status",
      filterGender !== "all" && "gender",
      filterSchool !== "all" && "school",
      filterSponsor !== "all" && "sponsor",
      filterProxy !== "all" && "proxy",
    ].filter(Boolean).length;
  };

  // Only show full page loader on initial load (when we have no data at all)
  if (loading && children.length === 0 && pagination.totalCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading children...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="space-y-6">
            {/* Search Bar */}
            <ChildrenSearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={handleSearch}
            />

            {/* Filters */}
            <ChildrenFilters
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              hasActiveFilters={hasActiveFilters}
              getActiveFilterCount={getActiveFilterCount}
              filterSponsored={filterSponsored}
              setFilterSponsored={setFilterSponsored}
              filterGender={filterGender}
              setFilterGender={setFilterGender}
              filterSchool={filterSchool}
              setFilterSchool={setFilterSchool}
              filterSponsor={filterSponsor}
              setFilterSponsor={setFilterSponsor}
              filterProxy={filterProxy}
              setFilterProxy={setFilterProxy}
              schoolSearchTerm={schoolSearchTerm}
              setSchoolSearchTerm={setSchoolSearchTerm}
              sponsorSearchTerm={sponsorSearchTerm}
              setSponsorSearchTerm={setSponsorSearchTerm}
              proxySearchTerm={proxySearchTerm}
              setProxySearchTerm={setProxySearchTerm}
              schools={schools}
              sponsors={sponsors}
              proxies={proxies}
              clearAllFilters={clearAllFilters}
            />

            <ActiveFiltersDisplay
              hasActiveFilters={hasActiveFilters}
              searchTerm={actualSearchTerm} // Use actualSearchTerm for display
              filterSponsored={filterSponsored}
              filterGender={filterGender}
              filterSchool={filterSchool}
              filterSponsor={filterSponsor}
              filterProxy={filterProxy}
              schools={schools}
              sponsors={sponsors}
              proxies={proxies}
            />
          </div>
        </div>

        {/* Children Table/Cards */}
        {children.length > 0 || (loading && pagination.totalCount > 0) ? (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative">
              {/* Loading Overlay - Only shows when refreshing data */}
              {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                    <p className="text-gray-700 font-medium">
                      Refreshing children...
                    </p>
                  </div>
                </div>
              )}

              {/* Desktop Table */}
              <ChildrenTableDesktop
                children={children}
                onViewChild={onViewChild}
                calculateAge={calculateAge}
              />

              {/* Mobile Cards */}
              <ChildrenCardsMobile
                children={children}
                onViewChild={onViewChild}
                calculateAge={calculateAge}
              />
            </div>

            {/* Pagination - Show even when loading with reduced opacity */}
            <div
              className={`transition-opacity duration-200 ${
                loading ? "opacity-60" : "opacity-100"
              }`}
            >
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </div>
          </div>
        ) : !loading ? (
          /* Empty State - Only show when not loading */
          <EmptyState
            hasActiveFilters={hasActiveFilters}
            clearAllFilters={clearAllFilters}
          />
        ) : null}

        {/* Filter Summary - Show with reduced opacity when loading */}
        <div
          className={`transition-opacity duration-200 ${
            loading ? "opacity-60" : "opacity-100"
          }`}
        >
          <FilterSummary
            hasActiveFilters={hasActiveFilters}
            children={children}
            pagination={pagination}
          />
        </div>
      </div>
    </div>
  );
};
