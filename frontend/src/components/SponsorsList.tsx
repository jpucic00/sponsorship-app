import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  Heart,
  Phone,
  UserCheck,
  Clock,
  Eye,
  Edit,
  Link2,
  Filter,
  X,
} from "lucide-react";
import { Pagination } from "./Pagination";

interface Sponsor {
  id: number;
  fullName: string;
  contact: string;
  proxy?: {
    fullName: string;
    role: string;
  };
  sponsorships: Array<{
    child: {
      firstName: string;
      lastName: string;
      school: {
        name: string;
      };
    };
  }>;
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

interface SponsorsListProps {
  onViewSponsor: (sponsorId: number) => void;
}

export const SponsorsList: React.FC<SponsorsListProps> = ({
  onViewSponsor,
}) => {
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

  // Search states - separate input from actual search
  const [searchTerm, setSearchTerm] = useState("");
  const [actualSearchTerm, setActualSearchTerm] = useState(""); // What we actually search for
  const [filterProxy, setFilterProxy] = useState("all");
  const [filterSponsorship, setFilterSponsorship] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(
    async (page: number = 1, resetPage: boolean = false) => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: resetPage ? "1" : page.toString(),
          limit: "20",
          search: actualSearchTerm, // Use actualSearchTerm instead of searchTerm
        });

        if (filterProxy !== "all") {
          params.append("proxyId", filterProxy);
        }
        if (filterSponsorship !== "all") {
          params.append("hasSponsorship", filterSponsorship);
        }

        const [sponsorsRes, proxiesRes] = await Promise.all([
          fetch(`/api/sponsors?${params.toString()}`),
          fetch("/api/proxies"),
        ]);

        const sponsorsData = await sponsorsRes.json();
        const proxiesData = await proxiesRes.json();

        setSponsors(sponsorsData.data || []);
        setPagination(sponsorsData.pagination || pagination);
        setProxies(proxiesData);
      } catch (error) {
        console.error("Error fetching sponsors:", error);
      } finally {
        setLoading(false);
      }
    },
    [actualSearchTerm, filterProxy, filterSponsorship, pagination]
  );

  // Initial data fetch
  useEffect(() => {
    fetchData(1, true);
  }, []);

  // Refetch when filters change (but NOT when searchTerm changes)
  useEffect(() => {
    if (actualSearchTerm !== searchTerm) {
      // Don't refetch while user is typing
      return;
    }
    fetchData(1, true);
  }, [actualSearchTerm, filterProxy, filterSponsorship]);

  // Handle search execution
  const handleSearch = () => {
    setActualSearchTerm(searchTerm);
    // fetchData will be triggered by the useEffect above
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    fetchData(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setActualSearchTerm("");
    setFilterProxy("all");
    setFilterSponsorship("all");
  };

  const hasActiveFilters =
    actualSearchTerm || filterProxy !== "all" || filterSponsorship !== "all";

  const getActiveFilterCount = () => {
    return [
      actualSearchTerm && "search",
      filterProxy !== "all" && "proxy",
      filterSponsorship !== "all" && "sponsorship",
    ].filter(Boolean).length;
  };

  // Only show full page loader on initial load (when we have no data at all)
  if (loading && sponsors.length === 0 && pagination.totalCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
          <p className="text-gray-600 font-medium">Loading sponsors...</p>
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
            {/* Search Bar with Manual Trigger */}
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 relative max-w-2xl">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={24}
                />
                <input
                  type="text"
                  placeholder="Search by name, contact, or proxy..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-24 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 text-lg"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                >
                  Search
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    showFilters || hasActiveFilters
                      ? "bg-green-600 text-white shadow-lg"
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

                <Link
                  to="/register-sponsor"
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg whitespace-nowrap"
                >
                  <Plus size={20} />
                  <span>Add New Sponsor</span>
                </Link>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-white/60 rounded-2xl p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Proxy Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <Link2 size={16} className="inline mr-1" />
                      Proxy/Middleman
                    </label>
                    <select
                      value={filterProxy}
                      onChange={(e) => setFilterProxy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                    >
                      <option value="all">All</option>
                      <option value="none">No Proxy (Direct Contact)</option>
                      {proxies.map((proxy) => (
                        <option key={proxy.id} value={proxy.id.toString()}>
                          {proxy.fullName} ({proxy.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sponsorship Status Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <Heart size={16} className="inline mr-1" />
                      Sponsorship Status
                    </label>
                    <select
                      value={filterSponsorship}
                      onChange={(e) => setFilterSponsorship(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                    >
                      <option value="all">All Sponsors</option>
                      <option value="active">Has Active Sponsorships</option>
                      <option value="none">Available for Matching</option>
                    </select>
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
                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-sm font-medium text-green-700">
                        Active filters:
                      </span>
                      {actualSearchTerm && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Search: "{actualSearchTerm}"
                        </span>
                      )}
                      {filterProxy !== "all" && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Proxy:{" "}
                          {filterProxy === "none"
                            ? "No Proxy"
                            : proxies.find(
                                (p) => p.id.toString() === filterProxy
                              )?.fullName}
                        </span>
                      )}
                      {filterSponsorship !== "all" && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Status:{" "}
                          {filterSponsorship === "active"
                            ? "Has Sponsorships"
                            : "Available"}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sponsors List */}
        {sponsors.length > 0 || (loading && pagination.totalCount > 0) ? (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative">
              {/* Loading Overlay - Only shows when refreshing data, not on initial load */}
              {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
                    <p className="text-gray-700 font-medium">
                      Refreshing sponsors...
                    </p>
                  </div>
                </div>
              )}

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Sponsor Information
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Contact Details
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Proxy/Middleman
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Sponsored Children
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sponsors.map((sponsor, index) => (
                      <tr
                        key={sponsor.id}
                        className={`hover:bg-green-50/50 transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-white/50" : "bg-gray-50/30"
                        }`}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                              <Users className="text-white" size={20} />
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900">
                                {sponsor.fullName}
                              </div>
                              <div className="text-sm text-gray-600">
                                Sponsor ID: #{sponsor.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex items-start space-x-2">
                            <Phone
                              className="text-blue-500 mt-1 flex-shrink-0"
                              size={16}
                            />
                            <div className="text-sm text-gray-900 max-w-xs break-words">
                              {sponsor.contact.length > 50
                                ? `${sponsor.contact.substring(0, 50)}...`
                                : sponsor.contact}
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          {sponsor.proxy ? (
                            <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
                              <div className="text-sm font-semibold text-purple-900">
                                {sponsor.proxy.fullName}
                              </div>
                              <div className="text-xs text-purple-600">
                                {sponsor.proxy.role}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                              <span className="text-sm text-gray-600 font-medium">
                                Direct contact
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="px-8 py-6">
                          {sponsor.sponsorships.length > 0 ? (
                            <div className="space-y-2">
                              {sponsor.sponsorships
                                .slice(0, 2)
                                .map((sponsorship, index) => (
                                  <div
                                    key={index}
                                    className="bg-green-50 p-2 rounded-lg border border-green-200"
                                  >
                                    <div className="text-sm font-semibold text-green-900">
                                      {sponsorship.child.firstName}{" "}
                                      {sponsorship.child.lastName}
                                    </div>
                                    <div className="text-xs text-green-600">
                                      {sponsorship.child.school.name}
                                    </div>
                                  </div>
                                ))}
                              {sponsor.sponsorships.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{sponsor.sponsorships.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                              <span className="text-yellow-700 text-sm font-medium">
                                ⏳ Available for matching
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => onViewSponsor(sponsor.id)}
                              className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                              <Eye size={14} />
                              <span>View</span>
                            </button>
                            <button className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                            {sponsor.sponsorships.length === 0 && (
                              <button className="flex items-center space-x-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
                                <Link2 size={14} />
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
                {sponsors.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                          <Users className="text-white" size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {sponsor.fullName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            ID: #{sponsor.id}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-start space-x-2">
                        <Phone className="text-blue-500 mt-1" size={16} />
                        <div className="text-sm text-gray-900 break-words">
                          {sponsor.contact.length > 100
                            ? `${sponsor.contact.substring(0, 100)}...`
                            : sponsor.contact}
                        </div>
                      </div>

                      {sponsor.proxy && (
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <div className="text-sm font-semibold text-purple-900">
                            Via: {sponsor.proxy.fullName}
                          </div>
                          <div className="text-xs text-purple-600">
                            ({sponsor.proxy.role})
                          </div>
                        </div>
                      )}

                      {sponsor.sponsorships.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            Sponsored Children ({sponsor.sponsorships.length}):
                          </p>
                          {sponsor.sponsorships
                            .slice(0, 2)
                            .map((sponsorship, index) => (
                              <div
                                key={index}
                                className="bg-green-50 p-2 rounded-lg border border-green-200"
                              >
                                <div className="text-sm font-semibold text-green-900">
                                  {sponsorship.child.firstName}{" "}
                                  {sponsorship.child.lastName}
                                </div>
                                <div className="text-xs text-green-600">
                                  {sponsorship.child.school.name}
                                </div>
                              </div>
                            ))}
                          {sponsor.sponsorships.length > 2 && (
                            <p className="text-xs text-gray-500">
                              +{sponsor.sponsorships.length - 2} more children
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <span className="text-yellow-700 text-sm font-medium">
                            ⏳ Available for matching
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewSponsor(sponsor.id)}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        View Details
                      </button>
                      <button className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                        Edit
                      </button>
                      {sponsor.sponsorships.length === 0 && (
                        <button className="flex-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
                          Match
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination - Show even when loading */}
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
          /* Empty State */
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
            <div className="text-8xl mb-6">🤝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No sponsors found
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              {hasActiveFilters
                ? "Try adjusting your search terms to see more results."
                : "Get started by adding your first sponsor to the system."}
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

              <Link
                to="/register-sponsor"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus size={20} className="mr-2" />
                {hasActiveFilters ? "Add New Sponsor" : "Add First Sponsor"}
              </Link>
            </div>
          </div>
        ) : null}

        {/* Filter Summary - Show with reduced opacity when loading */}
        {hasActiveFilters && (
          <div
            className={`bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 transition-opacity duration-200 ${
              loading ? "opacity-60" : "opacity-100"
            }`}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Filter Results Summary
              </h3>
              <p className="text-green-700">
                Showing{" "}
                <span className="font-bold">{pagination.totalCount}</span>{" "}
                sponsors matching your filters
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <span className="text-sm text-green-600">
                  With sponsorships on current page:{" "}
                  {sponsors.filter((s) => s.sponsorships.length > 0).length}
                </span>
                <span className="text-green-400">•</span>
                <span className="text-sm text-green-600">
                  Available on current page:{" "}
                  {sponsors.filter((s) => s.sponsorships.length === 0).length}
                </span>
                <span className="text-green-400">•</span>
                <span className="text-sm text-green-600">
                  With proxies on current page:{" "}
                  {sponsors.filter((s) => s.proxy).length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
