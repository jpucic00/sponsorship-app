import React, { useState, useEffect, useRef } from "react";
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
  Plus,
  X,
  DollarSign,
  Check,
  Link2,
  Mail,
  MessageSquare,
  MapPin,
} from "lucide-react";
import { PhotoGallery } from "./PhotoGallery";
import { formatDate, formatDateTimeWithRelative } from "../utils/dateUtils";

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
  photoBase64?: string;
  photoMimeType?: string;
  photoFileName?: string;
  photoSize?: number;
  photoDataUrl?: string;
  dateEnteredRegister: string;
  lastProfileUpdate: string;
  school: {
    id: number;
    name: string;
    location: string;
  };
  sponsorships: Array<{
    id: number;
    monthlyAmount?: number;
    paymentMethod?: string;
    startDate: string;
    endDate?: string;
    notes?: string;
    isActive: boolean;
    sponsor: {
      id: number;
      fullName: string;
      contact: string;
      email?: string;
      phone?: string;
      proxy?: {
        id: number;
        fullName: string;
        role: string;
        contact: string;
        email?: string;
        phone?: string;
        description?: string;
      };
    };
  }>;
}

interface School {
  id: number;
  name: string;
  location: string;
}

interface Sponsor {
  id: number;
  fullName: string;
  contact: string;
  email?: string;
  phone?: string;
  proxy?: {
    id: number;
    fullName: string;
    role: string;
    contact: string;
    email?: string;
    phone?: string;
    description?: string;
  };
}

interface ChildDetailsProps {
  childId: number;
  onBack: () => void;
}

// Editable field component
interface EditableFieldProps {
  label: string;
  value: string | undefined;
  onSave: (value: string) => void;
  multiline?: boolean;
  required?: boolean;
  readonly?: boolean;
  type?: "text" | "date" | "select";
  options?: Array<{ value: string; label: string }>;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  displayValue?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onSave,
  multiline = false,
  required = false,
  readonly = false,
  type = "text",
  options = [],
  icon,
  bgColor,
  borderColor,
  displayValue,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (required && !tempValue.trim()) {
      alert(`${label} is required`);
      return;
    }

    setSaving(true);
    try {
      await onSave(tempValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving field:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempValue(value || "");
    setIsEditing(false);
  };

  if (readonly || !isEditing) {
    return (
      <div className={`${bgColor} p-4 rounded-xl border ${borderColor}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {icon}
              <span className="font-semibold text-gray-700 text-sm">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </div>
            <div className="text-gray-900">
              {displayValue || value || (
                <span className="text-gray-500 italic">Not provided</span>
              )}
            </div>
          </div>
          {!readonly && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 p-1"
              title={`Edit ${label}`}
            >
              <Edit size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgColor} p-4 rounded-xl border ${borderColor}`}>
      <div className="flex items-center space-x-2 mb-2">
        {icon}
        <span className="font-semibold text-gray-700 text-sm">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </div>

      <div className="space-y-3">
        {type === "select" ? (
          <select
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : multiline ? (
          <textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <input
            type={type}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Check size={14} />
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <X size={14} />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ChildDetails: React.FC<ChildDetailsProps> = ({
  childId,
  onBack,
}) => {
  const [child, setChild] = useState<Child | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const photoGalleryRef = useRef<any>(null);

  // Sponsor management states
  const [availableSponsors, setAvailableSponsors] = useState<Sponsor[]>([]);
  const [showAddSponsor, setShowAddSponsor] = useState(false);

  useEffect(() => {
    fetchChildDetails(childId);
    fetchSchools();
    fetchAvailableSponsors();
  }, [childId]);

  const fetchChildDetails = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/children/${id}`);
      if (response.ok) {
        const data = await response.json();
        setChild(data);
        setImageError(false);
      } else {
        console.error("Failed to fetch child details");
      }
    } catch (error) {
      console.error("Error fetching child details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await fetch("/api/schools");
      if (response.ok) {
        const data = await response.json();
        setSchools(data);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const handleProfilePhotoChange = () => {
    fetchChildDetails(childId);
  };

  const fetchAvailableSponsors = async () => {
    try {
      const response = await fetch("/api/sponsors");
      if (response.ok) {
        const data = await response.json();
        setAvailableSponsors(data.data || data || []);
      }
    } catch (error) {
      console.error("Error fetching sponsors:", error);
    }
  };

  const handleFieldUpdate = async (fieldName: string, value: string) => {
    if (!child) return;

    try {
      const updateData: any = { [fieldName]: value };

      // Special handling for date fields
      if (fieldName === "dateOfBirth") {
        updateData[fieldName] = new Date(value).toISOString();
      }

      // Special handling for school
      if (fieldName === "schoolId") {
        updateData[fieldName] = parseInt(value);
      }

      const response = await fetch(`/api/children/${child.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedChild = await response.json();
        setChild(updatedChild);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update child");
      }
    } catch (error) {
      console.error("Error updating child:", error);
      throw error;
    }
  };

  const handleAddSponsor = async (sponsorId: number) => {
    try {
      const response = await fetch(`/api/children/${childId}/sponsors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sponsorId }),
      });

      if (response.ok) {
        await fetchChildDetails(childId);
        setShowAddSponsor(false);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add sponsor");
      }
    } catch (error) {
      console.error("Error adding sponsor:", error);
      alert("Failed to add sponsor");
    }
  };

  const handleRemoveSponsor = async (sponsorId: number) => {
    if (confirm("Are you sure you want to end this sponsorship?")) {
      try {
        const response = await fetch(
          `/api/children/${childId}/sponsors/${sponsorId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          await fetchChildDetails(childId);
        } else {
          const error = await response.json();
          alert(error.error || "Failed to remove sponsor");
        }
      } catch (error) {
        console.error("Error removing sponsor:", error);
        alert("Failed to remove sponsor");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-32">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Child not found
            </h2>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Children List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeSponsors = child.sponsorships.filter((s) => s.isActive);
  const schoolOptions = schools.map((school) => ({
    value: school.id.toString(),
    label: `${school.name} - ${school.location}`,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Children</span>
          </button>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                    {child.photoDataUrl || child.photoBase64 ? (
                      <img
                        src={
                          child.photoDataUrl ||
                          (child.photoBase64
                            ? `data:${child.photoMimeType};base64,${child.photoBase64}`
                            : undefined)
                        }
                        alt={`${child.firstName} ${child.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          setImageError(true);
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : null}
                    {(!child.photoDataUrl && !child.photoBase64) ||
                    imageError ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                        <Camera className="text-gray-400" size={32} />
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Child Information */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {child.firstName} {child.lastName}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>{formatDate(child.dateOfBirth)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GraduationCap size={16} />
                      <span>Class {child.class}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} />
                      <span>{child.school.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    child.isSponsored
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {child.isSponsored ? "Sponsored" : "Needs Sponsor"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information - Editable */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <User className="text-blue-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Basic Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EditableField
                  label="First Name"
                  value={child.firstName}
                  onSave={(value) => handleFieldUpdate("firstName", value)}
                  required
                  icon={<User className="text-blue-600" size={16} />}
                  bgColor="bg-blue-50"
                  borderColor="border-blue-200"
                />

                <EditableField
                  label="Last Name"
                  value={child.lastName}
                  onSave={(value) => handleFieldUpdate("lastName", value)}
                  required
                  icon={<User className="text-blue-600" size={16} />}
                  bgColor="bg-blue-50"
                  borderColor="border-blue-200"
                />

                <EditableField
                  label="Date of Birth"
                  value={child.dateOfBirth}
                  onSave={(value) => handleFieldUpdate("dateOfBirth", value)}
                  type="date"
                  required
                  icon={<Calendar className="text-blue-600" size={16} />}
                  bgColor="bg-blue-50"
                  borderColor="border-blue-200"
                  displayValue={formatDate(child.dateOfBirth)}
                />

                <EditableField
                  label="Gender"
                  value={child.gender}
                  onSave={(value) => handleFieldUpdate("gender", value)}
                  type="select"
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                  ]}
                  required
                  icon={<User className="text-blue-600" size={16} />}
                  bgColor="bg-blue-50"
                  borderColor="border-blue-200"
                />

                <EditableField
                  label="Class"
                  value={child.class}
                  onSave={(value) => handleFieldUpdate("class", value)}
                  required
                  icon={<GraduationCap className="text-blue-600" size={16} />}
                  bgColor="bg-blue-50"
                  borderColor="border-blue-200"
                />

                <EditableField
                  label="School"
                  value={child.school.id.toString()}
                  onSave={(value) => handleFieldUpdate("schoolId", value)}
                  type="select"
                  options={schoolOptions}
                  required
                  icon={<GraduationCap className="text-blue-600" size={16} />}
                  bgColor="bg-blue-50"
                  borderColor="border-blue-200"
                  displayValue={`${child.school.name} - ${child.school.location}`}
                />
              </div>
            </div>

            {/* Sponsorship Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Heart className="text-red-500" size={28} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Sponsorship Information
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddSponsor(!showAddSponsor)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={18} />
                  <span>Add Sponsor</span>
                </button>
              </div>

              {activeSponsors.length > 0 ? (
                <div className="space-y-6">
                  {activeSponsors.map((sponsorship) => (
                    <div
                      key={sponsorship.id}
                      className="bg-green-50 rounded-2xl p-6 border border-green-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <UserCheck className="text-green-600" size={18} />
                            <span className="font-semibold text-green-700">
                              Active Sponsor
                            </span>
                            <span className="text-gray-500 text-sm">
                              since {formatDate(sponsorship.startDate)}
                            </span>
                          </div>
                          <p className="text-gray-900 font-bold text-lg">
                            {sponsorship.sponsor.fullName}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveSponsor(sponsorship.sponsor.id)
                          }
                          className="text-red-600 hover:text-red-800 p-1"
                          title="End sponsorship"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      {/* Enhanced Sponsor Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email Contact */}
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Mail className="text-green-600" size={16} />
                            <span className="font-semibold text-green-700 text-sm">
                              Email Address
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-900 text-sm break-words flex-1">
                              {sponsorship.sponsor.email || "Not provided"}
                            </p>
                            {sponsorship.sponsor.email && (
                              <button
                                onClick={() =>
                                  navigator.clipboard.writeText(
                                    sponsorship.sponsor.email!
                                  )
                                }
                                className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy email"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Phone Contact */}
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Phone className="text-green-600" size={16} />
                            <span className="font-semibold text-green-700 text-sm">
                              Phone Number
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-900 text-sm break-words flex-1">
                              {sponsorship.sponsor.phone || "Not provided"}
                            </p>
                            {sponsorship.sponsor.phone && (
                              <button
                                onClick={() =>
                                  navigator.clipboard.writeText(
                                    sponsorship.sponsor.phone!
                                  )
                                }
                                className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy phone number"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Additional Contact Info (if exists) */}
                        {sponsorship.sponsor.contact && (
                          <div className="bg-white p-4 rounded-lg border border-green-200 md:col-span-2">
                            <div className="flex items-center space-x-2 mb-2">
                              <MessageSquare
                                className="text-green-600"
                                size={16}
                              />
                              <span className="font-semibold text-green-700 text-sm">
                                Additional Contact Information
                              </span>
                            </div>
                            <div className="flex items-start justify-between">
                              <p className="text-gray-900 text-sm break-words flex-1">
                                {sponsorship.sponsor.contact}
                              </p>
                              <button
                                onClick={() =>
                                  navigator.clipboard.writeText(
                                    sponsorship.sponsor.contact
                                  )
                                }
                                className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                title="Copy contact info"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Contact Methods Summary */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200 md:col-span-2">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Available Contact Methods
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {sponsorship.sponsor.email && (
                              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                <Mail size={12} className="mr-1" />
                                Email
                              </span>
                            )}
                            {sponsorship.sponsor.phone && (
                              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                <Phone size={12} className="mr-1" />
                                Phone
                              </span>
                            )}
                            {sponsorship.sponsor.contact && (
                              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                <MessageSquare size={12} className="mr-1" />
                                Additional Info
                              </span>
                            )}
                            {!sponsorship.sponsor.email &&
                              !sponsorship.sponsor.phone &&
                              !sponsorship.sponsor.contact && (
                                <span className="text-gray-500 text-xs">
                                  No contact methods available
                                </span>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Proxy Information Display */}
                      {sponsorship.sponsor.proxy && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border-2 border-purple-200 mt-4">
                          <div className="flex items-center space-x-2 mb-4">
                            <Link2 className="text-purple-600" size={20} />
                            <span className="font-bold text-purple-700 text-lg">
                              Representative/Proxy
                            </span>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-semibold text-purple-900 text-base">
                              {sponsorship.sponsor.proxy.fullName}
                            </h4>
                            <p className="text-purple-700 text-sm font-medium">
                              {sponsorship.sponsor.proxy.role}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Proxy Email */}
                            <div className="bg-white p-4 rounded-lg border border-purple-200">
                              <div className="flex items-center space-x-2 mb-2">
                                <Mail className="text-purple-600" size={16} />
                                <span className="font-semibold text-purple-700 text-sm">
                                  Proxy Email
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-gray-900 text-sm break-words flex-1">
                                  {sponsorship.sponsor.proxy.email ||
                                    "Not provided"}
                                </p>
                                {sponsorship.sponsor.proxy.email && (
                                  <button
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        sponsorship.sponsor.proxy?.email!
                                      )
                                    }
                                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Copy proxy email"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Proxy Phone */}
                            <div className="bg-white p-4 rounded-lg border border-purple-200">
                              <div className="flex items-center space-x-2 mb-2">
                                <Phone className="text-purple-600" size={16} />
                                <span className="font-semibold text-purple-700 text-sm">
                                  Proxy Phone
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-gray-900 text-sm break-words flex-1">
                                  {sponsorship.sponsor.proxy.phone ||
                                    "Not provided"}
                                </p>
                                {sponsorship.sponsor.proxy.phone && (
                                  <button
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        sponsorship.sponsor.proxy?.phone!
                                      )
                                    }
                                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Copy proxy phone"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Proxy Additional Contact */}
                            {sponsorship.sponsor.proxy.contact && (
                              <div className="bg-white p-4 rounded-lg border border-purple-200 md:col-span-2">
                                <div className="flex items-center space-x-2 mb-2">
                                  <MessageSquare
                                    className="text-purple-600"
                                    size={16}
                                  />
                                  <span className="font-semibold text-purple-700 text-sm">
                                    Additional Proxy Contact
                                  </span>
                                </div>
                                <div className="flex items-start justify-between">
                                  <p className="text-gray-900 text-sm break-words flex-1">
                                    {sponsorship.sponsor.proxy.contact}
                                  </p>
                                  <button
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        sponsorship.sponsor.proxy?.contact!
                                      )
                                    }
                                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                    title="Copy proxy contact info"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Proxy Description */}
                            {sponsorship.sponsor.proxy.description && (
                              <div className="bg-white p-4 rounded-lg border border-purple-200 md:col-span-2">
                                <div className="flex items-center space-x-2 mb-2">
                                  <FileText
                                    className="text-purple-600"
                                    size={16}
                                  />
                                  <span className="font-semibold text-purple-700 text-sm">
                                    About This Proxy
                                  </span>
                                </div>
                                <div className="flex items-start justify-between">
                                  <p className="text-gray-900 text-sm break-words flex-1">
                                    {sponsorship.sponsor.proxy.description}
                                  </p>
                                  <button
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        sponsorship.sponsor.proxy?.description!
                                      )
                                    }
                                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                    title="Copy proxy description"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Proxy Contact Methods Summary */}
                          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200 mt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              Proxy Contact Methods
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {sponsorship.sponsor.proxy.email && (
                                <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  <Mail size={12} className="mr-1" />
                                  Email
                                </span>
                              )}
                              {sponsorship.sponsor.proxy.phone && (
                                <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  <Phone size={12} className="mr-1" />
                                  Phone
                                </span>
                              )}
                              {sponsorship.sponsor.proxy.contact && (
                                <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                  <MessageSquare size={12} className="mr-1" />
                                  Additional Info
                                </span>
                              )}
                              {!sponsorship.sponsor.proxy.email &&
                                !sponsorship.sponsor.proxy.phone &&
                                !sponsorship.sponsor.proxy.contact && (
                                  <span className="text-gray-500 text-xs">
                                    No contact methods available
                                  </span>
                                )}
                            </div>
                          </div>

                          {/* Communication Flow Info */}
                          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                            <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                              💬 Communication Flow
                            </h4>
                            <p className="text-sm text-yellow-700">
                              This proxy serves as an intermediary for
                              communication between the sponsor and the local
                              community. Contact the proxy for coordination of
                              sponsorship activities and local updates.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Monthly Amount and Payment Method (if applicable) */}
                      {(sponsorship.monthlyAmount ||
                        sponsorship.paymentMethod) && (
                        <div className="bg-white p-4 rounded-lg border border-green-200 mt-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className="text-green-600" size={16} />
                            <span className="font-semibold text-green-700 text-sm">
                              Financial Details
                            </span>
                          </div>
                          <div className="space-y-1">
                            {sponsorship.monthlyAmount && (
                              <p className="text-gray-900 text-sm">
                                <span className="font-medium">
                                  Monthly Amount:
                                </span>{" "}
                                ${sponsorship.monthlyAmount}
                              </p>
                            )}
                            {sponsorship.paymentMethod && (
                              <p className="text-gray-900 text-sm">
                                <span className="font-medium">
                                  Payment Method:
                                </span>{" "}
                                {sponsorship.paymentMethod}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Sponsorship Notes */}
                      {sponsorship.notes && (
                        <div className="bg-white p-4 rounded-lg border border-green-200 mt-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="text-green-600" size={16} />
                            <span className="font-semibold text-green-700 text-sm">
                              Sponsorship Notes
                            </span>
                          </div>
                          <p className="text-gray-900 text-sm break-words">
                            {sponsorship.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-8xl mb-6">💝</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    This child needs a sponsor
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Help connect this child with a caring sponsor who can
                    support their education and future.
                  </p>
                </div>
              )}

              {/* Add Sponsor Dropdown */}
              {showAddSponsor && (
                <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Available Sponsors
                    </h4>
                    <button
                      onClick={() => setShowAddSponsor(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-3">
                    {availableSponsors
                      .filter(
                        (sponsor) =>
                          !activeSponsors.some(
                            (s) => s.sponsor.id === sponsor.id
                          )
                      )
                      .map((sponsor) => (
                        <div
                          key={sponsor.id}
                          className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all"
                          onClick={() => handleAddSponsor(sponsor.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-2">
                                {sponsor.fullName}
                              </h4>

                              {/* Contact Methods Display */}
                              <div className="space-y-2">
                                {/* Email */}
                                {sponsor.email && (
                                  <div className="flex items-center space-x-2">
                                    <Mail className="text-blue-600" size={14} />
                                    <span className="text-gray-700 text-sm">
                                      {sponsor.email}
                                    </span>
                                  </div>
                                )}

                                {/* Phone */}
                                {sponsor.phone && (
                                  <div className="flex items-center space-x-2">
                                    <Phone
                                      className="text-green-600"
                                      size={14}
                                    />
                                    <span className="text-gray-700 text-sm">
                                      {sponsor.phone}
                                    </span>
                                  </div>
                                )}

                                {/* Additional Contact Info */}
                                {sponsor.contact && (
                                  <div className="flex items-start space-x-2">
                                    <MessageSquare
                                      className="text-gray-600 mt-0.5"
                                      size={14}
                                    />
                                    <span className="text-gray-600 text-sm">
                                      {sponsor.contact}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Contact Methods Summary Tags */}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {sponsor.email && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    <Mail size={10} className="mr-1" />
                                    Email
                                  </span>
                                )}
                                {sponsor.phone && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    <Phone size={10} className="mr-1" />
                                    Phone
                                  </span>
                                )}
                                {sponsor.contact && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                    <MessageSquare size={10} className="mr-1" />
                                    More Info
                                  </span>
                                )}
                              </div>

                              {/* Proxy Information */}
                              {sponsor.proxy && (
                                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Link2
                                      className="text-purple-600"
                                      size={14}
                                    />
                                    <span className="text-purple-700 font-medium text-sm">
                                      Via Proxy: {sponsor.proxy.fullName}
                                    </span>
                                  </div>
                                  <p className="text-purple-600 text-xs">
                                    {sponsor.proxy.role}
                                  </p>

                                  {/* Proxy Contact Info */}
                                  {(sponsor.proxy.email ||
                                    sponsor.proxy.phone) && (
                                    <div className="mt-2 space-y-1">
                                      {sponsor.proxy.email && (
                                        <div className="flex items-center space-x-2">
                                          <Mail
                                            className="text-purple-600"
                                            size={12}
                                          />
                                          <span className="text-purple-700 text-xs">
                                            {sponsor.proxy.email}
                                          </span>
                                        </div>
                                      )}
                                      {sponsor.proxy.phone && (
                                        <div className="flex items-center space-x-2">
                                          <Phone
                                            className="text-purple-600"
                                            size={12}
                                          />
                                          <span className="text-purple-700 text-xs">
                                            {sponsor.proxy.phone}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Add Button */}
                            <div className="ml-4">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Plus className="text-green-600" size={16} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Empty State */}
                  {availableSponsors.filter(
                    (sponsor) =>
                      !activeSponsors.some((s) => s.sponsor.id === sponsor.id)
                  ).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-6xl mb-4">🤝</div>
                      <p className="font-medium">No available sponsors found</p>
                      <p className="text-sm mt-2">
                        All sponsors are already sponsoring this child or no
                        sponsors exist in the system.
                      </p>
                      <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        Register New Sponsor
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Family Information - Editable */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="text-green-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Family Information
                </h2>
              </div>

              <div className="space-y-6">
                {/* Father Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-700 flex items-center">
                    <User className="mr-2" size={20} />
                    Father Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <EditableField
                        label="Father Full Name"
                        value={child.fatherFullName}
                        onSave={(value) =>
                          handleFieldUpdate("fatherFullName", value)
                        }
                        required
                        icon={<User className="text-blue-600" size={16} />}
                        bgColor="bg-blue-50"
                        borderColor="border-blue-200"
                      />
                    </div>
                    <EditableField
                      label="Father Address"
                      value={child.fatherAddress}
                      onSave={(value) =>
                        handleFieldUpdate("fatherAddress", value)
                      }
                      icon={<Home className="text-blue-600" size={16} />}
                      bgColor="bg-blue-50"
                      borderColor="border-blue-200"
                    />
                    <EditableField
                      label="Father Contact"
                      value={child.fatherContact}
                      onSave={(value) =>
                        handleFieldUpdate("fatherContact", value)
                      }
                      icon={<Phone className="text-blue-600" size={16} />}
                      bgColor="bg-blue-50"
                      borderColor="border-blue-200"
                    />
                  </div>
                </div>

                {/* Mother Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-pink-700 flex items-center">
                    <User className="mr-2" size={20} />
                    Mother Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <EditableField
                        label="Mother Full Name"
                        value={child.motherFullName}
                        onSave={(value) =>
                          handleFieldUpdate("motherFullName", value)
                        }
                        required
                        icon={<User className="text-pink-600" size={16} />}
                        bgColor="bg-pink-50"
                        borderColor="border-pink-200"
                      />
                    </div>
                    <EditableField
                      label="Mother Address"
                      value={child.motherAddress}
                      onSave={(value) =>
                        handleFieldUpdate("motherAddress", value)
                      }
                      icon={<Home className="text-pink-600" size={16} />}
                      bgColor="bg-pink-50"
                      borderColor="border-pink-200"
                    />
                    <EditableField
                      label="Mother Contact"
                      value={child.motherContact}
                      onSave={(value) =>
                        handleFieldUpdate("motherContact", value)
                      }
                      icon={<Phone className="text-pink-600" size={16} />}
                      bgColor="bg-pink-50"
                      borderColor="border-pink-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Gallery */}
            <PhotoGallery
              ref={photoGalleryRef}
              childId={child.id}
              childName={`${child.firstName} ${child.lastName}`}
              onProfilePhotoChange={handleProfilePhotoChange}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Story - Editable */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="text-blue-600" size={24} />
                <h3 className="text-lg font-bold text-gray-900">
                  Child's Story
                </h3>
              </div>

              <EditableField
                label="Story"
                value={child.story}
                onSave={(value) => handleFieldUpdate("story", value)}
                multiline
                icon={<FileText className="text-blue-600" size={16} />}
                bgColor="bg-gradient-to-r from-blue-50 to-indigo-50"
                borderColor="border-blue-200"
              />
            </div>

            {/* Volunteer Comments - Editable */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="text-purple-600" size={24} />
                <h3 className="text-lg font-bold text-gray-900">
                  Volunteer Comments
                </h3>
              </div>

              <EditableField
                label="Comments"
                value={child.comment}
                onSave={(value) => handleFieldUpdate("comment", value)}
                multiline
                icon={<Users className="text-purple-600" size={16} />}
                bgColor="bg-gradient-to-r from-purple-50 to-pink-50"
                borderColor="border-purple-200"
              />
            </div>

            {/* Registration Timeline */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="text-gray-600" size={24} />
                <h3 className="text-lg font-bold text-gray-900">Timeline</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Registered
                    </p>
                    <p className="text-xs text-gray-500">
                      {
                        formatDateTimeWithRelative(child.dateEnteredRegister)
                          .formatted
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Last Updated
                    </p>
                    <p className="text-xs text-gray-500">
                      {
                        formatDateTimeWithRelative(child.lastProfileUpdate)
                          .formatted
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
