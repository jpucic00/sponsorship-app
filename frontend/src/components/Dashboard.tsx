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
              {/* Monthly Trends Chart */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Calendar className="mr-2" size={20} />
                  Monthly Trends (Last 12 Months)
                </h3>
                <div className="overflow-x-auto">
                  <div className="flex space-x-4 min-w-full">
                    {data.trends.monthly.map((month, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 bg-white p-4 rounded-xl border border-blue-200 min-w-[140px]"
                      >
                        <div className="text-sm font-semibold text-blue-900 mb-2">
                          {month.month}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="text-blue-600">
                            📚 {month.newChildren} new children
                          </div>
                          <div className="text-green-600">
                            🤝 {month.newSponsors} new sponsors
                          </div>
                          <div className="text-purple-600">
                            ❤️ {month.newSponsorships} new sponsorships
                          </div>
                        </div>
                      </div>
                    ))}
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
                            <span className="text-sm text-green-600">
                              ✅ Sponsored
                            </span>
                            <span className="font-semibold">
                              {genderStat.sponsored}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-orange-600">
                              ⏳ Need Sponsors
                            </span>
                            <span className="font-semibold">
                              {genderStat.unsponsored}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-t pt-2">
                            <span className="text-sm font-semibold text-gray-700">
                              Sponsorship Rate
                            </span>
                            <span className="font-bold text-blue-600">
                              {sponsorshipRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Education Levels */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="mr-2" size={20} />
                  Education Level Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(data.demographics.educationLevels).map(
                    ([level, count]) => (
                      <div
                        key={level}
                        className="bg-white p-4 rounded-xl border border-purple-200 text-center"
                      >
                        <div className="text-2xl font-bold text-purple-600">
                          {count}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {level}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "schools" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Award className="mr-2" size={20} />
                  School Performance Metrics
                </h3>
                <div className="space-y-4">
                  {data.schools.metrics.slice(0, 8).map((school, index) => (
                    <div
                      key={school.id}
                      className="bg-white p-4 rounded-xl border border-indigo-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                index === 0
                                  ? "bg-yellow-500"
                                  : index === 1
                                  ? "bg-gray-400"
                                  : index === 2
                                  ? "bg-orange-500"
                                  : "bg-indigo-500"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {school.name}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center">
                                <MapPin size={12} className="mr-1" />
                                {school.location}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-lg font-bold text-gray-900">
                            {school.totalChildren} children
                          </div>
                          <div className="text-sm text-green-600">
                            ✅ {school.sponsoredChildren} sponsored
                          </div>
                          <div className="text-sm text-orange-600">
                            ⏳ {school.unsponsoredChildren} need sponsors
                          </div>
                          <div
                            className={`text-sm font-bold ${
                              school.sponsorshipRate >= 80
                                ? "text-green-600"
                                : school.sponsorshipRate >= 50
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {school.sponsorshipRate}% sponsored
                          </div>
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
              {/* Recent Children */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="mr-2" size={20} />
                  Recently Added Children
                </h3>
                {data.trends.recentActivity.children.length > 0 ? (
                  <div className="space-y-3">
                    {data.trends.recentActivity.children.map((child) => (
                      <div
                        key={child.id}
                        className="bg-white p-4 rounded-xl border border-blue-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">
                            {child.firstName} {child.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {child.school.name} • {child.class}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {
                              formatDateTimeWithRelative(child.createdAt)
                                .relative
                            }
                          </div>
                          <div
                            className={`text-xs px-2 py-1 rounded-full ${
                              child.isSponsored
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {child.isSponsored ? "Sponsored" : "Needs Sponsor"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent children added
                  </p>
                )}
              </div>

              {/* Recent Sponsors */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <UserCheck className="mr-2" size={20} />
                  Recently Added Sponsors
                </h3>
                {data.trends.recentActivity.sponsors.length > 0 ? (
                  <div className="space-y-3">
                    {data.trends.recentActivity.sponsors.map((sponsor) => (
                      <div
                        key={sponsor.id}
                        className="bg-white p-4 rounded-xl border border-green-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">
                            {sponsor.fullName}
                          </div>
                          {sponsor.proxy && (
                            <div className="text-sm text-purple-600">
                              Via: {sponsor.proxy.fullName} (
                              {sponsor.proxy.role})
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {
                              formatDateTimeWithRelative(sponsor.createdAt)
                                .relative
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent sponsors added
                  </p>
                )}
              </div>

              {/* Recent Sponsorships */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Heart className="mr-2" size={20} />
                  Recent Sponsorships Created
                </h3>
                {data.trends.recentActivity.sponsorships.length > 0 ? (
                  <div className="space-y-3">
                    {data.trends.recentActivity.sponsorships.map(
                      (sponsorship) => (
                        <div
                          key={sponsorship.id}
                          className="bg-white p-4 rounded-xl border border-purple-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {sponsorship.sponsor.fullName} ❤️{" "}
                                {sponsorship.child.firstName}{" "}
                                {sponsorship.child.lastName}
                              </div>
                              {sponsorship.monthlyAmount && (
                                <div className="text-sm text-green-600">
                                  ${sponsorship.monthlyAmount}/month
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">
                                {
                                  formatDateTimeWithRelative(
                                    sponsorship.createdAt
                                  ).relative
                                }
                              </div>
                              <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                Active
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent sponsorships created
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <Target className="mr-3" size={28} />
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <Link
              to="/children"
              className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 p-8 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-4">
                <Eye size={32} className="text-white" />
                <div>
                  <h3 className="text-xl font-bold">View All Children</h3>
                  <p className="text-indigo-100 text-sm">
                    Browse children database
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
