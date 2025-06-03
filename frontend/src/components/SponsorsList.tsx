import React, { useState, useEffect } from "react";
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
} from "lucide-react";

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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Sponsors Directory
          </h1>
          <p className="text-gray-600 text-xl">
            {filteredSponsors.length} sponsors found
          </p>
        </div>

        {/* Search and Add Button */}
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

            {/* Add Button */}
            <Link
              to="/register-sponsor"
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Plus size={20} />
              <span>Add New Sponsor</span>
            </Link>
          </div>
        </div>

        {/* Sponsors List */}
        {filteredSponsors.length > 0 ? (
          <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
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
                    {filteredSponsors.map((sponsor, index) => (
                      <tr
                        key={sponsor.id}
                        className={`hover:bg-blue-50/50 transition-colors duration-200 ${
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
                              {sponsor.contact}
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
                              {sponsor.sponsorships.map(
                                (sponsorship, index) => (
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
                                )
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
                            <button className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
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
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredSponsors.map((sponsor) => (
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
                        {sponsor.contact}
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
                          Sponsored Children:
                        </p>
                        {sponsor.sponsorships.map((sponsorship, index) => (
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
                    <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      View
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
        ) : (
          /* Empty State */
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
            <div className="text-8xl mb-6">🤝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No sponsors found
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              {searchTerm
                ? "Try adjusting your search terms to see more results."
                : "Get started by adding your first sponsor to the system."}
            </p>
            <Link
              to="/register-sponsor"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Plus size={20} className="mr-2" />
              Add First Sponsor
            </Link>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-3">
              <Users className="text-green-600" size={28} />
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total Sponsors
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {sponsors.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-3">
              <Heart className="text-red-600" size={28} />
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Active Sponsorships
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {sponsors.reduce(
                    (total, sponsor) => total + sponsor.sponsorships.length,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-3">
              <Clock className="text-yellow-600" size={28} />
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Available Sponsors
                </p>
                <p className="text-3xl font-bold text-gray-900">
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
    </div>
  );
};
