import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MessageSquare,
  User,
  MapPin,
  FileText,
  Calendar,
  Heart,
  DollarSign,
  Clock,
  AlertCircle,
} from "lucide-react";
import { formatDateTime } from "../utils/dateUtils";

interface Sponsor {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  contact?: string;
  createdAt: string;
  proxy?: {
    id: number;
    fullName: string;
    role: string;
    email?: string;
    phone?: string;
    contact?: string;
    description?: string;
  };
  sponsorships?: Array<{
    id: number;
    child: {
      id: number;
      firstName: string;
      lastName: string;
      dateOfBirth?: string;
      school?: {
        name: string;
        location: string;
      };
    };
    monthlyAmount?: number;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    notes?: string;
  }>;
}

interface SponsorDetailsProps {
  sponsorId: number;
  onBack: () => void;
}

export const SponsorDetails: React.FC<SponsorDetailsProps> = ({
  sponsorId,
  onBack,
}) => {
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSponsor = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/sponsors/${sponsorId}`);

        if (response.ok) {
          const data = await response.json();
          setSponsor(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to load sponsor details");
        }
      } catch (error) {
        console.error("Error fetching sponsor:", error);
        setError("Failed to load sponsor details");
      } finally {
        setLoading(false);
      }
    };

    if (sponsorId) {
      fetchSponsor();
    }
  }, [sponsorId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
          <p className="text-gray-600 font-medium">
            Loading sponsor details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !sponsor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle size={64} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sponsor Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The requested sponsor could not be found."}
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Sponsors List
          </button>
        </div>
      </div>
    );
  }

  // Get active and inactive sponsorships
  const activeSponsors = sponsor.sponsorships?.filter((s) => s.isActive) || [];
  const inactiveSponsors =
    sponsor.sponsorships?.filter((s) => !s.isActive) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Sponsors List</span>
          </button>

          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {sponsor.fullName}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                <Users size={16} className="mr-1" />
                Active Sponsor
              </span>
              {sponsor.proxy && (
                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                  Via Proxy
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Sponsor Information Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Users className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Sponsor Information
              </h2>
              <p className="text-gray-600">Direct contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Contact Information
              </h3>

              {/* Email */}
              {sponsor.email && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Email Address
                    </p>
                    <p className="text-blue-700 font-medium">{sponsor.email}</p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {sponsor.phone && (
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="text-green-600" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Phone Number
                    </p>
                    <p className="text-green-700 font-medium">
                      {sponsor.phone}
                    </p>
                  </div>
                </div>
              )}

              {/* Legacy Contact */}
              {sponsor.contact && (
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                    <MessageSquare className="text-gray-600" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      Additional Contact
                    </p>
                    <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                      {sponsor.contact}
                    </p>
                  </div>
                </div>
              )}

              {/* No contact info message */}
              {!sponsor.email && !sponsor.phone && !sponsor.contact && (
                <div className="text-center py-6 text-gray-500">
                  <MessageSquare
                    size={32}
                    className="mx-auto mb-2 opacity-50"
                  />
                  <p className="text-sm">No contact information available</p>
                </div>
              )}
            </div>

            {/* Registration Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Registration Information
              </h3>

              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="text-orange-600" size={16} />
                  <span className="text-sm font-semibold text-orange-700">
                    Registration Date
                  </span>
                </div>
                <p className="text-gray-700 font-medium">
                  {formatDateTime(sponsor.createdAt)}
                </p>
              </div>

              {/* Active Sponsorships Count */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="text-purple-600" size={16} />
                  <span className="text-sm font-semibold text-purple-700">
                    Active Sponsorships
                  </span>
                </div>
                <p className="text-gray-700 font-medium">
                  {activeSponsors.length} active sponsorship(s)
                </p>
              </div>

              {/* Total Sponsorships */}
              {sponsor.sponsorships && sponsor.sponsorships.length > 0 && (
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="text-indigo-600" size={16} />
                    <span className="text-sm font-semibold text-indigo-700">
                      Total Sponsorships
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {sponsor.sponsorships.length} total sponsorship(s)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Proxy Information Card */}
        {sponsor.proxy && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {sponsor.proxy.fullName}
                </h2>
                <p className="text-purple-600 font-medium">
                  {sponsor.proxy.role}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Proxy Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Proxy Contact Information
                </h3>

                {/* Proxy Email */}
                {sponsor.proxy.email && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Email Address
                      </p>
                      <p className="text-blue-700 font-medium">
                        {sponsor.proxy.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Proxy Phone */}
                {sponsor.proxy.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="text-green-600" size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Phone Number
                      </p>
                      <p className="text-green-700 font-medium">
                        {sponsor.proxy.phone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Proxy Additional Contact */}
                {sponsor.proxy.contact && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <MessageSquare className="text-gray-600" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">
                        Additional Information
                      </p>
                      <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                        {sponsor.proxy.contact}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Proxy Role and Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Role & Description
                </h3>

                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="text-purple-600" size={16} />
                    <span className="text-sm font-semibold text-purple-700">
                      Role
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {sponsor.proxy.role}
                  </p>
                </div>

                {sponsor.proxy.description && (
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <div className="flex items-start space-x-2 mb-2">
                      <FileText className="text-indigo-600 mt-1" size={16} />
                      <span className="text-sm font-semibold text-indigo-700">
                        Description
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {sponsor.proxy.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Information Message */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <MessageSquare className="text-blue-600" size={14} />
                </div>
                <div>
                  <p className="text-blue-800 font-medium text-sm">
                    Proxy/Representative Information
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    Contact the proxy for coordination of sponsorship activities
                    and local updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Proxy Message */}
        {!sponsor.proxy && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="text-center py-6">
              <div className="text-gray-500 mb-4">
                <User size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Direct Contact
                </h3>
                <p className="text-gray-600">
                  This sponsor does not use a proxy or middleman.
                  <br />
                  All communication can be done directly with the sponsor.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active Sponsorships List */}
        {activeSponsors.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Heart className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Active Sponsorships
                </h2>
                <p className="text-gray-600">
                  {activeSponsors.length} currently active sponsorship(s)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {activeSponsors.map((sponsorship) => (
                <div
                  key={sponsorship.id}
                  className="p-4 bg-green-50 rounded-xl border border-green-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {sponsorship.child.firstName}{" "}
                        {sponsorship.child.lastName}
                      </h3>
                      {sponsorship.child.school && (
                        <p className="text-sm text-gray-600 mt-1">
                          {sponsorship.child.school.name} -{" "}
                          {sponsorship.child.school.location}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <p className="text-sm text-gray-600">
                          <Clock size={14} className="inline mr-1" />
                          Started: {formatDateTime(sponsorship.startDate)}
                        </p>
                        {sponsorship.monthlyAmount && (
                          <p className="text-sm font-semibold text-green-700">
                            <DollarSign size={14} className="inline mr-1" />$
                            {sponsorship.monthlyAmount}/month
                          </p>
                        )}
                      </div>
                      {sponsorship.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          "{sponsorship.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previous Sponsorships */}
        {inactiveSponsors.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                <Clock className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Previous Sponsorships
                </h2>
                <p className="text-gray-600">
                  {inactiveSponsors.length} completed sponsorship(s)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {inactiveSponsors.map((sponsorship) => (
                <div
                  key={sponsorship.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {sponsorship.child.firstName}{" "}
                        {sponsorship.child.lastName}
                      </h3>
                      {sponsorship.child.school && (
                        <p className="text-sm text-gray-600 mt-1">
                          {sponsorship.child.school.name} -{" "}
                          {sponsorship.child.school.location}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <p className="text-sm text-gray-600">
                          <Clock size={14} className="inline mr-1" />
                          {formatDateTime(sponsorship.startDate)} -{" "}
                          {sponsorship.endDate
                            ? formatDateTime(sponsorship.endDate)
                            : "Ongoing"}
                        </p>
                        {sponsorship.monthlyAmount && (
                          <p className="text-sm text-gray-600">
                            <DollarSign size={14} className="inline mr-1" />$
                            {sponsorship.monthlyAmount}/month
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Sponsorships Message */}
        {(!sponsor.sponsorships || sponsor.sponsorships.length === 0) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <Heart size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Sponsorships Yet
                </h3>
                <p className="text-gray-600">
                  This sponsor hasn't been matched with any children yet.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
