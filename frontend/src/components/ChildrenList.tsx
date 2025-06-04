import React, { useState, useEffect, useCallback } from "react";
import { ChildrenSearchBar } from "./ChildrenSearchBar";
import { ChildrenFilters } from "./ChildrenFilters";
import { ActiveFiltersDisplay } from "./ActiveFiltersDisplay";
import { ChildrenTableDesktop } from "./ChildrenTableDesktop";
import { ChildrenCardsMobile } from "./ChildrenCardsMobile";
import { ChildrenStatistics } from "./ChildrenStatistics";
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

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
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

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(
    async (page: number = 1, resetPage: boolean = false) => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: resetPage ? "1" : page.toString(),
          limit: "20",
          search: debouncedSearchTerm,
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

        const childrenData = await childrenRes.json();
        const schoolsData = await schoolsRes.json();
        const sponsorsData = await sponsorsRes.json();
        const proxiesData = await proxiesRes.json();

        setChildren(childrenData.data || []);
        setPagination(childrenData.pagination || pagination);
        setSchools(schoolsData);
        setSponsors(sponsorsData.data || sponsorsData);
        setProxies(proxiesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      debouncedSearchTerm,
      filterSponsored,
      filterGender,
      filterSchool,
      filterSponsor,
      filterProxy,
      pagination,
    ]
  );

  // Initial data fetch
  useEffect(() => {
    fetchData(1, true);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      return;
    }
    fetchData(1, true);
  }, [
    debouncedSearchTerm,
    filterSponsored,
    filterGender,
    filterSchool,
    filterSponsor,
    filterProxy,
  ]);

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
    searchTerm ||
    filterSponsored !== "all" ||
    filterGender !== "all" ||
    filterSchool !== "all" ||
    filterSponsor !== "all" ||
    filterProxy !== "all";

  const getActiveFilterCount = () => {
    return [
      searchTerm && "search",
      filterSponsored !== "all" && "status",
      filterGender !== "all" && "gender",
      filterSchool !== "all" && "school",
      filterSponsor !== "all" && "sponsor",
      filterProxy !== "all" && "proxy",
    ].filter(Boolean).length;
  };

  if (loading && children.length === 0) {
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Children Registry
          </h1>
          <p className="text-gray-600 text-xl">
            {pagination.totalCount} children found
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <ChildrenSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

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
            searchTerm={searchTerm}
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

        {/* Children Table/Cards */}
        {children.length > 0 ? (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative">
              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
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

            {/* Pagination */}
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </div>
        ) : (
          /* Empty State */
          <EmptyState
            hasActiveFilters={hasActiveFilters}
            clearAllFilters={clearAllFilters}
          />
        )}

        {/* Statistics Bar */}
        <ChildrenStatistics children={children} pagination={pagination} />

        {/* Filter Summary */}
        <FilterSummary
          hasActiveFilters={hasActiveFilters}
          children={children}
          pagination={pagination}
        />
      </div>
    </div>
  );
};
