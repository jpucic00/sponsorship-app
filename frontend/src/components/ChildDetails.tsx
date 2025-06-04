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
  Plus,
  X,
  DollarSign,
  Check,
} from "lucide-react";
import { PhotoGallery } from "./PhotoGallery";
// Import the date utility functions
import {
  formatDateTime,
  formatDate,
  formatDateTimeWithRelative,
} from "../utils/dateUtils";

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
      proxy?: {
        fullName: string;
        role: string;
      };
    };
  }>;
}

interface School {
  id: number;
  name: string;
  location: string;
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
  displayValue?: string; // For showing formatted values different from the stored value
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
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (required && !tempValue.trim()) {
      alert(`${label} is required`);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(tempValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempValue(value || "");
    setIsEditing(false);
  };

  const handleWidgetDoubleClick = () => {
    if (!isEditing && !isSaving && !readonly) {
      setIsEditing(true);
    }
  };

  const formatDisplayValue = (val: string | undefined) => {
    if (displayValue) return displayValue; // Use custom display value if provided
    if (!val) return readonly ? "System generated" : "Not provided";
    if (type === "date") {
      return formatDate(val);
    }
    if (type === "select") {
      const option = options.find((opt) => opt.value === val);
      return option ? option.label : val;
    }
    return val;
  };

  return (
    <div
      className={`${bgColor} p-4 rounded-xl border ${borderColor} relative group transition-all duration-200 ${
        !isEditing && !readonly
          ? "cursor-pointer hover:shadow-md hover:scale-[1.02]"
          : ""
      } ${readonly ? "opacity-75" : ""}`}
      onDoubleClick={
        !isEditing && !readonly ? handleWidgetDoubleClick : undefined
      }
      title={readonly ? `${label} (read-only)` : "Double-click to edit"}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-semibold text-gray-700">{label}</span>
          {required && <span className="text-red-500">*</span>}
          {readonly && (
            <span className="text-blue-500 text-xs">(read-only)</span>
          )}
        </div>
        {!isEditing && !readonly && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-blue-600 transition-all duration-200"
            title={`Edit ${label}`}
          >
            <Edit size={14} />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
          {type === "select" ? (
            <select
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              disabled={isSaving}
              autoFocus
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              placeholder={`Enter ${label.toLowerCase()}`}
              disabled={isSaving}
              autoFocus
            />
          ) : (
            <input
              type={type}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder={`Enter ${label.toLowerCase()}`}
              disabled={isSaving}
              autoFocus
            />
          )}

          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Check size={12} />
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <X size={12} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="group/text pointer-events-none">
          <p className="text-gray-900 text-sm select-none">
            {formatDisplayValue(value)}
          </p>
          {!value && !readonly && (
            <p className="text-gray-400 text-xs mt-1 italic">
              Click to add {label.toLowerCase()}
            </p>
          )}
        </div>
      )}
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
  const [showAddSponsor, setShowAddSponsor] = useState(false);
  const [availableSponsors, setAvailableSponsors] = useState<any[]>([]);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchChildDetails(childId);
    fetchAvailableSponsors();
    fetchSchools();
  }, [childId]);

  const fetchChildDetails = async (id: number) => {
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
          alert("Failed to end sponsorship");
        }
      } catch (error) {
        console.error("Error ending sponsorship:", error);
        alert("Failed to end sponsorship");
      }
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

  const getImageSrc = (child: Child) => {
    if (child.photoDataUrl) {
      return child.photoDataUrl;
    }
    if (child.photoBase64 && child.photoMimeType) {
      return `data:${child.photoMimeType};base64,${child.photoBase64}`;
    }
    return `/api/children/${child.id}/image`;
  };

  const hasImage = (child: Child) => {
    return !!(child.photoDataUrl || child.photoBase64 || child.photoMimeType);
  };

  const handleImageError = () => {
    setImageError(true);
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

  const activeSponsors = child.sponsorships.filter((s) => s.isActive);
  const inactiveSponsors = child.sponsorships.filter((s) => !s.isActive);

  // Prepare options for select fields
  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  const classOptions = [
    { value: "P1", label: "Primary 1 (P1)" },
    { value: "P2", label: "Primary 2 (P2)" },
    { value: "P3", label: "Primary 3 (P3)" },
    { value: "P4", label: "Primary 4 (P4)" },
    { value: "P5", label: "Primary 5 (P5)" },
    { value: "P6", label: "Primary 6 (P6)" },
    { value: "P7", label: "Primary 7 (P7)" },
    { value: "S1", label: "Senior 1 (S1)" },
    { value: "S2", label: "Senior 2 (S2)" },
    { value: "S3", label: "Senior 3 (S3)" },
    { value: "S4", label: "Senior 4 (S4)" },
    { value: "S5", label: "Senior 5 (S5)" },
    { value: "S6", label: "Senior 6 (S6)" },
  ];

  const schoolOptions = schools.map((school) => ({
    value: school.id.toString(),
    label: `${school.name} - ${school.location}`,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header - Removed Edit Button */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Children List</span>
          </button>

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
              {activeSponsors.length > 1 && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 text-sm font-semibold rounded-full">
                  {activeSponsors.length} Active Sponsors
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photo and Basic Info with Editable Fields */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="flex-shrink-0">
                  {!imageError && hasImage(child) ? (
                    <img
                      src={getImageSrc(child)}
                      alt={`${child.firstName} ${child.lastName}`}
                      className="w-40 h-40 rounded-2xl object-cover border-4 border-white shadow-lg"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                      <Camera className="text-white" size={48} />
                    </div>
                  )}
                  {hasImage(child) && !imageError && (
                    <div className="mt-2 text-center">
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        <Camera size={12} className="mr-1" />
                        Photo Available
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditableField
                      label="First Name"
                      value={child.firstName}
                      onSave={(value) => handleFieldUpdate("firstName", value)}
                      required
                      icon={<User className="text-blue-600" size={18} />}
                      bgColor="bg-blue-50"
                      borderColor="border-blue-200"
                    />

                    <EditableField
                      label="Last Name"
                      value={child.lastName}
                      onSave={(value) => handleFieldUpdate("lastName", value)}
                      required
                      icon={<User className="text-blue-600" size={18} />}
                      bgColor="bg-blue-50"
                      borderColor="border-blue-200"
                    />

                    <EditableField
                      label="Date of Birth"
                      value={child.dateOfBirth}
                      onSave={(value) =>
                        handleFieldUpdate("dateOfBirth", value)
                      }
                      type="date"
                      required
                      icon={<Calendar className="text-blue-600" size={18} />}
                      bgColor="bg-blue-50"
                      borderColor="border-blue-200"
                    />

                    <EditableField
                      label="Gender"
                      value={child.gender}
                      onSave={(value) => handleFieldUpdate("gender", value)}
                      type="select"
                      options={genderOptions}
                      required
                      icon={<Users className="text-blue-600" size={18} />}
                      bgColor="bg-blue-50"
                      borderColor="border-blue-200"
                    />

                    <EditableField
                      label="Class"
                      value={child.class}
                      onSave={(value) => handleFieldUpdate("class", value)}
                      type="select"
                      options={classOptions}
                      required
                      icon={
                        <GraduationCap className="text-purple-600" size={18} />
                      }
                      bgColor="bg-purple-50"
                      borderColor="border-purple-200"
                    />

                    <EditableField
                      label="School"
                      value={child.school.id.toString()}
                      displayValue={`${child.school.name} - ${child.school.location}`}
                      onSave={(value) => handleFieldUpdate("schoolId", value)}
                      type="select"
                      options={schoolOptions}
                      required
                      icon={
                        <GraduationCap className="text-green-600" size={18} />
                      }
                      bgColor="bg-green-50"
                      borderColor="border-green-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Story - Editable */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="text-blue-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Child's Story
                </h2>
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
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="text-purple-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Volunteer Comments
                </h2>
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
              childId={child.id}
              childName={`${child.firstName} ${child.lastName}`}
              onProfilePhotoChange={handleProfilePhotoChange}
            />
          </div>

          {/* Sidebar - Sponsorship and other info */}
          <div className="space-y-8">
            {/* Sponsorship Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Heart className="text-red-500" size={28} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Sponsorships
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddSponsor(true)}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Sponsor</span>
                </button>
              </div>

              {activeSponsors.length > 0 ? (
                <div className="space-y-4">
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
                          </div>
                          <p className="text-gray-900 font-bold">
                            {sponsorship.sponsor.fullName}
                          </p>
                          {sponsorship.sponsor.proxy && (
                            <p className="text-purple-600 text-sm mt-1">
                              Via: {sponsorship.sponsor.proxy.fullName} (
                              {sponsorship.sponsor.proxy.role})
                            </p>
                          )}
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

                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <Calendar className="text-green-600" size={16} />
                            <span className="text-sm font-semibold text-green-700">
                              Since
                            </span>
                          </div>
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

                        {sponsorship.monthlyAmount && (
                          <div className="bg-white p-3 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <DollarSign
                                className="text-green-600"
                                size={16}
                              />
                              <span className="text-sm font-semibold text-green-700">
                                Monthly Amount
                              </span>
                            </div>
                            <p className="text-gray-900 font-bold">
                              ${sponsorship.monthlyAmount}
                            </p>
                            {sponsorship.paymentMethod && (
                              <p className="text-gray-600 text-sm">
                                via {sponsorship.paymentMethod}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="bg-white p-3 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <Phone className="text-green-600" size={16} />
                            <span className="text-sm font-semibold text-green-700">
                              Contact
                            </span>
                          </div>
                          <p className="text-gray-900 text-sm break-words">
                            {sponsorship.sponsor.contact}
                          </p>
                        </div>

                        {sponsorship.notes && (
                          <div className="bg-white p-3 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <FileText className="text-green-600" size={16} />
                              <span className="text-sm font-semibold text-green-700">
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">💝</div>
                  <p className="text-gray-600 mb-4">
                    This child needs a sponsor
                  </p>
                  <button
                    onClick={() => setShowAddSponsor(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all"
                  >
                    Find Sponsor
                  </button>
                </div>
              )}

              {/* Previous Sponsors */}
              {inactiveSponsors.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Previous Sponsors ({inactiveSponsors.length})
                  </h3>
                  <div className="space-y-2">
                    {inactiveSponsors.map((sponsorship) => (
                      <div
                        key={sponsorship.id}
                        className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        <p className="font-medium text-gray-900">
                          {sponsorship.sponsor.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDateTime(sponsorship.startDate)} -{" "}
                          {sponsorship.endDate
                            ? formatDateTime(sponsorship.endDate)
                            : "Ended"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Registration & Last Updated */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="text-orange-600" size={16} />
                    <span className="text-sm font-semibold text-orange-700">
                      Registration Date
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-700 font-medium">
                      {formatDateTime(child.dateEnteredRegister)}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {
                        formatDateTimeWithRelative(child.dateEnteredRegister)
                          .relative
                      }
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="text-blue-600" size={16} />
                    <span className="text-sm font-semibold text-blue-700">
                      Last Profile Update
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-700 font-medium">
                      {formatDateTime(child.lastProfileUpdate)}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {
                        formatDateTimeWithRelative(child.lastProfileUpdate)
                          .relative
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Sponsor Modal */}
        {showAddSponsor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Add Sponsor to {child.firstName} {child.lastName}
                </h3>
                <button
                  onClick={() => setShowAddSponsor(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {availableSponsors
                  .filter(
                    (sponsor) =>
                      !activeSponsors.some((s) => s.sponsor.id === sponsor.id)
                  )
                  .map((sponsor) => (
                    <div
                      key={sponsor.id}
                      className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all"
                      onClick={() => handleAddSponsor(sponsor.id)}
                    >
                      <h4 className="font-bold text-gray-900">
                        {sponsor.fullName}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {sponsor.contact}
                      </p>
                      {sponsor.proxy && (
                        <p className="text-purple-600 text-sm mt-1">
                          Via: {sponsor.proxy.fullName} ({sponsor.proxy.role})
                        </p>
                      )}
                    </div>
                  ))}
              </div>

              {availableSponsors.filter(
                (sponsor) =>
                  !activeSponsors.some((s) => s.sponsor.id === sponsor.id)
              ).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No available sponsors found</p>
                  <p className="text-sm mt-2">
                    All sponsors are already sponsoring this child or no
                    sponsors exist.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
