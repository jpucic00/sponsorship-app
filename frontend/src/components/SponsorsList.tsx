// FIXED frontend/src/components/SponsorsList.tsx - Remove infinite loop

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  Heart,
  Phone,
  Eye,
  Link2,
  Filter,
  X,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Pagination } from "./Pagination";

import { createPortal } from "react-dom";

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

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProxy, setFilterProxy] = useState("all");
  const [filterSponsorship, setFilterSponsorship] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalData, setModalData] = useState<{
    sponsorId?: number;
    sponsorName?: string;
    errorMessage?: string;
    successMessage?: string;
  }>({});

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
        console.log("🔄 Fetching sponsors with search:", debouncedSearchTerm);

        // Build query parameters
        const params = new URLSearchParams({
          page: resetPage ? "1" : page.toString(),
          limit: "20",
          search: debouncedSearchTerm, // This matches backend expectation
        });

        if (filterProxy !== "all") {
          params.append("proxyId", filterProxy); // Fixed: use proxyId not proxy
        }
        if (filterSponsorship !== "all") {
          params.append("hasSponsorship", filterSponsorship); // Fixed: use hasSponsorship
        }

        console.log("📤 Request URL:", `/api/sponsors?${params.toString()}`);

        const [sponsorsRes, proxiesRes] = await Promise.all([
          fetch(`/api/sponsors?${params.toString()}`),
          fetch("/api/proxies"),
        ]);

        if (!sponsorsRes.ok) {
          const errorText = await sponsorsRes.text();
          console.error("❌ API Error:", sponsorsRes.status, errorText);
          throw new Error(`API Error: ${sponsorsRes.status} - ${errorText}`);
        }

        const sponsorsData = await sponsorsRes.json();
        const proxiesData = await proxiesRes.json();

        console.log("✅ Data received:", {
          sponsors: sponsorsData.data?.length || 0,
          total: sponsorsData.pagination?.totalCount || 0,
        });

        setSponsors(sponsorsData.data || []);
        setPagination(
          sponsorsData.pagination || {
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
        setProxies(proxiesData);
      } catch (error) {
        console.error("❌ Error fetching sponsors:", error);
        // Don't clear sponsors on error to avoid UI flashing
        if (sponsors.length === 0) {
          setSponsors([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearchTerm, filterProxy, filterSponsorship] // FIXED: Removed pagination dependency
  );

  // Initial data fetch
  useEffect(() => {
    fetchData(1, true);
  }, []); // Empty dependency array for initial load

  // Refetch when filters change
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      // Don't refetch while debouncing
      return;
    }
    console.log("🔄 Filters changed, refetching...");
    fetchData(1, true);
  }, [debouncedSearchTerm, filterProxy, filterSponsorship, fetchData]);

  const handlePageChange = (page: number) => {
    fetchData(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterProxy("all");
    setFilterSponsorship("all");
  };

  const handleDeleteSponsor = async (
    sponsorId: number,
    sponsorName: string
  ) => {
    setModalData({ sponsorId, sponsorName });
    setShowDeleteModal(true);
  };

  const confirmDeleteSponsor = async () => {
    const { sponsorId, sponsorName } = modalData;
    if (!sponsorId) return;

    setShowDeleteModal(false);

    try {
      const response = await fetch(`/api/sponsors/${sponsorId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete sponsor");
      }

      console.log("✅ Sponsor deleted successfully");

      // Show success modal
      setModalData({
        successMessage: `"${sponsorName}" has been deleted successfully.`,
      });
      setShowSuccessModal(true);

      // Refresh the sponsors list
      fetchData(pagination.currentPage);
    } catch (error) {
      console.error("❌ Error deleting sponsor:", error);
      setModalData({
        errorMessage: `Failed to delete sponsor: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      setShowErrorModal(true);
    }
  };

  const closeModals = () => {
    setShowDeleteModal(false);
    setShowErrorModal(false);
    setShowSuccessModal(false);
    setModalData({});
  };

  const hasActiveFilters =
    searchTerm || filterProxy !== "all" || filterSponsorship !== "all";

  const getActiveFilterCount = () => {
    return [
      searchTerm && "search",
      filterProxy !== "all" && "proxy",
      filterSponsorship !== "all" && "sponsorship",
    ].filter(Boolean).length;
  };

  if (loading && sponsors.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
          <p className="text-gray-600 font-medium">
            {searchTerm
              ? `Searching for "${searchTerm}"...`
              : "Loading sponsors..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
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
                placeholder="Search by name, contact, or proxy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 text-lg"
              />
            </div>

            {/* Filter Toggle and Add Button */}
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
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus size={20} />
                <span>Add New Sponsor</span>
              </Link>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">All Sponsors</option>
                    <option value="none">No Proxy</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">All Sponsors</option>
                    <option value="active">Has Sponsorships</option>
                    <option value="available">Available</option>
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
                    {searchTerm && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Search: "{searchTerm}"
                      </span>
                    )}
                    {filterProxy !== "all" && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Proxy:{" "}
                        {filterProxy === "none"
                          ? "No Proxy"
                          : proxies.find((p) => p.id.toString() === filterProxy)
                              ?.fullName}
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

        {/* Sponsors List - KEEPING YOUR ORIGINAL LAYOUT */}
        {sponsors.length > 0 ? (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Sponsor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Proxy/Middleman
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Sponsorships
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sponsors.map((sponsor, index) => (
                      <tr
                        key={sponsor.id}
                        className={`hover:bg-blue-50/50 transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        }`}
                      >
                        <td className="px-6 py-6">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4">
                              {sponsor.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">
                                {sponsor.fullName}
                              </h4>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center text-gray-600">
                            <Phone size={16} className="mr-2" />
                            {sponsor.contact}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          {sponsor.proxy ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {sponsor.proxy.fullName} ({sponsor.proxy.role})
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Direct
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          {sponsor.sponsorships.length > 0 ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {sponsor.sponsorships.length} active
                              </span>
                              {sponsor.sponsorships
                                .slice(0, 2)
                                .map((sponsorship, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs text-gray-600"
                                  >
                                    {sponsorship.child.firstName}{" "}
                                    {sponsorship.child.lastName}
                                    <span className="text-gray-400 ml-1">
                                      ({sponsorship.child.school.name})
                                    </span>
                                  </div>
                                ))}
                              {sponsor.sponsorships.length > 2 && (
                                <div className="text-xs text-gray-400">
                                  +{sponsor.sponsorships.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Available
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => onViewSponsor(sponsor.id)}
                              className="flex items-center cursor-pointer space-x-1
                               px-3 py-1.5 text-xs
                               bg-blue-100 hover:bg-blue-200
                               text-blue-700 hover:text-blue-800
                               font-medium
                               rounded-md
                               transition-colors duration-200 cursor:pointer"
                            >
                              <Eye size={14} />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteSponsor(
                                  sponsor.id,
                                  sponsor.fullName
                                )
                              }
                              className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 cursor:pointer"
                              title="Delete sponsor"
                            >
                              <Trash2 size={14} />
                            </button>
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
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {sponsor.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">
                            {sponsor.fullName}
                          </h4>
                          <p className="text-gray-600 flex items-center">
                            <Phone size={14} className="mr-1" />
                            {sponsor.contact}
                          </p>
                        </div>
                      </div>
                    </div>

                    {sponsor.proxy && (
                      <div className="mb-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Via: {sponsor.proxy.fullName} ({sponsor.proxy.role})
                        </span>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewSponsor(sponsor.id)}
                        className="flex items-center cursor-pointer space-x-1
                               px-3 py-1.5 text-xs
                               bg-blue-100 hover:bg-blue-200
                               text-blue-700 hover:text-blue-800
                               font-medium
                               rounded-md
                               transition-colors duration-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteSponsor(sponsor.id, sponsor.fullName)
                        }
                        className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 cursor:pointer"
                        title="Delete sponsor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Users className="mx-auto text-gray-400 mb-6" size={64} />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchTerm || hasActiveFilters
                ? "No sponsors found"
                : "No sponsors yet"}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || hasActiveFilters
                ? "Try adjusting your search terms or filters to find sponsors."
                : "Start by adding your first sponsor to begin managing sponsorships."}
            </p>
            {(searchTerm || hasActiveFilters) && (
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors mr-4"
              >
                Clear Filters
              </button>
            )}
            <Link
              to="/register-sponsor"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add New Sponsor</span>
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Delete Sponsor
                  </h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{modalData.sponsorName}"</span>
                ?
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteSponsor}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Error Modal */}
      {showErrorModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Error</h3>
                  <p className="text-gray-600">Something went wrong</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{modalData.errorMessage}</p>

              <button
                onClick={closeModals}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* Success Modal */}
      {showSuccessModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Success</h3>
                  <p className="text-gray-600">Operation completed</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{modalData.successMessage}</p>

              <button
                onClick={closeModals}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
