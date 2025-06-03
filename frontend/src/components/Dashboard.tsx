import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Heart,
  GraduationCap,
  Plus,
  FileUp,
  UserPlus,
} from "lucide-react";

interface DashboardStats {
  totalChildren: number;
  sponsoredChildren: number;
  totalSponsors: number;
  totalSchools: number;
  recentChildren: any[];
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalChildren: 0,
    sponsoredChildren: 0,
    totalSponsors: 0,
    totalSchools: 0,
    recentChildren: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch first page of children with a limit to get total count
      const [childrenRes, sponsorsRes, schoolsRes] = await Promise.all([
        fetch("/api/children?page=1&limit=5"), // Get first 5 for recent children
        fetch("/api/sponsors?page=1&limit=1"), // Just need total count
        fetch("/api/schools"),
      ]);

      const childrenData = await childrenRes.json();
      const sponsorsData = await sponsorsRes.json();
      const schools = await schoolsRes.json();

      // Handle both paginated and non-paginated responses
      const children = childrenData.data || childrenData;
      const sponsors = sponsorsData.data || sponsorsData;

      // Get total counts from pagination info if available
      const totalChildren =
        childrenData.pagination?.totalCount || children.length;
      const totalSponsors =
        sponsorsData.pagination?.totalCount || sponsors.length;

      const sponsoredChildren = children.filter(
        (child: any) => child.isSponsored
      ).length;

      // For the full sponsored count, we need to make another API call
      // since we only got 5 children for the recent list
      let fullSponsoredCount = sponsoredChildren;
      if (childrenData.pagination) {
        // Make a call to get just sponsored children count
        try {
          const sponsoredRes = await fetch(
            "/api/children?sponsorship=sponsored&limit=1"
          );
          const sponsoredData = await sponsoredRes.json();
          fullSponsoredCount = sponsoredData.pagination?.totalCount || 0;
        } catch (error) {
          console.error("Error fetching sponsored children count:", error);
        }
      }

      setStats({
        totalChildren,
        sponsoredChildren: fullSponsoredCount,
        totalSponsors,
        totalSchools: schools.length,
        recentChildren: children.slice(0, 5),
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const sponsorshipRate =
    stats.totalChildren > 0
      ? ((stats.sponsoredChildren / stats.totalChildren) * 100).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Sponsorship Dashboard
          </h1>
          <p className="text-gray-600 text-xl">
            Overview of children sponsorship program
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total Children
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalChildren}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Sponsored Children
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.sponsoredChildren}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total Sponsors
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalSponsors}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <GraduationCap className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Schools
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalSchools}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsorship Progress */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="text-green-600" size={28} />
            <h2 className="text-3xl font-bold text-gray-900">
              Sponsorship Progress
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">
                Sponsorship Rate
              </span>
              <span className="text-2xl font-bold text-green-600">
                {sponsorshipRate}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${sponsorshipRate}%` }}
              ></div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
              <p className="text-green-700 font-medium">
                🎉 {stats.sponsoredChildren} out of {stats.totalChildren}{" "}
                children have found sponsors
              </p>
              <p className="text-green-600 text-sm mt-1">
                Keep up the great work!{" "}
                {stats.totalChildren - stats.sponsoredChildren} children still
                need sponsors.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/register-child"
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-4">
                <Plus size={32} className="text-white" />
                <div>
                  <h3 className="text-xl font-bold">Add New Child</h3>
                  <p className="text-blue-100 text-sm">
                    Register a child in need
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/register-sponsor"
              className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-4">
                <UserPlus size={32} className="text-white" />
                <div>
                  <h3 className="text-xl font-bold">Add New Sponsor</h3>
                  <p className="text-green-100 text-sm">
                    Register a new sponsor
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/import"
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 p-8 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-4">
                <FileUp size={32} className="text-white" />
                <div>
                  <h3 className="text-xl font-bold">Import from Excel</h3>
                  <p className="text-purple-100 text-sm">
                    Bulk import children data
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Children */}
        {stats.recentChildren.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Recently Added Children
              </h2>
              <Link
                to="/children"
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-2 transition-colors duration-200"
              >
                <span>View All ({stats.totalChildren})</span>
                <span>→</span>
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      School
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentChildren.map((child, index) => (
                    <tr
                      key={child.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {child.firstName} {child.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {child.school?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {child.class}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            child.isSponsored
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {child.isSponsored
                            ? "✅ Sponsored"
                            : "⏳ Needs Sponsor"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Show pagination info */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Showing {stats.recentChildren.length} of {stats.totalChildren}{" "}
                children.{" "}
                <Link
                  to="/children"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all children with pagination →
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Heart className="text-red-500 mr-2" size={20} />
              Sponsorship Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  Children needing sponsors:
                </span>
                <span className="font-bold text-yellow-600">
                  {stats.totalChildren - stats.sponsoredChildren}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active sponsorships:</span>
                <span className="font-bold text-green-600">
                  {stats.sponsoredChildren}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available sponsors:</span>
                <span className="font-bold text-blue-600">
                  {stats.totalSponsors}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <GraduationCap className="text-purple-500 mr-2" size={20} />
              System Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Schools registered:</span>
                <span className="font-bold text-purple-600">
                  {stats.totalSchools}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Children per page:</span>
                <span className="font-bold text-indigo-600">20</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total pages:</span>
                <span className="font-bold text-indigo-600">
                  {Math.ceil(stats.totalChildren / 20)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
