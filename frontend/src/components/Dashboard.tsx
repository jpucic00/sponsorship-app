import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
      const [childrenRes, sponsorsRes, schoolsRes] = await Promise.all([
        fetch("/api/children"),
        fetch("/api/sponsors"),
        fetch("/api/schools"),
      ]);

      const children = await childrenRes.json();
      const sponsors = await sponsorsRes.json();
      const schools = await schoolsRes.json();

      const sponsoredChildren = children.filter(
        (child: any) => child.isSponsored
      ).length;
      const recentChildren = children.slice(0, 5); // Get 5 most recent

      setStats({
        totalChildren: children.length,
        sponsoredChildren,
        totalSponsors: sponsors.length,
        totalSchools: schools.length,
        recentChildren,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const sponsorshipRate =
    stats.totalChildren > 0
      ? ((stats.sponsoredChildren / stats.totalChildren) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Overview of children sponsorship program
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👶</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Children
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalChildren}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">💚</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sponsored Children
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.sponsoredChildren}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🤝</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Sponsors
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalSponsors}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🎓</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Schools
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalSchools}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsorship Rate */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Sponsorship Progress
        </h2>
        <div className="flex items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Sponsorship Rate
          </span>
          <span className="ml-auto text-sm font-medium text-gray-900">
            {sponsorshipRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${sponsorshipRate}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {stats.sponsoredChildren} out of {stats.totalChildren} children are
          sponsored
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/register-child"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2">➕</span>
            Add New Child
          </Link>
          <Link
            to="/register-sponsor"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <span className="mr-2">👥</span>
            Add New Sponsor
          </Link>
          <Link
            to="/import"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            <span className="mr-2">📄</span>
            Import from Excel
          </Link>
        </div>
      </div>

      {/* Recent Children */}
      {stats.recentChildren.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recently Added Children
            </h2>
            <Link
              to="/children"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentChildren.map((child) => (
                  <tr key={child.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {child.firstName} {child.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {child.school?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {child.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          child.isSponsored
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {child.isSponsored ? "Sponsored" : "Needs Sponsor"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
