// File: src/components/SponsorDetails.tsx
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  Heart,
  Users,
  Phone,
  MapPin,
  Calendar,
  FileText,
  UserCheck,
  Clock,
  DollarSign,
  CreditCard,
  Link2,
  Mail,
  Home,
  User,
  GraduationCap,
} from "lucide-react";

interface Sponsor {
  id: number;
  fullName: string;
  contact: string;
  createdAt: string;
  updatedAt: string;
  proxy?: {
    id: number;
    fullName: string;
    role: string;
    contact: string;
    description?: string;
  };
  sponsorships: Array<{
    id: number;
    startDate: string;
    monthlyAmount?: number;
    paymentMethod?: string;
    notes?: string;
    isActive: boolean;
    child: {
      id: number;
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: string;
      class: string;
      school: {
        id: number;
        name: string;
        location: string;
      };
    };
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

  useEffect(() => {
    fetchSponsorDetails(sponsorId);
  }, [sponsorId]);

  const fetchSponsorDetails = async (id: number) => {
    try {
      const response = await fetch(`/api/sponsors/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSponsor(data);
      } else {
        console.error("Failed to fetch sponsor details");
      }
    } catch (error) {
      console.error("Error fetching sponsor details:", error);
    } finally {
      setLoading(false);
    }
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

  const parseContactInfo = (contact: string) => {
    const lines = contact.split("\n").filter((line) => line.trim());
    const parsed = {
      phone: "",
      email: "",
      address: "",
      other: [] as string[],
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.includes("@")) {
        parsed.email = trimmed;
      } else if (trimmed.match(/^\+?[\d\s\-\(\)]+$/)) {
        parsed.phone = trimmed;
      } else if (
        trimmed.toLowerCase().includes("address") ||
        trimmed.includes(",")
      ) {
        parsed.address = trimmed;
      } else {
        parsed.other.push(trimmed);
      }
    });

    return parsed;
  };

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

  if (!sponsor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sponsor Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested sponsor could not be found.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Sponsors List
          </button>
        </div>
      </div>
    );
  }

  const contactInfo = parseContactInfo(sponsor.contact);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-green-600 hover:text-green-800 font-medium mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Sponsors List</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {sponsor.fullName}
              </h1>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  ✅ Active Sponsor
                </span>
                <span className="text-gray-600">
                  {sponsor.sponsorships.length} active sponsorship
                  {sponsor.sponsorships.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                (window.location.href = `/edit-sponsor/${sponsor.id}`)
              }
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              <Edit size={20} />
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Phone className="text-blue-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contactInfo.phone && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="text-blue-600" size={18} />
                      <span className="font-semibold text-blue-700">Phone</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {contactInfo.phone}
                    </p>
                  </div>
                )}

                {contactInfo.email && (
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mail className="text-purple-600" size={18} />
                      <span className="font-semibold text-purple-700">
                        Email
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium break-words">
                      {contactInfo.email}
                    </p>
                  </div>
                )}

                {contactInfo.address && (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200 md:col-span-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Home className="text-green-600" size={18} />
                      <span className="font-semibold text-green-700">
                        Address
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {contactInfo.address}
                    </p>
                  </div>
                )}

                {contactInfo.other.length > 0 && (
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 md:col-span-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="text-orange-600" size={18} />
                      <span className="font-semibold text-orange-700">
                        Other Contact Info
                      </span>
                    </div>
                    <div className="space-y-1">
                      {contactInfo.other.map((info, index) => (
                        <p key={index} className="text-gray-900 font-medium">
                          {info}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Raw Contact Display as Fallback */}
              <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="text-gray-600" size={18} />
                  <span className="font-semibold text-gray-700">
                    Complete Contact Information
                  </span>
                </div>
                <div className="text-gray-800 whitespace-pre-line font-mono text-sm bg-white p-3 rounded-lg">
                  {sponsor.contact}
                </div>
              </div>
            </div>

            {/* Sponsored Children */}
            {sponsor.sponsorships.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Heart className="text-red-500" size={28} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Sponsored Children ({sponsor.sponsorships.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {sponsor.sponsorships.map((sponsorship) => (
                    <div
                      key={sponsorship.id}
                      className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                            {sponsorship.child.firstName[0]}
                            {sponsorship.child.lastName[0]}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {sponsorship.child.firstName}{" "}
                              {sponsorship.child.lastName}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span>
                                {calculateAge(sponsorship.child.dateOfBirth)}{" "}
                                years old
                              </span>
                              <span>•</span>
                              <span>{sponsorship.child.gender}</span>
                              <span>•</span>
                              <span>{sponsorship.child.class}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <GraduationCap
                                className="text-blue-500"
                                size={16}
                              />
                              <span className="text-sm text-gray-700 font-medium">
                                {sponsorship.child.school.name},{" "}
                                {sponsorship.child.school.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                              sponsorship.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {sponsorship.isActive ? "✅ Active" : "⏸️ Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-white p-3 rounded-lg border border-red-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <Calendar className="text-red-600" size={16} />
                            <span className="text-sm font-semibold text-red-700">
                              Start Date
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium">
                            {new Date(
                              sponsorship.startDate
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        {sponsorship.monthlyAmount && (
                          <div className="bg-white p-3 rounded-lg border border-red-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <DollarSign className="text-red-600" size={16} />
                              <span className="text-sm font-semibold text-red-700">
                                Monthly Amount
                              </span>
                            </div>
                            <p className="text-gray-900 font-bold">
                              ${sponsorship.monthlyAmount}
                            </p>
                          </div>
                        )}

                        {sponsorship.paymentMethod && (
                          <div className="bg-white p-3 rounded-lg border border-red-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <CreditCard className="text-red-600" size={16} />
                              <span className="text-sm font-semibold text-red-700">
                                Payment Method
                              </span>
                            </div>
                            <p className="text-gray-900 font-medium">
                              {sponsorship.paymentMethod}
                            </p>
                          </div>
                        )}
                      </div>

                      {sponsorship.notes && (
                        <div className="mt-4 bg-white p-3 rounded-lg border border-red-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="text-red-600" size={16} />
                            <span className="text-sm font-semibold text-red-700">
                              Notes
                            </span>
                          </div>
                          <p className="text-gray-800 text-sm">
                            {sponsorship.notes}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() =>
                            (window.location.href = `/children/${sponsorship.child.id}`)
                          }
                          className="flex items-center space-x-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <User size={14} />
                          <span>View Child</span>
                        </button>
                        <button className="flex items-center space-x-1 px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                          <Edit size={14} />
                          <span>Edit Sponsorship</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Proxy Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Link2 className="text-purple-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Proxy/Middleman
                </h2>
              </div>

              {sponsor.proxy ? (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserCheck className="text-purple-600" size={18} />
                      <span className="font-semibold text-purple-700">
                        Name
                      </span>
                    </div>
                    <p className="text-gray-900 font-bold">
                      {sponsor.proxy.fullName}
                    </p>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="text-indigo-600" size={18} />
                      <span className="font-semibold text-indigo-700">
                        Role
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {sponsor.proxy.role}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="text-blue-600" size={18} />
                      <span className="font-semibold text-blue-700">
                        Contact
                      </span>
                    </div>
                    <p className="text-gray-900 text-sm break-words font-mono bg-white p-2 rounded">
                      {sponsor.proxy.contact}
                    </p>
                  </div>

                  {sponsor.proxy.description && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="text-green-600" size={18} />
                        <span className="font-semibold text-green-700">
                          Description
                        </span>
                      </div>
                      <p className="text-gray-800 text-sm">
                        {sponsor.proxy.description}
                      </p>
                    </div>
                  )}

                  <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all">
                    View Proxy Details
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🤝</div>
                  <p className="text-gray-600 mb-4 font-medium">
                    Direct Contact
                  </p>
                  <p className="text-gray-500 text-sm">
                    This sponsor works directly without a middleman
                  </p>
                </div>
              )}
            </div>

            {/* Sponsorship Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Heart className="text-red-500" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Sponsorship Summary
                </h2>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="text-red-600" size={18} />
                    <span className="font-semibold text-red-700">
                      Total Children
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {sponsor.sponsorships.length}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="text-green-600" size={18} />
                    <span className="font-semibold text-green-700">
                      Total Monthly
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    $
                    {sponsor.sponsorships.reduce(
                      (sum, s) => sum + (s.monthlyAmount || 0),
                      0
                    )}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="text-blue-600" size={18} />
                    <span className="font-semibold text-blue-700">
                      Sponsor Since
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(sponsor.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="text-gray-600" size={20} />
                <h3 className="text-lg font-bold text-gray-900">
                  Registration Info
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Registered:</span>
                  <p className="text-gray-900">
                    {new Date(sponsor.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Last Updated:
                  </span>
                  <p className="text-gray-900">
                    {new Date(sponsor.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Sponsor ID:</span>
                  <p className="text-gray-900 font-mono">#{sponsor.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
