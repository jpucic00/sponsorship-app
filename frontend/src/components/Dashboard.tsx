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
  BarChart3,
  Calendar,
  MapPin,
  Eye,
  Target,
  Award,
  Activity,
  Globe,
  UserCheck,
} from "lucide-react";
// Note: Using custom chart implementation since recharts is not available
import { formatDateTimeWithRelative } from "../utils/dateUtils";

interface DashboardData {
  overview: {
    totalChildren: number;
    totalSponsors: number;
    totalSchools: number;
    totalVolunteers: number;
    totalProxies: number;
    sponsoredChildren: number;
    unsponsoredChildren: number;
    activeSponsorships: number;
    totalSponsorships: number;
    sponsorshipRate: number;
  };
  demographics: {
    ageDistribution: Record<string, { total: number; sponsored: number }>;
    genderWithSponsorship: Array<{
      gender: string;
      total: number;
      sponsored: number;
      unsponsored: number;
    }>;
    educationLevels: Record<string, number>;
  };
  schools: {
    total: number;
    metrics: Array<{
      id: number;
      name: string;
      location: string;
      totalChildren: number;
      sponsoredChildren: number;
      unsponsoredChildren: number;
      sponsorshipRate: number;
    }>;
    topPerforming: number;
  };
  trends: {
    monthly: Array<{
      month: string;
      newChildren: number;
      newSponsors: number;
      newSponsorships: number;
    }>;
    recentActivity: {
      children: Array<any>;
      sponsors: Array<any>;
      sponsorships: Array<any>;
    };
  };
  proxies: {
    total: number;
    metrics: Array<{
      id: number;
      fullName: string;
      role: string;
      totalSponsors: number;
      activeSponsorships: number;
    }>;
    totalSponsorsViaProxy: number;
  };
  insights: Array<{
    type: "warning" | "info" | "success";
    title: string;
    message: string;
    value: number;
  }>;
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "demographics" | "schools" | "activity"
  >("overview");
  const [chartTimeSpan, setChartTimeSpan] = useState<1 | 3 | 6 | 12>(6);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/children/dashboard-statistics");
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      } else {
        console.error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to filter monthly data based on selected time span
  const getFilteredMonthlyData = () => {
    if (!data?.trends.monthly) return [];

    // Get the last N months based on selection
    const filteredData = data.trends.monthly.slice(-chartTimeSpan);

    return filteredData.map((item) => ({
      ...item,
      // Add a shorter month label for better chart display
      shortMonth: item.month.split(" ")[0], // Just "Jan", "Feb", etc.
    }));
  };

  // Fixed Custom Chart Component - Bar Chart Only
  const CustomChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-white rounded-xl p-4 border border-blue-200">
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <BarChart3 size={48} />
              </div>
              <p className="text-gray-500">No data available for this period</p>
            </div>
          </div>
        </div>
      );
    }

    const maxValue = Math.max(
      ...data.flatMap((item) => [
        item.newChildren || 0,
        item.newSponsors || 0,
        item.newSponsorships || 0,
      ])
    );

    // Prevent division by zero and ensure minimum height for visibility
    const safeMaxValue = Math.max(maxValue, 1);

    return (
      <div className="bg-white rounded-xl p-4 border border-blue-200">
        <div className="h-96 flex items-end justify-between space-x-2 px-4 py-2">
          {data.map((item, index) => {
            const heightChildren = Math.max(
              ((item.newChildren || 0) / safeMaxValue) * 320,
              4
            );
            const heightSponsors = Math.max(
              ((item.newSponsors || 0) / safeMaxValue) * 320,
              4
            );
            const heightSponsorships = Math.max(
              ((item.newSponsorships || 0) / safeMaxValue) * 320,
              4
            );

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center space-y-2"
              >
                <div className="flex items-end space-x-1 h-80 w-full justify-center">
                  <div
                    className="bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600 cursor-pointer group relative"
                    style={{ height: `${heightChildren}px`, width: "20px" }}
                    title={`New Children: ${item.newChildren || 0}`}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Children: {item.newChildren || 0}
                    </div>
                  </div>
                  <div
                    className="bg-green-500 rounded-t transition-all duration-500 hover:bg-green-600 cursor-pointer group relative"
                    style={{ height: `${heightSponsors}px`, width: "20px" }}
                    title={`New Sponsors: ${item.newSponsors || 0}`}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Sponsors: {item.newSponsors || 0}
                    </div>
                  </div>
                  <div
                    className="bg-purple-500 rounded-t transition-all duration-500 hover:bg-purple-600 cursor-pointer group relative"
                    style={{
                      height: `${heightSponsorships}px`,
                      width: "20px",
                    }}
                    title={`New Sponsorships: ${item.newSponsorships || 0}`}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Sponsorships: {item.newSponsorships || 0}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-600 text-center">
                  {item.shortMonth}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm font-medium text-gray-700">
              New Children
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm font-medium text-gray-700">
              New Sponsors
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm font-medium text-gray-700">
              New Sponsorships
            </span>
          </div>
        </div>
      </div>
    );
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

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Unable to Load Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            There was an error loading the dashboard data.
          </p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredMonthlyData = getFilteredMonthlyData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                  {data.overview.totalChildren.toLocaleString()}
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
                  Sponsored
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {data.overview.sponsoredChildren.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {data.overview.sponsorshipRate}% success rate
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserCheck className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Sponsors
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {data.overview.totalSponsors.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {data.overview.activeSponsorships} active sponsorships
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
                  {data.overview.totalSchools}
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  {data.schools.topPerforming} high-performing
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Need Sponsors
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {data.overview.unsponsoredChildren.toLocaleString()}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Waiting for support
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-2">
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { id: "overview", label: "Overview", icon: Eye },
              { id: "demographics", label: "Demographics", icon: Users },
              { id: "schools", label: "Schools", icon: GraduationCap },
              { id: "activity", label: "Activity", icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300"
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
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
                    Overall Sponsorship Rate
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {data.overview.sponsorshipRate}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: `${data.overview.sponsorshipRate}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {data.overview.sponsoredChildren}
                    </div>
                    <div className="text-sm text-gray-600">
                      Children Sponsored
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {data.overview.unsponsoredChildren}
                    </div>
                    <div className="text-sm text-gray-600">
                      Still Need Sponsors
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Monthly Trends Chart */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-3">
                  <Calendar className="text-blue-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">
                    Monthly Trends
                  </h3>
                </div>

                {/* Time Span Selector */}
                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                  {[1, 3, 6, 12].map((months) => (
                    <button
                      key={months}
                      onClick={() => setChartTimeSpan(months as 1 | 3 | 6 | 12)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        chartTimeSpan === months
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {months}M
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Container */}
              <CustomChart data={filteredMonthlyData} />

              {/* Chart Summary */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-700">
                    Total New Children ({chartTimeSpan}M)
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {filteredMonthlyData.reduce(
                      (sum, item) => sum + (item.newChildren || 0),
                      0
                    )}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-sm font-medium text-green-700">
                    Total New Sponsors ({chartTimeSpan}M)
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {filteredMonthlyData.reduce(
                      (sum, item) => sum + (item.newSponsors || 0),
                      0
                    )}
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="text-sm font-medium text-purple-700">
                    Total New Sponsorships ({chartTimeSpan}M)
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {filteredMonthlyData.reduce(
                      (sum, item) => sum + (item.newSponsorships || 0),
                      0
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            {data.trends.recentActivity && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Activity className="mr-3" size={24} />
                  Recent Activity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Recent Children */}
                  <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Users className="mr-2" size={20} />
                      New Children
                    </h3>
                    <div className="space-y-3">
                      {data.trends.recentActivity.children
                        ?.slice(0, 5)
                        .map((child: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white p-3 rounded-xl border border-blue-200"
                          >
                            <div className="font-semibold text-gray-900">
                              {child.firstName} {child.lastName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {child.school?.name}
                            </div>
                            <div className="text-xs text-blue-600">
                              Registered{" "}
                              {child.createdAt
                                ? formatDateTimeWithRelative(child.createdAt)
                                    .relative
                                : "recently"}
                            </div>
                          </div>
                        ))}
                    </div>
                    <Link
                      to="/children"
                      className="block w-full text-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      View All Children
                    </Link>
                  </div>

                  {/* Recent Sponsors */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Heart className="mr-2" size={20} />
                      New Sponsors
                    </h3>
                    <div className="space-y-3">
                      {data.trends.recentActivity.sponsors
                        ?.slice(0, 5)
                        .map((sponsor: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white p-3 rounded-xl border border-green-200"
                          >
                            <div className="font-semibold text-gray-900">
                              {sponsor.fullName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {sponsor.email || sponsor.contact}
                            </div>
                            <div className="text-xs text-green-600">
                              Joined{" "}
                              {sponsor.createdAt
                                ? formatDateTimeWithRelative(sponsor.createdAt)
                                    .relative
                                : "recently"}
                            </div>
                          </div>
                        ))}
                    </div>
                    <Link
                      to="/sponsors"
                      className="block w-full text-center mt-4 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      View All Sponsors
                    </Link>
                  </div>

                  {/* Recent Sponsorships */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Award className="mr-2" size={20} />
                      New Sponsorships
                    </h3>
                    <div className="space-y-3">
                      {data.trends.recentActivity.sponsorships
                        ?.slice(0, 5)
                        .map((sponsorship: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white p-3 rounded-xl border border-purple-200"
                          >
                            <div className="font-semibold text-gray-900">
                              {sponsorship.sponsorName}
                            </div>
                            <div className="text-sm text-gray-600">
                              ↔️ {sponsorship.childName}
                            </div>
                            <div className="text-xs text-purple-600">
                              Started{" "}
                              {sponsorship.createdAt
                                ? formatDateTimeWithRelative(
                                    sponsorship.createdAt
                                  ).relative
                                : "recently"}
                            </div>
                          </div>
                        ))}
                    </div>
                    <Link
                      to="/sponsorships"
                      className="block w-full text-center mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    >
                      View All Sponsorships
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Demographics Tab */}
        {activeTab === "demographics" && (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="mr-3" size={24} />
                Demographics Overview
              </h2>

              {/* Gender Distribution */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Gender Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.demographics.genderWithSponsorship.map(
                    (gender, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200"
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold text-indigo-900">
                            {gender.total}
                          </div>
                          <div className="text-sm font-medium text-indigo-700 mb-2">
                            {gender.gender}
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-green-600">
                                Sponsored: {gender.sponsored}
                              </span>
                              <span className="text-orange-600">
                                Need sponsors: {gender.unsponsored}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (gender.sponsored / gender.total) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Education Levels */}
              {data.demographics.educationLevels &&
                Object.keys(data.demographics.educationLevels).length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Education Levels
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {Object.entries(data.demographics.educationLevels).map(
                        ([level, count], index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200 text-center"
                          >
                            <div className="text-xl font-bold text-emerald-900">
                              {count}
                            </div>
                            <div className="text-sm font-medium text-emerald-700">
                              {level}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Age Distribution */}
              {data.demographics.ageDistribution &&
                Object.keys(data.demographics.ageDistribution).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Age Distribution
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {Object.entries(data.demographics.ageDistribution).map(
                        ([age, data], index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-200 text-center"
                          >
                            <div className="text-xl font-bold text-rose-900">
                              {data.total}
                            </div>
                            <div className="text-sm font-medium text-rose-700">
                              {age} years
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              {data.sponsored} sponsored
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Schools Tab */}
        {activeTab === "schools" && (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <GraduationCap className="mr-3" size={24} />
                Schools Performance
              </h2>

              {/* Schools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.schools.metrics.map((school, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {school.name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin size={14} className="mr-1" />
                          {school.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-amber-900">
                          {school.sponsorshipRate}%
                        </div>
                        <div className="text-xs text-amber-700">
                          Success Rate
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">
                          Total Children
                        </span>
                        <span className="font-semibold text-gray-900">
                          {school.totalChildren}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">
                          Sponsored
                        </span>
                        <span className="font-semibold text-green-700">
                          {school.sponsoredChildren}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-orange-600">
                          Need Sponsors
                        </span>
                        <span className="font-semibold text-orange-700">
                          {school.unsponsoredChildren}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${school.sponsorshipRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Schools Summary */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 text-center">
                  <div className="text-3xl font-bold text-blue-900">
                    {data.schools.total}
                  </div>
                  <div className="text-sm font-medium text-blue-700">
                    Total Schools
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 text-center">
                  <div className="text-3xl font-bold text-green-900">
                    {data.schools.topPerforming}
                  </div>
                  <div className="text-sm font-medium text-green-700">
                    High Performing (80%+)
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 text-center">
                  <div className="text-3xl font-bold text-purple-900">
                    {Math.round(
                      data.schools.metrics.reduce(
                        (acc, school) => acc + school.sponsorshipRate,
                        0
                      ) / data.schools.metrics.length
                    )}
                    %
                  </div>
                  <div className="text-sm font-medium text-purple-700">
                    Average Success Rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="space-y-8">
            {/* Proxy/Middleman Network */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <UserCheck className="mr-3" size={24} />
                Proxy/Middleman Network
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 text-center">
                  <div className="text-3xl font-bold text-indigo-900">
                    {data.proxies.totalSponsorsViaProxy}
                  </div>
                  <div className="text-sm font-medium text-indigo-700">
                    Sponsors via Proxy
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200 text-center">
                  <div className="text-3xl font-bold text-emerald-900">
                    {data.overview.activeSponsorships}
                  </div>
                  <div className="text-sm font-medium text-emerald-700">
                    Active Sponsorships
                  </div>
                </div>
              </div>

              {/* Top Proxies */}
              <div className="space-y-4">
                {data.proxies.metrics.map((proxy, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {proxy.fullName}
                        </h3>
                        <p className="text-sm text-purple-600 font-medium">
                          {proxy.role}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {proxy.activeSponsorships}
                        </div>
                        <div className="text-xs text-gray-600">
                          Active Sponsorships
                        </div>
                        <div className="text-sm text-indigo-600">
                          {proxy.totalSponsors} sponsors
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions - PROPERLY CENTERED */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Actions
          </h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
              <Link
                to="/children/add"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <Plus size={24} />
                  <div>
                    <div className="font-bold">Add Child</div>
                    <div className="text-sm opacity-90">Register new child</div>
                  </div>
                </div>
              </Link>

              <Link
                to="/sponsors/add"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <UserPlus size={24} />
                  <div>
                    <div className="font-bold">Add Sponsor</div>
                    <div className="text-sm opacity-90">
                      Register new sponsor
                    </div>
                  </div>
                </div>
              </Link>

              <Link
                to="/children/import"
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileUp size={24} />
                  <div>
                    <div className="font-bold">Import Data</div>
                    <div className="text-sm opacity-90">
                      Bulk import children
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Insights & Alerts */}
        {data.insights && data.insights.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Target className="mr-3" size={24} />
              Key Insights & Alerts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.insights.map((insight, index) => {
                const bgColor =
                  insight.type === "warning"
                    ? "from-yellow-50 to-orange-50 border-yellow-200"
                    : insight.type === "info"
                    ? "from-blue-50 to-indigo-50 border-blue-200"
                    : "from-green-50 to-emerald-50 border-green-200";

                const iconColor =
                  insight.type === "warning"
                    ? "text-yellow-600"
                    : insight.type === "info"
                    ? "text-blue-600"
                    : "text-green-600";

                const Icon =
                  insight.type === "warning"
                    ? Target
                    : insight.type === "info"
                    ? Eye
                    : Award;

                return (
                  <div
                    key={index}
                    className={`bg-gradient-to-r ${bgColor} rounded-2xl p-6 border`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={iconColor} size={24} />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">
                          {insight.title}
                        </h3>
                        <p className="text-sm text-gray-700 mb-3">
                          {insight.message}
                        </p>
                        <div className="text-2xl font-bold text-gray-900">
                          {insight.value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
