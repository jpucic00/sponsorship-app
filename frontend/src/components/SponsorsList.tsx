import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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

export const SponsorsList: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const response = await fetch("/api/sponsors");
      const data = await response.json();
      setSponsors(data);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSponsors = sponsors.filter(
    (sponsor) =>
      sponsor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.proxy?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sponsors</h1>
            <p className="text-gray-600 mt-1">
              {filteredSponsors.length} sponsors found
            </p>
          </div>
          <Link
            to="/register-sponsor"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <span className="mr-2">➕</span>
            Add New Sponsor
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Sponsors
          </label>
          <input
            type="text"
            placeholder="Search by name, contact, or proxy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Sponsors List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredSponsors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sponsor Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proxy/Middleman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sponsored Children
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSponsors.map((sponsor) => (
                  <tr key={sponsor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sponsor.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {sponsor.contact}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sponsor.proxy ? (
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">
                            {sponsor.proxy.fullName}
                          </div>
                          <div className="text-gray-500">
                            ({sponsor.proxy.role})
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Direct contact
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {sponsor.sponsorships.length > 0 ? (
                          <div className="space-y-1">
                            {sponsor.sponsorships.map((sponsorship, index) => (
                              <div key={index} className="text-xs">
                                <span className="font-medium">
                                  {sponsorship.child.firstName}{" "}
                                  {sponsorship.child.lastName}
                                </span>
                                <span className="text-gray-500 ml-1">
                                  ({sponsorship.child.school.name})
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-yellow-600 text-sm">
                            No children yet
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          View
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          Edit
                        </button>
                        {sponsor.sponsorships.length === 0 && (
                          <button className="text-purple-600 hover:text-purple-900">
                            Match Child
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🤝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sponsors found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try adjusting your search terms to see more results."
                : "Get started by adding your first sponsor to the system."}
            </p>
            <Link
              to="/register-sponsor"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <span className="mr-2">➕</span>
              Add First Sponsor
            </Link>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total Sponsors
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {sponsors.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">💚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Active Sponsorships
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {sponsors.reduce(
                  (total, sponsor) => total + sponsor.sponsorships.length,
                  0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Available Sponsors
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {
                  sponsors.filter(
                    (sponsor) => sponsor.sponsorships.length === 0
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
