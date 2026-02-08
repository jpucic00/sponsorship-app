import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  Archive,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
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
  isArchived?: boolean;
  archivedAt?: string;
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

  // Tab state for active/archived children
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");

  // Modal states for archive/restore/delete actions
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalData, setModalData] = useState<{
    childId?: number;
    childName?: string;
    errorMessage?: string;
    successMessage?: string;
  }>({});

  const fetchData = useCallback(
    async (page: number = 1, resetPage: boolean = false) => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: resetPage ? "1" : page.toString(),
          limit: "20",
          search: actualSearchTerm.trim(),
          archived: activeTab === "archived" ? "true" : "false",
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
        setProxies(Array.isArray(proxiesData) ? proxiesData : []);
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
      activeTab,
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
    activeTab,
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

  // Archive/Restore/Delete handlers
  const handleArchiveChild = (childId: number, childName: string) => {
    setModalData({ childId, childName });
    setShowArchiveModal(true);
  };

  const confirmArchiveChild = async () => {
    const { childId, childName } = modalData;
    if (!childId) return;

    setShowArchiveModal(false);

    try {
      const response = await fetch(`/api/children/${childId}/archive`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to archive child");
      }

      setModalData({
        successMessage: `"${childName}" has been archived successfully.`,
      });
      setShowSuccessModal(true);
      fetchData(pagination.currentPage);
    } catch (error) {
      setModalData({
        errorMessage: `Failed to archive child: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      setShowErrorModal(true);
    }
  };

  const handleRestoreChild = (childId: number, childName: string) => {
    setModalData({ childId, childName });
    setShowRestoreModal(true);
  };

  const confirmRestoreChild = async () => {
    const { childId, childName } = modalData;
    if (!childId) return;

    setShowRestoreModal(false);

    try {
      const response = await fetch(`/api/children/${childId}/restore`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to restore child");
      }

      setModalData({
        successMessage: `"${childName}" has been restored successfully.`,
      });
      setShowSuccessModal(true);
      fetchData(pagination.currentPage);
    } catch (error) {
      setModalData({
        errorMessage: `Failed to restore child: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      setShowErrorModal(true);
    }
  };

  const handlePermanentDelete = (childId: number, childName: string) => {
    setModalData({ childId, childName });
    setShowDeleteModal(true);
  };

  const confirmPermanentDelete = async () => {
    const { childId, childName } = modalData;
    if (!childId) return;

    setShowDeleteModal(false);

    try {
      const response = await fetch(`/api/children/${childId}/permanent`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete child");
      }

      setModalData({
        successMessage: `"${childName}" has been permanently deleted.`,
      });
      setShowSuccessModal(true);
      fetchData(pagination.currentPage);
    } catch (error) {
      setModalData({
        errorMessage: `Failed to delete child: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      setShowErrorModal(true);
    }
  };

  const closeModals = () => {
    setShowArchiveModal(false);
    setShowRestoreModal(false);
    setShowDeleteModal(false);
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setModalData({});
  };

  const handleTabChange = (tab: "active" | "archived") => {
    setActiveTab(tab);
    // Reset to page 1 when switching tabs
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
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
            {/* Tab Navigation */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handleTabChange("active")}
                className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === "active"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300"
                }`}
              >
                <Users size={18} />
                <span>Children</span>
              </button>
              <button
                onClick={() => handleTabChange("archived")}
                className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === "archived"
                    ? "bg-gray-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                <Archive size={18} />
                <span>Archive</span>
              </button>
            </div>

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
                isArchiveView={activeTab === "archived"}
                onArchive={handleArchiveChild}
                onRestore={handleRestoreChild}
                onPermanentDelete={handlePermanentDelete}
              />

              {/* Mobile Cards */}
              <ChildrenCardsMobile
                children={children}
                onViewChild={onViewChild}
                calculateAge={calculateAge}
                isArchiveView={activeTab === "archived"}
                onArchive={handleArchiveChild}
                onRestore={handleRestoreChild}
                onPermanentDelete={handlePermanentDelete}
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
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handleTabChange("active")}
                className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === "active"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300"
                }`}
              >
                <Users size={18} />
                <span>Children</span>
              </button>
              <button
                onClick={() => handleTabChange("archived")}
                className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === "archived"
                    ? "bg-gray-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                <Archive size={18} />
                <span>Archive</span>
              </button>
            </div>

            <EmptyState
              hasActiveFilters={hasActiveFilters}
              clearAllFilters={clearAllFilters}
            />
          </div>
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

      {/* Archive Confirmation Modal */}
      {showArchiveModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Archive className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Archive Child
                  </h3>
                  <p className="text-gray-600">
                    This child will be moved to archive
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to archive{" "}
                <span className="font-semibold">"{modalData.childName}"</span>?
                The child will be hidden from the main list and statistics but
                can be restored later.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmArchiveChild}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Restore Confirmation Modal */}
      {showRestoreModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <RotateCcw className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Restore Child
                  </h3>
                  <p className="text-gray-600">
                    This child will be restored to active list
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to restore{" "}
                <span className="font-semibold">"{modalData.childName}"</span>?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRestoreChild}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Restore
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Permanent Delete Confirmation Modal */}
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
                    Permanently Delete
                  </h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold">"{modalData.childName}"</span>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-red-700 text-sm">
                  <strong>Warning:</strong> This will permanently delete the
                  child record, all photos, and all sponsorship history. This
                  cannot be undone.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPermanentDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Forever
                </button>
              </div>
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
    </div>
  );
};
