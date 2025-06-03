// File: src/components/ChildDetails.tsx
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  Calendar,
  GraduationCap,
  Heart,
  Users,
  User,
  Phone,
  Home,
  FileText,
  Camera,
  UserCheck,
  Clock,
  MapPin,
} from "lucide-react";

interface Child {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  class: string;
  isSponsored: boolean;
  fatherFullName: string;
  fatherAddress?: string;
  fatherContact?: string;
  motherFullName: string;
  motherAddress?: string;
  motherContact?: string;
  story?: string;
  comment?: string;
  photoUrl?: string;
  dateEnteredRegister: string;
  lastProfileUpdate: string;
  school: {
    id: number;
    name: string;
    location: string;
  };
  sponsorship?: {
    id: number;
    monthlyAmount?: number;
    paymentMethod?: string;
    startDate: string;
    notes?: string;
    sponsor: {
      id: number;
      fullName: string;
      contact: string;
      proxy?: {
        fullName: string;
        role: string;
      };
    };
  };
}

interface ChildDetailsProps {
  childId: number;
  onBack: () => void;
}

export const ChildDetails: React.FC<ChildDetailsProps> = ({
  childId,
  onBack,
}) => {
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildDetails(childId);
  }, [childId]);

  const fetchChildDetails = async (id: number) => {
    try {
      const response = await fetch(`/api/children/${id}`);
      if (response.ok) {
        const data = await response.json();
        setChild(data);
      } else {
        console.error("Failed to fetch child details");
      }
    } catch (error) {
      console.error("Error fetching child details:", error);
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
          <p className="text-gray-600 font-medium">Loading child details...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Child Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested child could not be found.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Children List
          </button>
        </div>
      </div>
    );
  }

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
            <span>Back to Children List</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {child.firstName} {child.lastName}
              </h1>
              <div className="flex items-center space-x-4">
                <span
                  className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
                    child.isSponsored
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {child.isSponsored ? "✅ Sponsored" : "⏳ Needs Sponsor"}
                </span>
                <span className="text-gray-600">
                  {calculateAge(child.dateOfBirth)} years old • {child.gender}
                </span>
              </div>
            </div>

            <button
              onClick={() => (window.location.href = `/edit-child/${child.id}`)}
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
            {/* Photo and Basic Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="flex-shrink-0">
                  {child.photoUrl ? (
                    <img
                      src={child.photoUrl}
                      alt={`${child.firstName} ${child.lastName}`}
                      className="w-40 h-40 rounded-2xl object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                      <Camera className="text-white" size={48} />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="text-blue-600" size={18} />
                        <span className="font-semibold text-blue-700">
                          Date of Birth
                        </span>
                      </div>
                      <p className="text-gray-900">
                        {new Date(child.dateOfBirth).toLocaleDateString()}
                        <span className="text-gray-600 ml-2">
                          ({calculateAge(child.dateOfBirth)} years old)
                        </span>
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <GraduationCap className="text-purple-600" size={18} />
                        <span className="font-semibold text-purple-700">
                          Class
                        </span>
                      </div>
                      <p className="text-gray-900">{child.class}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <GraduationCap className="text-green-600" size={18} />
                        <span className="font-semibold text-green-700">
                          School
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">
                        {child.school.name}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <MapPin className="text-gray-500" size={14} />
                        <p className="text-gray-600 text-sm">
                          {child.school.location}
                        </p>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="text-orange-600" size={18} />
                        <span className="font-semibold text-orange-700">
                          Registered
                        </span>
                      </div>
                      <p className="text-gray-900">
                        {new Date(
                          child.dateEnteredRegister
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Story */}
            {child.story && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <FileText className="text-blue-600" size={28} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Child's Story
                  </h2>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <p className="text-gray-800 leading-relaxed">{child.story}</p>
                </div>
              </div>
            )}

            {/* Volunteer Comments */}
            {child.comment && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Users className="text-purple-600" size={28} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Volunteer Comments
                  </h2>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                  <p className="text-gray-800 leading-relaxed">
                    {child.comment}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Sponsorship Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Heart className="text-red-500" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Sponsorship
                </h2>
              </div>

              {child.sponsorship ? (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserCheck className="text-green-600" size={18} />
                      <span className="font-semibold text-green-700">
                        Sponsored by
                      </span>
                    </div>
                    <p className="text-gray-900 font-bold">
                      {child.sponsorship.sponsor.fullName}
                    </p>
                    {child.sponsorship.sponsor.proxy && (
                      <p className="text-purple-600 text-sm mt-1">
                        Via: {child.sponsorship.sponsor.proxy.fullName} (
                        {child.sponsorship.sponsor.proxy.role})
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="text-blue-600" size={18} />
                      <span className="font-semibold text-blue-700">Since</span>
                    </div>
                    <p className="text-gray-900">
                      {new Date(
                        child.sponsorship.startDate
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  {child.sponsorship.monthlyAmount && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-yellow-700">
                          Monthly Amount
                        </span>
                      </div>
                      <p className="text-gray-900 font-bold">
                        ${child.sponsorship.monthlyAmount}
                      </p>
                      {child.sponsorship.paymentMethod && (
                        <p className="text-gray-600 text-sm">
                          via {child.sponsorship.paymentMethod}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="text-gray-600" size={18} />
                      <span className="font-semibold text-gray-700">
                        Contact
                      </span>
                    </div>
                    <p className="text-gray-900 text-sm break-words">
                      {child.sponsorship.sponsor.contact}
                    </p>
                  </div>

                  {child.sponsorship.notes && (
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="text-indigo-600" size={18} />
                        <span className="font-semibold text-indigo-700">
                          Notes
                        </span>
                      </div>
                      <p className="text-gray-800 text-sm">
                        {child.sponsorship.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">💝</div>
                  <p className="text-gray-600 mb-4">
                    This child needs a sponsor
                  </p>
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all">
                    Find Sponsor
                  </button>
                </div>
              )}
            </div>

            {/* Family Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="text-green-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">Family</h2>
              </div>

              <div className="space-y-6">
                {/* Father Info */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="text-blue-600" size={18} />
                    <span className="font-semibold text-blue-700">Father</span>
                  </div>
                  <p className="text-gray-900 font-medium mb-2">
                    {child.fatherFullName}
                  </p>

                  {child.fatherAddress && (
                    <div className="flex items-start space-x-2 mb-2">
                      <Home className="text-gray-500 mt-1" size={14} />
                      <p className="text-gray-700 text-sm">
                        {child.fatherAddress}
                      </p>
                    </div>
                  )}

                  {child.fatherContact && (
                    <div className="flex items-start space-x-2">
                      <Phone className="text-gray-500 mt-1" size={14} />
                      <p className="text-gray-700 text-sm break-words">
                        {child.fatherContact}
                      </p>
                    </div>
                  )}
                </div>

                {/* Mother Info */}
                <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="text-pink-600" size={18} />
                    <span className="font-semibold text-pink-700">Mother</span>
                  </div>
                  <p className="text-gray-900 font-medium mb-2">
                    {child.motherFullName}
                  </p>

                  {child.motherAddress && (
                    <div className="flex items-start space-x-2 mb-2">
                      <Home className="text-gray-500 mt-1" size={14} />
                      <p className="text-gray-700 text-sm">
                        {child.motherAddress}
                      </p>
                    </div>
                  )}

                  {child.motherContact && (
                    <div className="flex items-start space-x-2">
                      <Phone className="text-gray-500 mt-1" size={14} />
                      <p className="text-gray-700 text-sm break-words">
                        {child.motherContact}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="text-gray-600" size={20} />
                <h3 className="text-lg font-bold text-gray-900">
                  Last Updated
                </h3>
              </div>
              <p className="text-gray-700">
                {new Date(child.lastProfileUpdate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
