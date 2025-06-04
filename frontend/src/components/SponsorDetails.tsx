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
// Import the date utility functions
import {
  formatDateTime,
  formatDate,
  formatDateTimeWithRelative,
} from "../utils/dateUtils";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
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
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Sponsors List
          </button>
        </div>
      </div>
    );
  }

  const activeSponsors = sponsor.sponsorships.filter((s) => s.isActive);
  const inactiveSponsors = sponsor.sponsorships.filter((s) => !s.isActive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
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
                <span className="bg-green-100 text-green-800 px-3 py-1 text-sm font-semibold rounded-full">
                  {activeSponsors.length} Active Sponsorship
                  {activeSponsors.length !== 1 ? "s" : ""}
                </span>
                {sponsor.proxy && (
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 text-sm font-semibold rounded-full">
                    Via {sponsor.proxy.role}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() =>
                (window.location.href = `/edit-sponsor/${sponsor.id}`)
              }
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Edit size={20} />
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Sponsorships */}
            {activeSponsors.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Heart className="text-red-500" size={28} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Active Sponsorships ({activeSponsors.length})
                  </h2>
                </div>

                <div className="space-y-6">
                  {activeSponsors.map((sponsorship) => (
                    <div
                      key={sponsorship.id}
                      className="bg-green-50 rounded-2xl p-6 border border-green-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                              {sponsorship.child.firstName[0]}
                              {sponsorship.child.lastName[0]}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {sponsorship.child.firstName}{" "}
                                {sponsorship.child.lastName}
                              </h3>
                              <p className="text-gray-600">
                                {calculateAge(sponsorship.child.dateOfBirth)}{" "}
                                years old • {sponsorship.child.gender} •{" "}
                                {sponsorship.child.class}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-green-200">
                              <div className="flex items-center space-x-2 mb-2">
                                <Calendar
                                  className="text-green-600"
                                  size={18}
                                />
                                <span className="font-semibold text-green-700">
                                  Sponsorship Start
                                </span>
                              </div>
                              {/* USING formatDateTime and formatDateTimeWithRelative utility functions */}
                              <div className="space-y-1">
                                <p className="text-gray-900 font-medium">
                                  {formatDateTime(sponsorship.startDate)}
                                </p>
                                <p className="text-gray-600 text-sm">
                                  {
                                    formatDateTimeWithRelative(
                                      sponsorship.startDate
                                    ).relative
                                  }
                                </p>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-green-200">
                              <div className="flex items-center space-x-2 mb-2">
                                <GraduationCap
                                  className="text-green-600"
                                  size={18}
                                />
                                <span className="font-semibold text-green-700">
                                  School
                                </span>
                              </div>
                              <p className="text-gray-900 font-medium">
                                {sponsorship.child.school.name}
                              </p>
                              <div className="flex items-center space-x-1 mt-1">
                                <MapPin className="text-gray-500" size={14} />
                                <p className="text-gray-600 text-sm">
                                  {sponsorship.child.school.location}
                                </p>
                              </div>
                            </div>

                            {sponsorship.monthlyAmount && (
                              <div className="bg-white p-4 rounded-xl border border-green-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <DollarSign
                                    className="text-green-600"
                                    size={18}
                                  />
                                  <span className="font-semibold text-green-700">
                                    Monthly Amount
                                  </span>
                                </div>
                                <p className="text-gray-900 font-bold text-lg">
                                  ${sponsorship.monthlyAmount}
                                </p>
                                {sponsorship.paymentMethod && (
                                  <p className="text-gray-600 text-sm">
                                    via {sponsorship.paymentMethod}
                                  </p>
                                )}
                              </div>
                            )}

                            {sponsorship.notes && (
                              <div className="bg-white p-4 rounded-xl border border-green-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <FileText
                                    className="text-green-600"
                                    size={18}
                                  />
                                  <span className="font-semibold text-green-700">
                                    Notes
                                  </span>
                                </div>
                                <p className="text-gray-800 text-sm">
                                  {sponsorship.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Sponsorships */}
            {inactiveSponsors.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Users className="text-gray-600" size={28} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Previous Sponsorships ({inactiveSponsors.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {inactiveSponsors.map((sponsorship) => (
                    <div
                      key={sponsorship.id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {sponsorship.child.firstName}{" "}
                            {sponsorship.child.lastName}
                          </h4>
                          {/* USING formatDateTime utility function */}
                          <p className="text-sm text-gray-600">
                            {formatDateTime(sponsorship.startDate)} - Ended
                          </p>
                        </div>
                        {sponsorship.monthlyAmount && (
                          <p className="text-gray-700 font-medium">
                            ${sponsorship.monthlyAmount}/month
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proxy Information */}
            {sponsor.proxy && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Link2 className="text-purple-600" size={28} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Proxy Representative
                  </h2>
                </div>

                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="text-purple-600" size={18} />
                        <span className="font-semibold text-purple-700">
                          Representative
                        </span>
                      </div>
                      <p className="text-gray-900 font-bold">
                        {sponsor.proxy.fullName}
                      </p>
                      <p className="text-purple-600 text-sm mt-1">
                        {sponsor.proxy.role}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Phone className="text-purple-600" size={18} />
                        <span className="font-semibold text-purple-700">
                          Contact
                        </span>
                      </div>
                      <p className="text-gray-900 text-sm break-words">
                        {sponsor.proxy.contact}
                      </p>
                    </div>

                    {sponsor.proxy.description && (
                      <div className="md:col-span-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="text-purple-600" size={18} />
                          <span className="font-semibold text-purple-700">
                            Description
                          </span>
                        </div>
                        <p className="text-gray-800 text-sm">
                          {sponsor.proxy.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Overview
              </h3>

              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {activeSponsors.length}
                  </div>
                  <p className="text-gray-600 text-sm">Active Sponsorships</p>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {sponsor.sponsorships.length}
                  </div>
                  <p className="text-gray-600 text-sm">Total Sponsorships</p>
                </div>

                <div className="text-center">
                  {/* USING formatDateTime and formatDateTimeWithRelative utility functions */}
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-gray-900">
                      {formatDateTime(sponsor.createdAt)}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {formatDateTimeWithRelative(sponsor.createdAt).relative}
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm">Member Since</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Phone className="text-blue-600" size={20} />
                <h3 className="text-lg font-bold text-gray-900">
                  Contact Information
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Contact:</span>
                  <p className="text-gray-900 break-words">{sponsor.contact}</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="text-gray-600" size={20} />
                <h3 className="text-lg font-bold text-gray-900">
                  Account Information
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Registered:</span>
                  <div className="mt-1">
                    {/* USING formatDateTime and formatDateTimeWithRelative utility functions */}
                    <p className="text-gray-900 font-medium">
                      {formatDateTime(sponsor.createdAt)}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {formatDateTimeWithRelative(sponsor.createdAt).relative}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Last Updated:
                  </span>
                  <div className="mt-1">
                    {/* USING formatDateTime and formatDateTimeWithRelative utility functions */}
                    <p className="text-gray-900 font-medium">
                      {formatDateTime(sponsor.updatedAt)}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {formatDateTimeWithRelative(sponsor.updatedAt).relative}
                    </p>
                  </div>
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
