import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Users,
  Heart,
  GraduationCap,
  Calendar,
  X,
  Eye,
  Edit,
  UserCheck,
  School as SchoolIcon,
  Link2,
} from "lucide-react";

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

interface ChildrenListProps {
  onViewChild: (childId: number) => void;
}

export const ChildrenList: React.FC<ChildrenListProps> = ({ onViewChild }) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showSponsorDropdown, setShowSponsorDropdown] = useState(false);
  const [showProxyDropdown, setShowProxyDropdown] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".filter-dropdown")) {
        setShowSchoolDropdown(false);
        setShowSponsorDropdown(false);
        setShowProxyDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [childrenRes, schoolsRes, sponsorsRes, proxiesRes] =
        await Promise.all([
          fetch("/api/children"),
          fetch("/api/schools"),
          fetch("/api/sponsors"),
          fetch("/api/proxies"),
        ]);

      const childrenData = await childrenRes.json();
      const schoolsData = await schoolsRes.json();
      const sponsorsData = await sponsorsRes.json();
      const proxiesData = await proxiesRes.json();

      setChildren(childrenData);
      setSchools(schoolsData);
      setSponsors(sponsorsData);
      setProxies(proxiesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChildren = children.filter((child) => {
    // Search filter
    const matchesSearch =
      child.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.school.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Sponsorship status filter
    const matchesSponsored =
      filterSponsored === "all" ||
      (filterSponsored === "sponsored" && child.isSponsored) ||
      (filterSponsored === "unsponsored" && !child.isSponsored);

    // Gender filter
    const matchesGender =
      filterGender === "all" || child.gender.toLowerCase() === filterGender;

    // School filter
    const matchesSchool =
      filterSchool === "all" || child.school.id.toString() === filterSchool;

    // Sponsor filter
    const matchesSponsor =
      filterSponsor === "all" ||
      (filterSponsor === "none" && child.sponsorships.length === 0) ||
      child.sponsorships.some(
        (sponsorship) => sponsorship.sponsor.id.toString() === filterSponsor
      );

    // Proxy filter
    const matchesProxy =
      filterProxy === "all" ||
      (filterProxy === "none" &&
        child.sponsorships.every((s) => !s.sponsor.proxy)) ||
      (filterProxy === "direct" &&
        child.sponsorships.some((s) => !s.sponsor.proxy)) ||
      child.sponsorships.some(
        (s) => s.sponsor.proxy?.id.toString() === filterProxy
      );

    return (
      matchesSearch &&
      matchesSponsored &&
      matchesGender &&
      matchesSchool &&
      matchesSponsor &&
      matchesProxy
    );
  });

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
    // Clear search terms for filter dropdowns
    setSchoolSearchTerm("");
    setSponsorSearchTerm("");
    setProxySearchTerm("");
    // Close dropdowns
    setShowSchoolDropdown(false);
    setShowSponsorDropdown(false);
    setShowProxyDropdown(false);
  };

  // Filter functions for searchable dropdowns
  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(schoolSearchTerm.toLowerCase()) ||
      school.location.toLowerCase().includes(schoolSearchTerm.toLowerCase())
  );

  const filteredSponsors = sponsors.filter((sponsor) =>
    sponsor.fullName.toLowerCase().includes(sponsorSearchTerm.toLowerCase())
  );

  const filteredProxies = proxies.filter(
    (proxy) =>
      proxy.fullName.toLowerCase().includes(proxySearchTerm.toLowerCase()) ||
      proxy.role.toLowerCase().includes(proxySearchTerm.toLowerCase())
  );

  // Helper functions to get selected item names
  const getSelectedSchoolName = () => {
    if (filterSchool === "all") return "All Schools";
    const school = schools.find((s) => s.id.toString() === filterSchool);
    return school ? school.name : "All Schools";
  };

  const getSelectedSponsorName = () => {
    if (filterSponsor === "all") return "All";
    if (filterSponsor === "none") return "No Sponsor";
    const sponsor = sponsors.find((s) => s.id.toString() === filterSponsor);
    return sponsor ? sponsor.fullName : "All";
  };

  const getSelectedProxyName = () => {
    if (filterProxy === "all") return "All";
    if (filterProxy === "none") return "No Proxy";
    if (filterProxy === "direct") return "Direct Contact";
    const proxy = proxies.find((p) => p.id.toString() === filterProxy);
    return proxy ? `${proxy.fullName} (${proxy.role})` : "All";
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

  if (loading) {
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
            {filteredChildren.length} children found
            {hasActiveFilters && ` (${children.length} total)`}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search Bar */}
            <div className="flex-1 relative max-w-2xl">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={24}
              />
              <input
                type="text"
                placeholder="Search by name or school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 text-lg"
              />
            </div>

            {/* Filter Toggle and Add Button */}
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

              <button
                onClick={() => (window.location.href = "/register-child")}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus size={20} />
                <span>Add New Child</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Sponsorship Status Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <Heart size={16} className="inline mr-1" />
                    Sponsorship Status
                  </label>
                  <select
                    value={filterSponsored}
                    onChange={(e) => setFilterSponsored(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 text-sm"
                  >
                    <option value="all">All Children</option>
                    <option value="sponsored">Sponsored</option>
                    <option value="unsponsored">Needs Sponsor</option>
                  </select>
                </div>

                {/* Gender Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <Users size={16} className="inline mr-1" />
                    Gender
                  </label>
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* School Filter with Search */}
                <div className="space-y-2 relative">
                  <label className="block text-sm font-semibold text-gray-700">
                    <SchoolIcon size={16} className="inline mr-1" />
                    School
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSchoolDropdown(!showSchoolDropdown);
                        setShowSponsorDropdown(false);
                        setShowProxyDropdown(false);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm text-left flex items-center justify-between"
                    >
                      <span className="truncate">
                        {getSelectedSchoolName()}
                      </span>
                      <Search
                        size={14}
                        className="text-gray-400 flex-shrink-0 ml-2"
                      />
                    </button>

                    {showSchoolDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                        <div className="p-2 border-b border-gray-200">
                          <div className="relative">
                            <Search
                              size={14}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                            <input
                              type="text"
                              placeholder="Search schools..."
                              value={schoolSearchTerm}
                              onChange={(e) =>
                                setSchoolSearchTerm(e.target.value)
                              }
                              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          <button
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm border-b border-gray-100"
                            onClick={() => {
                              setFilterSchool("all");
                              setShowSchoolDropdown(false);
                              setSchoolSearchTerm("");
                            }}
                          >
                            All Schools
                          </button>
                          {filteredSchools.map((school) => (
                            <button
                              key={school.id}
                              className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm border-b border-gray-100"
                              onClick={() => {
                                setFilterSchool(school.id.toString());
                                setShowSchoolDropdown(false);
                                setSchoolSearchTerm("");
                              }}
                            >
                              <div className="font-medium">{school.name}</div>
                              <div className="text-gray-500 text-xs">
                                {school.location}
                              </div>
                            </button>
                          ))}
                          {filteredSchools.length === 0 && schoolSearchTerm && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">
                              No schools found matching "{schoolSearchTerm}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sponsor Filter with Search */}
                <div className="space-y-2 relative">
                  <label className="block text-sm font-semibold text-gray-700">
                    <UserCheck size={16} className="inline mr-1" />
                    Sponsor
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSponsorDropdown(!showSponsorDropdown);
                        setShowSchoolDropdown(false);
                        setShowProxyDropdown(false);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm text-left flex items-center justify-between"
                    >
                      <span className="truncate">
                        {getSelectedSponsorName()}
                      </span>
                      <Search
                        size={14}
                        className="text-gray-400 flex-shrink-0 ml-2"
                      />
                    </button>

                    {showSponsorDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                        <div className="p-2 border-b border-gray-200">
                          <div className="relative">
                            <Search
                              size={14}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                            <input
                              type="text"
                              placeholder="Search sponsors..."
                              value={sponsorSearchTerm}
                              onChange={(e) =>
                                setSponsorSearchTerm(e.target.value)
                              }
                              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          <button
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm border-b border-gray-100"
                            onClick={() => {
                              setFilterSponsor("all");
                              setShowSponsorDropdown(false);
                              setSponsorSearchTerm("");
                            }}
                          >
                            All
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm border-b border-gray-100"
                            onClick={() => {
                              setFilterSponsor("none");
                              setShowSponsorDropdown(false);
                              setSponsorSearchTerm("");
                            }}
                          >
                            No Sponsor
                          </button>
                          {filteredSponsors.map((sponsor) => (
                            <button
                              key={sponsor.id}
                              className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm border-b border-gray-100"
                              onClick={() => {
                                setFilterSponsor(sponsor.id.toString());
                                setShowSponsorDropdown(false);
                                setSponsorSearchTerm("");
                              }}
                            >
                              <div className="font-medium">
                                {sponsor.fullName}
                              </div>
                              {sponsor.proxy && (
                                <div className="text-purple-600 text-xs">
                                  via {sponsor.proxy.fullName} (
                                  {sponsor.proxy.role})
                                </div>
                              )}
                            </button>
                          ))}
                          {filteredSponsors.length === 0 &&
                            sponsorSearchTerm && (
                              <div className="px-3 py-2 text-sm text-gray-500 italic">
                                No sponsors found matching "{sponsorSearchTerm}"
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Proxy Filter with Search */}
                <div className="space-y-2 relative">
                  <label className="block text-sm font-semibold text-gray-700">
                    <Link2 size={16} className="inline mr-1" />
                    Proxy/Middleman
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProxyDropdown(!showProxyDropdown);
                        setShowSchoolDropdown(false);
                        setShowSponsorDropdown(false);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm text-left flex items-center justify-between"
                    >
                      <span className="truncate">{getSelectedProxyName()}</span>
                      <Search
                        size={14}
                        className="text-gray-400 flex-shrink-0 ml-2"
                      />
                    </button>

                    {showProxyDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                        <div className="p-2 border-b border-gray-200">
                          <div className="relative">
                            <Search
                              size={14}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                            <input
                              type="text"
                              placeholder="Search proxies..."
                              value={proxySearchTerm}
                              onChange={(e) =>
                                setProxySearchTerm(e.target.value)
                              }
                              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          <button
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm border-b border-gray-100"
                            onClick={() => {
                              setFilterProxy("all");
                              setShowProxyDropdown(false);
                              setProxySearchTerm("");
                            }}
                          >
                            All
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm border-b border-gray-100"
                            onClick={() => {
                              setFilterProxy("none");
                              setShowProxyDropdown(false);
                              setProxySearchTerm("");
                            }}
                          >
                            No Proxy
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm border-b border-gray-100"
                            onClick={() => {
                              setFilterProxy("direct");
                              setShowProxyDropdown(false);
                              setProxySearchTerm("");
                            }}
                          >
                            Direct Contact
                          </button>
                          {filteredProxies.map((proxy) => (
                            <button
                              key={proxy.id}
                              className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm border-b border-gray-100"
                              onClick={() => {
                                setFilterProxy(proxy.id.toString());
                                setShowProxyDropdown(false);
                                setProxySearchTerm("");
                              }}
                            >
                              <div className="font-medium">
                                {proxy.fullName}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {proxy.role}
                              </div>
                            </button>
                          ))}
                          {filteredProxies.length === 0 && proxySearchTerm && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">
                              No proxies found matching "{proxySearchTerm}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

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
                          : sponsors.find(
                              (s) => s.id.toString() === filterSponsor
                            )?.fullName}
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

        {/* Children Table */}
        {filteredChildren.length > 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Child
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Age & Gender
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      School & Class
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Sponsorship Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredChildren.map((child, index) => (
                    <tr
                      key={child.id}
                      className={`hover:bg-blue-50/50 transition-colors duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      {/* Child Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {child.firstName[0]}
                            {child.lastName[0]}
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900">
                              {child.firstName} {child.lastName}
                            </div>
                            <div className="text-sm text-gray-600">
                              ID: #{child.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Age & Gender */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">
                            {calculateAge(child.dateOfBirth)} years old
                          </div>
                          <div className="text-gray-600">{child.gender}</div>
                        </div>
                      </td>

                      {/* School & Class */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">
                            {child.school.name}
                          </div>
                          <div className="text-gray-600">
                            {child.class} • {child.school.location}
                          </div>
                        </div>
                      </td>

                      {/* Sponsorship Details */}
                      <td className="px-6 py-4">
                        {child.isSponsored ? (
                          <div className="space-y-2">
                            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              ✅ Sponsored ({child.sponsorships.length})
                            </span>
                            {child.sponsorships
                              .slice(0, 2)
                              .map((sponsorship, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs text-gray-600"
                                >
                                  <div className="font-medium">
                                    {sponsorship.sponsor.fullName}
                                  </div>
                                  {sponsorship.sponsor.proxy && (
                                    <div className="text-purple-600">
                                      via {sponsorship.sponsor.proxy.fullName}
                                    </div>
                                  )}
                                </div>
                              ))}
                            {child.sponsorships.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{child.sponsorships.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            ⏳ Needs Sponsor
                          </span>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(
                            child.dateEnteredRegister
                          ).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onViewChild(child.id)}
                            className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() =>
                              (window.location.href = `/edit-child/${child.id}`)
                            }
                            className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                          >
                            <Edit size={14} />
                            <span>Edit</span>
                          </button>
                          {!child.isSponsored && (
                            <button className="flex items-center space-x-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
                              <Heart size={14} />
                              <span>Match</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-6">
              {filteredChildren.map((child) => (
                <div
                  key={child.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {child.firstName[0]}
                        {child.lastName[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {child.firstName} {child.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {calculateAge(child.dateOfBirth)} years •{" "}
                          {child.gender} • {child.class}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                        child.isSponsored
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {child.isSponsored ? "✅ Sponsored" : "⏳ Needs Sponsor"}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <GraduationCap size={16} />
                      <span>
                        {child.school.name}, {child.school.location}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      <span>
                        Registered:{" "}
                        {new Date(
                          child.dateEnteredRegister
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    {child.isSponsored && child.sponsorships.length > 0 && (
                      <div className="space-y-1">
                        {child.sponsorships
                          .slice(0, 2)
                          .map((sponsorship, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-2 text-sm text-green-600"
                            >
                              <Heart size={16} />
                              <span>
                                Sponsored by {sponsorship.sponsor.fullName}
                                {sponsorship.sponsor.proxy && (
                                  <span className="text-purple-600">
                                    {" "}
                                    via {sponsorship.sponsor.proxy.fullName}
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        {child.sponsorships.length > 2 && (
                          <div className="text-xs text-gray-500 ml-6">
                            +{child.sponsorships.length - 2} more sponsors
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewChild(child.id)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href = `/edit-child/${child.id}`)
                      }
                      className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    {!child.isSponsored && (
                      <button className="flex-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
                        Find Sponsor
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
            <div className="text-8xl mb-6">👶</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No children found
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              {hasActiveFilters
                ? "Try adjusting your filters to see more results."
                : "Get started by adding your first child to the system."}
            </p>

            <div className="flex justify-center space-x-4">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200"
                >
                  <X size={20} className="mr-2" />
                  Clear Filters
                </button>
              )}

              <button
                onClick={() => (window.location.href = "/register-child")}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus size={20} className="mr-2" />
                {hasActiveFilters ? "Add New Child" : "Add First Child"}
              </button>
            </div>
          </div>
        )}

        {/* Statistics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-3">
              <Users className="text-blue-600" size={24} />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Children
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {children.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-3">
              <Heart className="text-green-600" size={24} />
              <div>
                <p className="text-sm font-medium text-gray-600">Sponsored</p>
                <p className="text-2xl font-bold text-gray-900">
                  {children.filter((child) => child.isSponsored).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-3">
              <Users className="text-yellow-600" size={24} />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Need Sponsors
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {children.filter((child) => !child.isSponsored).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-3">
              <GraduationCap className="text-purple-600" size={24} />
              <div>
                <p className="text-sm font-medium text-gray-600">Schools</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(children.map((child) => child.school.name)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        {hasActiveFilters && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Filter Results Summary
              </h3>
              <p className="text-blue-700">
                Showing{" "}
                <span className="font-bold">{filteredChildren.length}</span> of{" "}
                <span className="font-bold">{children.length}</span> children
                {filteredChildren.length !== children.length && (
                  <span className="ml-2">
                    (
                    {(
                      (filteredChildren.length / children.length) *
                      100
                    ).toFixed(1)}
                    % of total)
                  </span>
                )}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <span className="text-sm text-blue-600">
                  Sponsored:{" "}
                  {filteredChildren.filter((c) => c.isSponsored).length}
                </span>
                <span className="text-blue-400">•</span>
                <span className="text-sm text-blue-600">
                  Unsponsored:{" "}
                  {filteredChildren.filter((c) => !c.isSponsored).length}
                </span>
                <span className="text-blue-400">•</span>
                <span className="text-sm text-blue-600">
                  Schools:{" "}
                  {new Set(filteredChildren.map((c) => c.school.name)).size}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
