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
  PieChart,
  BarChart3,
  Calendar,
  MapPin,
  Eye,
  Target,
  Award,
  Activity,
  BookOpen,
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
  const [chartTimeSpan, setChartTimeSpan] = useState<1 | 3 | 6 | 12>(1);
  const [chartType, setChartType] = useState<"line" | "bar">("line");

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

  // Custom Chart Component (since recharts is not available)
  const CustomChart = ({
    data,
    type,
  }: {
    data: any[];
    type: "line" | "bar";
  }) => {
    const maxValue = Math.max(
      ...data.flatMap((item) => [
        item.newChildren,
        item.newSponsors,
        item.newSponsorships,
      ])
    );

    return (
      <div className="bg-white rounded-xl p-4 border border-blue-200">
        <div className="h-96 flex items-end justify-between space-x-2 px-4 py-2">
          {data.map((item, index) => {
            const heightChildren = (item.newChildren / maxValue) * 320;
            const heightSponsors = (item.newSponsors / maxValue) * 320;
            const heightSponsorships = (item.newSponsorships / maxValue) * 320;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center space-y-2"
              >
                <div className="flex items-end space-x-1 h-80 w-full justify-center">
                  {type === "bar" ? (
                    <>
                      <div
                        className="bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600 cursor-pointer group relative"
                        style={{ height: `${heightChildren}px`, width: "20px" }}
                        title={`New Children: ${item.newChildren}`}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Children: {item.newChildren}
                        </div>
                      </div>
                      <div
                        className="bg-green-500 rounded-t transition-all duration-500 hover:bg-green-600 cursor-pointer group relative"
                        style={{ height: `${heightSponsors}px`, width: "20px" }}
                        title={`New Sponsors: ${item.newSponsors}`}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Sponsors: {item.newSponsors}
                        </div>
                      </div>
                      <div
                        className="bg-purple-500 rounded-t transition-all duration-500 hover:bg-purple-600 cursor-pointer group relative"
                        style={{
                          height: `${heightSponsorships}px`,
                          width: "20px",
                        }}
                        title={`New Sponsorships: ${item.newSponsorships}`}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Sponsorships: {item.newSponsorships}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="relative w-full h-full">
                      <svg
                        width="100%"
                        height="100%"
                        className="overflow-visible"
                      >
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map((percent) => (
                          <line
                            key={percent}
                            x1="0"
                            y1={`${100 - percent}%`}
                            x2="100%"
                            y2={`${100 - percent}%`}
                            stroke="#e5e7eb"
                            strokeDasharray="2,2"
                          />
                        ))}

                        {/* Line for children */}
                        <polyline
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          points={data
                            .map(
                              (item, i) =>
                                `${(i / (data.length - 1)) * 100}%,${
                                  100 - (item.newChildren / maxValue) * 100
                                }%`
                            )
                            .join(" ")}
                        />

                        {/* Line for sponsors */}
                        <polyline
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          points={data
                            .map(
                              (item, i) =>
                                `${(i / (data.length - 1)) * 100}%,${
                                  100 - (item.newSponsors / maxValue) * 100
                                }%`
                            )
                            .join(" ")}
                        />

                        {/* Line for sponsorships */}
                        <polyline
                          fill="none"
                          stroke="#8b5cf6"
                          strokeWidth="3"
                          points={data
                            .map(
                              (item, i) =>
                                `${(i / (data.length - 1)) * 100}%,${
                                  100 - (item.newSponsorships / maxValue) * 100
                                }%`
                            )
                            .join(" ")}
                        />

                        {/* Data points */}
                        {data.map((item, i) => (
                          <g key={i}>
                            <circle
                              cx={`${(i / (data.length - 1)) * 100}%`}
                              cy={`${
                                100 - (item.newChildren / maxValue) * 100
                              }%`}
                              r="4"
                              fill="#3b82f6"
                              className="hover:r-6 cursor-pointer transition-all"
                            />
                            <circle
                              cx={`${(i / (data.length - 1)) * 100}%`}
                              cy={`${
                                100 - (item.newSponsors / maxValue) * 100
                              }%`}
                              r="4"
                              fill="#10b981"
                              className="hover:r-6 cursor-pointer transition-all"
                            />
                            <circle
                              cx={`${(i / (data.length - 1)) * 100}%`}
                              cy={`${
                                100 - (item.newSponsorships / maxValue) * 100
                              }%`}
                              r="4"
                              fill="#8b5cf6"
                              className="hover:r-6 cursor-pointer transition-all"
                            />
                          </g>
                        ))}
                      </svg>
                    </div>
                  )}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                <p className="text-green-700 font-medium">
                  🎉 {data.overview.sponsoredChildren.toLocaleString()} children
                  have sponsors
                </p>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-2xl border border-yellow-100">
                <p className="text-yellow-700 font-medium">
                  ⏳ {data.overview.unsponsoredChildren.toLocaleString()}{" "}
                  children need sponsors
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-blue-700 font-medium">
                  🤝 {data.overview.activeSponsorships.toLocaleString()} active
                  sponsorships
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex flex-wrap justify-center space-x-2 mb-6">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "demographics", label: "Demographics", icon: PieChart },
              { id: "schools", label: "Schools", icon: GraduationCap },
              { id: "activity", label: "Recent Activity", icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Interactive Monthly Trends Chart */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-3">
                    <Calendar className="text-blue-600" size={24} />
                    <h3 className="text-xl font-bold text-gray-900">
                      Monthly Trends
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    {/* Time Span Selector */}
                    <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                      {[1, 3, 6, 12].map((months) => (
                        <button
                          key={months}
                          onClick={() =>
                            setChartTimeSpan(months as 1 | 3 | 6 | 12)
                          }
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

                    {/* Chart Type Selector */}
                    <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                      <button
                        onClick={() => setChartType("line")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                          chartType === "line"
                            ? "bg-purple-600 text-white shadow-md"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <TrendingUp size={16} />
                        <span>Line</span>
                      </button>
                      <button
                        onClick={() => setChartType("bar")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                          chartType === "bar"
                            ? "bg-purple-600 text-white shadow-md"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <BarChart3 size={16} />
                        <span>Bar</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chart Container */}
                <CustomChart data={filteredMonthlyData} type={chartType} />

                {/* Chart Summary */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-700">
                      Total New Children ({chartTimeSpan}M)
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {filteredMonthlyData.reduce(
                        (sum, item) => sum + item.newChildren,
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
                        (sum, item) => sum + item.newSponsors,
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
                        (sum, item) => sum + item.newSponsorships,
                        0
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Proxy Statistics */}
              {data.proxies.total > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <UserCheck className="mr-2" size={20} />
                    Proxy/Middleman Network
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-xl border border-purple-200 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {data.proxies.totalSponsorsViaProxy}
                      </div>
                      <div className="text-sm text-gray-600">
                        Sponsors via Proxy
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-purple-200 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {data.proxies.metrics.reduce(
                          (acc, p) => acc + p.activeSponsorships,
                          0
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Active Sponsorships
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {data.proxies.metrics.slice(0, 3).map((proxy) => (
                      <div
                        key={proxy.id}
                        className="bg-white p-3 rounded-xl border border-purple-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">
                            {proxy.fullName}
                          </div>
                          <div className="text-sm text-purple-600">
                            {proxy.role}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            {proxy.activeSponsorships} sponsorships
                          </div>
                          <div className="text-xs text-gray-500">
                            {proxy.totalSponsors} sponsors
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rest of the tab content remains the same... */}
          {activeTab === "demographics" && (
            <div className="space-y-6">
              {/* Age Distribution */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="mr-2" size={20} />
                  Age Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {Object.entries(data.demographics.ageDistribution).map(
                    ([ageGroup, stats]) => {
                      const sponsorshipRate =
                        stats.total > 0
                          ? Math.round((stats.sponsored / stats.total) * 100)
                          : 0;
                      return (
                        <div
                          key={ageGroup}
                          className="bg-white p-4 rounded-xl border border-green-200 text-center"
                        >
                          <div className="text-lg font-bold text-gray-900">
                            {stats.total}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {ageGroup}
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-green-600">
                              ✅ {stats.sponsored} sponsored
                            </div>
                            <div className="text-xs text-orange-600">
                              ⏳ {stats.total - stats.sponsored} need sponsors
                            </div>
                            <div className="text-xs font-semibold text-gray-700">
                              {sponsorshipRate}% rate
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Gender Distribution */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <PieChart className="mr-2" size={20} />
                  Gender Distribution & Sponsorship
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.demographics.genderWithSponsorship.map((genderStat) => {
                    const sponsorshipRate =
                      genderStat.total > 0
                        ? Math.round(
                            (genderStat.sponsored / genderStat.total) * 100
                          )
                        : 0;
                    return (
                      <div
                        key={genderStat.gender}
                        className="bg-white p-6 rounded-xl border border-blue-200"
                      >
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-gray-900">
                            {genderStat.total}
                          </div>
                          <div className="text-lg font-semibold text-blue-600">
                            {genderStat.gender} Children
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-orange-600">
                              ⏳ Need Sponsors
                            </span>
                            <span className="font-semibold">
                              {genderStat.unsponsored}
                            </span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${sponsorshipRate}%` }}
                            ></div>
                          </div>
                          <div className="text-center">
                            <span className="text-sm font-bold text-gray-700">
                              {sponsorshipRate}% Sponsored
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Education Levels */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="mr-2" size={20} />
                  Education Levels
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Object.entries(data.demographics.educationLevels).map(
                    ([level, count]) => (
                      <div
                        key={level}
                        className="bg-white p-4 rounded-xl border border-yellow-200 text-center"
                      >
                        <div className="text-xl font-bold text-gray-900">
                          {count}
                        </div>
                        <div className="text-sm text-gray-600">{level}</div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "schools" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="mr-2" size={20} />
                  School Performance Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-purple-200 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {data.schools.total}
                    </div>
                    <div className="text-sm text-gray-600">Total Schools</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-purple-200 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {data.schools.topPerforming}
                    </div>
                    <div className="text-sm text-gray-600">High Performing</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-purple-200 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(
                        data.schools.metrics.reduce(
                          (acc, school) => acc + school.sponsorshipRate,
                          0
                        ) / data.schools.metrics.length
                      )}
                      %
                    </div>
                    <div className="text-sm text-gray-600">
                      Avg Sponsorship Rate
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Top Performing Schools
                  </h4>
                  {data.schools.metrics
                    .sort((a, b) => b.sponsorshipRate - a.sponsorshipRate)
                    .slice(0, 5)
                    .map((school) => (
                      <div
                        key={school.id}
                        className="bg-white p-4 rounded-xl border border-purple-200 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {school.name}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {school.location}
                          </div>
                        </div>
                        <div className="text-center mx-4">
                          <div className="text-lg font-bold text-gray-900">
                            {school.totalChildren}
                          </div>
                          <div className="text-xs text-gray-500">
                            Total Children
                          </div>
                        </div>
                        <div className="text-center mx-4">
                          <div className="text-lg font-bold text-green-600">
                            {school.sponsoredChildren}
                          </div>
                          <div className="text-xs text-gray-500">Sponsored</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {school.sponsorshipRate}%
                          </div>
                          <div className="text-xs text-gray-500">
                            Success Rate
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Children */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Users className="mr-2" size={20} />
                    New Children
                  </h3>
                  <div className="space-y-3">
                    {data.trends.recentActivity.children
                      .slice(0, 5)
                      .map((child, index) => (
                        <div
                          key={index}
                          className="bg-white p-3 rounded-xl border border-blue-200"
                        >
                          <div className="font-semibold text-gray-900">
                            {child.fullName}
                          </div>
                          <div className="text-sm text-gray-600">
                            Age {child.age} • {child.schoolName}
                          </div>
                          <div className="text-xs text-blue-600">
                            Added{" "}
                            {
                              formatDateTimeWithRelative(child.createdAt)
                                .relative
                            }
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
                      .slice(0, 5)
                      .map((sponsor, index) => (
                        <div
                          key={index}
                          className="bg-white p-3 rounded-xl border border-green-200"
                        >
                          <div className="font-semibold text-gray-900">
                            {sponsor.fullName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {sponsor.email}
                          </div>
                          <div className="text-xs text-green-600">
                            Joined{" "}
                            {
                              formatDateTimeWithRelative(sponsor.createdAt)
                                .relative
                            }
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
                      .slice(0, 5)
                      .map((sponsorship, index) => (
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
                            {
                              formatDateTimeWithRelative(sponsorship.createdAt)
                                .relative
                            }
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

        {/* Insights & Alerts */}
        {data.insights.length > 0 && (
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

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <div className="text-sm opacity-90">Register new sponsor</div>
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
                  <div className="text-sm opacity-90">Bulk import children</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
