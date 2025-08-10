// Enhanced SponsorDetails.tsx with editing capabilities
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  Users,
  Mail,
  Phone,
  MessageSquare,
  Link2,
  MapPin,
  FileText,
  UserCheck,
  Clock,
  Check,
  X,
  Plus,
  Calendar,
} from "lucide-react";
import {
  formatDateTime,
  formatDate,
  formatDateTimeWithRelative,
} from "../utils/dateUtils";

interface Sponsor {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  contact: string;
  createdAt: string; // Registration date
  updatedAt: string; // Last update date
  proxy?: {
    id: number;
    fullName: string;
    email?: string;
    phone?: string;
    contact: string;
    role: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  sponsorships?: Array<{
    id: number;
    monthlyAmount?: number;
    paymentMethod?: string;
    startDate: string;
    endDate?: string;
    notes?: string;
    isActive: boolean;
    child: {
      id: number;
      firstName: string;
      lastName: string;
      school: {
        name: string;
        location: string;
      };
    };
  }>;
}

interface Proxy {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  contact: string;
  role: string;
  description?: string;
}

interface SponsorDetailsProps {
  sponsorId: number;
  onBack: () => void;
}

// Enhanced Editable Field Component for Sponsors and Proxies
interface EditableFieldProps {
  label: string;
  value: string | undefined;
  onSave: (value: string) => void;
  multiline?: boolean;
  required?: boolean;
  readonly?: boolean;
  type?: "text" | "email" | "tel" | "select";
  options?: Array<{ value: string; label: string }>;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  placeholder?: string;
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
  placeholder,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (required && !tempValue.trim()) {
      alert(`${label} is required`);
      return;
    }

    // Email validation for email type fields
    if (type === "email" && tempValue.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(tempValue.trim())) {
        alert("Please enter a valid email address");
        return;
      }
    }

    setSaving(true);
    try {
      await onSave(tempValue.trim());
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
              {value || (
                <span className="text-gray-500 italic">
                  {placeholder || "Not provided"}
                </span>
              )}
            </div>
          </div>
          {!readonly && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 p-1 transition-colors"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            disabled={saving}
          >
            <option value="">Select {label.toLowerCase()}</option>
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
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
            disabled={saving}
          />
        ) : (
          <input
            type={type}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            disabled={saving}
          />
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check size={14} />
            )}
            <span>Save</span>
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            <X size={14} />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const SponsorDetails: React.FC<SponsorDetailsProps> = ({
  sponsorId,
  onBack,
}) => {
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [availableProxies, setAvailableProxies] = useState<Proxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProxy, setShowAddProxy] = useState(false);

  // Fetch sponsor details
  const fetchSponsorDetails = async () => {
    try {
      const response = await fetch(`/api/sponsors/${sponsorId}`);
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

  // Fetch available proxies
  const fetchAvailableProxies = async () => {
    try {
      const response = await fetch("/api/proxies");
      if (response.ok) {
        const data = await response.json();
        setAvailableProxies(data.data || data || []);
      }
    } catch (error) {
      console.error("Error fetching proxies:", error);
    }
  };

  useEffect(() => {
    fetchSponsorDetails();
    fetchAvailableProxies();
  }, [sponsorId]);

  // Handle sponsor field updates
  const handleSponsorFieldUpdate = async (fieldName: string, value: string) => {
    if (!sponsor) return;

    try {
      const updateData: any = { [fieldName]: value };

      const response = await fetch(`/api/sponsors/${sponsor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedSponsor = await response.json();
        setSponsor(updatedSponsor);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update sponsor");
      }
    } catch (error) {
      console.error("Error updating sponsor:", error);
      throw error;
    }
  };

  // Handle proxy field updates
  const handleProxyFieldUpdate = async (fieldName: string, value: string) => {
    if (!sponsor?.proxy) return;

    try {
      const updateData: any = { [fieldName]: value };

      const response = await fetch(`/api/proxies/${sponsor.proxy.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedProxy = await response.json();
        setSponsor({
          ...sponsor,
          proxy: updatedProxy,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update proxy");
      }
    } catch (error) {
      console.error("Error updating proxy:", error);
      throw error;
    }
  };

  // Handle proxy assignment/removal
  const handleAssignProxy = async (proxyId: number | null) => {
    if (!sponsor) return;

    try {
      const response = await fetch(`/api/sponsors/${sponsor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ proxyId }),
      });

      if (response.ok) {
        const updatedSponsor = await response.json();
        setSponsor(updatedSponsor);
        setShowAddProxy(false);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update proxy assignment");
      }
    } catch (error) {
      console.error("Error updating proxy assignment:", error);
      alert("Failed to update proxy assignment");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!sponsor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center py-20">
          <p className="text-gray-600 text-lg mb-4">Sponsor not found</p>
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

  const activeSponsors = sponsor.sponsorships?.filter((s) => s.isActive) || [];
  const inactiveSponsors =
    sponsor.sponsorships?.filter((s) => !s.isActive) || [];

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
                  <Link2 size={16} className="mr-1" />
                  Via Proxy
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Sponsor Details */}
          <div className="space-y-6">
            {/* Main Sponsor Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="text-green-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Sponsor Information
                </h2>
              </div>

              <div className="space-y-4">
                <EditableField
                  label="Full Name"
                  value={sponsor.fullName}
                  onSave={(value) =>
                    handleSponsorFieldUpdate("fullName", value)
                  }
                  required
                  icon={<Users className="text-green-600" size={16} />}
                  bgColor="bg-green-50"
                  borderColor="border-green-200"
                  placeholder="Enter sponsor's full name"
                />

                <EditableField
                  label="Email Address"
                  value={sponsor.email}
                  onSave={(value) => handleSponsorFieldUpdate("email", value)}
                  type="email"
                  icon={<Mail className="text-blue-600" size={16} />}
                  bgColor="bg-blue-50"
                  borderColor="border-blue-200"
                  placeholder="Enter email address"
                />

                <EditableField
                  label="Phone Number"
                  value={sponsor.phone}
                  onSave={(value) => handleSponsorFieldUpdate("phone", value)}
                  type="tel"
                  icon={<Phone className="text-purple-600" size={16} />}
                  bgColor="bg-purple-50"
                  borderColor="border-purple-200"
                  placeholder="Enter phone number"
                />

                <EditableField
                  label="Additional Contact Information"
                  value={sponsor.contact}
                  onSave={(value) => handleSponsorFieldUpdate("contact", value)}
                  multiline
                  icon={<MessageSquare className="text-gray-600" size={16} />}
                  bgColor="bg-gray-50"
                  borderColor="border-gray-200"
                  placeholder="Additional contact details, address, preferred contact times, etc."
                />
              </div>
            </div>

            {/* Proxy Assignment */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Link2 className="text-purple-600" size={28} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Proxy Assignment
                  </h2>
                </div>
                <div className="flex space-x-2">
                  {sponsor.proxy && (
                    <button
                      onClick={() => handleAssignProxy(null)}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X size={16} />
                      <span>Remove Proxy</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddProxy(!showAddProxy)}
                    className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus size={16} />
                    <span>
                      {sponsor.proxy ? "Change Proxy" : "Assign Proxy"}
                    </span>
                  </button>
                </div>
              </div>

              {showAddProxy && (
                <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-3">
                    Select Proxy
                  </h4>
                  <div className="space-y-2">
                    {availableProxies.map((proxy) => (
                      <div
                        key={proxy.id}
                        className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all"
                        onClick={() => handleAssignProxy(proxy.id)}
                      >
                        <div className="font-medium text-gray-900">
                          {proxy.fullName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {proxy.role}
                        </div>
                        {proxy.email && (
                          <div className="text-sm text-gray-600">
                            {proxy.email}
                          </div>
                        )}
                      </div>
                    ))}
                    {availableProxies.length === 0 && (
                      <p className="text-gray-500 text-sm">
                        No proxies available. Create a proxy first.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {sponsor.proxy ? (
                <div className="space-y-4">
                  <EditableField
                    label="Proxy Name"
                    value={sponsor.proxy.fullName}
                    onSave={(value) =>
                      handleProxyFieldUpdate("fullName", value)
                    }
                    required
                    icon={<Users className="text-purple-600" size={16} />}
                    bgColor="bg-purple-50"
                    borderColor="border-purple-200"
                    placeholder="Enter proxy's full name"
                  />

                  <EditableField
                    label="Proxy Role"
                    value={sponsor.proxy.role}
                    onSave={(value) => handleProxyFieldUpdate("role", value)}
                    required
                    icon={<MapPin className="text-purple-600" size={16} />}
                    bgColor="bg-purple-50"
                    borderColor="border-purple-200"
                    placeholder="Enter proxy's role or title"
                  />

                  <EditableField
                    label="Proxy Email"
                    value={sponsor.proxy.email}
                    onSave={(value) => handleProxyFieldUpdate("email", value)}
                    type="email"
                    icon={<Mail className="text-blue-600" size={16} />}
                    bgColor="bg-blue-50"
                    borderColor="border-blue-200"
                    placeholder="Enter proxy's email address"
                  />

                  <EditableField
                    label="Proxy Phone"
                    value={sponsor.proxy.phone}
                    onSave={(value) => handleProxyFieldUpdate("phone", value)}
                    type="tel"
                    icon={<Phone className="text-purple-600" size={16} />}
                    bgColor="bg-purple-50"
                    borderColor="border-purple-200"
                    placeholder="Enter proxy's phone number"
                  />

                  <EditableField
                    label="Proxy Contact Info"
                    value={sponsor.proxy.contact}
                    onSave={(value) => handleProxyFieldUpdate("contact", value)}
                    multiline
                    icon={<MessageSquare className="text-gray-600" size={16} />}
                    bgColor="bg-gray-50"
                    borderColor="border-gray-200"
                    placeholder="Additional contact details for the proxy"
                  />

                  <EditableField
                    label="Description"
                    value={sponsor.proxy.description}
                    onSave={(value) =>
                      handleProxyFieldUpdate("description", value)
                    }
                    multiline
                    icon={<FileText className="text-indigo-600" size={16} />}
                    bgColor="bg-indigo-50"
                    borderColor="border-indigo-200"
                    placeholder="Description of proxy's responsibilities or additional details"
                  />
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-500 mb-4">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No Proxy Assigned
                    </h3>
                    <p className="text-gray-600">
                      This sponsor communicates directly without a proxy.
                      <br />
                      You can assign a proxy to help facilitate communication.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sponsorships */}
          <div className="space-y-6">
            {/* Registration & Update Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="text-blue-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Registration Information
                </h2>
              </div>

              <div className="space-y-4">
                {/* Registration Date */}
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="text-green-600" size={16} />
                    <span className="text-sm font-semibold text-green-700">
                      Registration Date
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {formatDateTime(sponsor.createdAt)}
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    {formatDateTimeWithRelative(sponsor.createdAt).relative}
                  </p>
                </div>

                {/* Last Updated */}
                {sponsor.updatedAt &&
                  sponsor.updatedAt !== sponsor.createdAt && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="text-blue-600" size={16} />
                        <span className="text-sm font-semibold text-blue-700">
                          Last Updated
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">
                        {formatDateTime(sponsor.updatedAt)}
                      </p>
                      <p className="text-blue-600 text-sm mt-1">
                        {formatDateTimeWithRelative(sponsor.updatedAt).relative}
                      </p>
                    </div>
                  )}

                {/* Sponsor ID */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="text-gray-600" size={16} />
                    <span className="text-sm font-semibold text-gray-700">
                      Sponsor ID
                    </span>
                  </div>
                  <p className="text-gray-900 font-mono">
                    #{sponsor.id.toString().padStart(4, "0")}
                  </p>
                </div>

                {/* Activity Summary */}
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <UserCheck className="text-purple-600" size={16} />
                    <span className="text-sm font-semibold text-purple-700">
                      Activity Summary
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Active Sponsorships:
                      </span>
                      <span className="font-medium text-purple-800">
                        {activeSponsors.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Sponsorships:</span>
                      <span className="font-medium text-purple-800">
                        {sponsor.sponsorships?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Communication Method:
                      </span>
                      <span className="font-medium text-purple-800">
                        {sponsor.proxy ? "Via Proxy" : "Direct"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Sponsorships */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <UserCheck className="text-green-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Active Sponsorships
                </h2>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                  {activeSponsors.length}
                </span>
              </div>

              {activeSponsors.length > 0 ? (
                <div className="space-y-4">
                  {activeSponsors.map((sponsorship) => (
                    <div
                      key={sponsorship.id}
                      className="bg-green-50 rounded-xl p-4 border border-green-200"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-green-800">
                            {sponsorship.child.firstName}{" "}
                            {sponsorship.child.lastName}
                          </h4>
                          <p className="text-green-600 text-sm">
                            {sponsorship.child.school.name},{" "}
                            {sponsorship.child.school.location}
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            Since: {formatDate(sponsorship.startDate)}
                          </p>
                          {sponsorship.monthlyAmount && (
                            <p className="text-green-700 text-sm font-medium">
                              Monthly: ${sponsorship.monthlyAmount}
                            </p>
                          )}
                        </div>
                      </div>
                      {sponsorship.notes && (
                        <div className="mt-3 p-2 bg-white rounded border border-green-300">
                          <p className="text-gray-700 text-sm">
                            {sponsorship.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No active sponsorships</p>
                  <p className="text-sm mt-2">
                    This sponsor is not currently sponsoring any children.
                  </p>
                </div>
              )}
            </div>

            {/* Inactive Sponsorships */}
            {inactiveSponsors.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Clock className="text-gray-600" size={28} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Past Sponsorships
                  </h2>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-semibold">
                    {inactiveSponsors.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {inactiveSponsors.map((sponsorship) => (
                    <div
                      key={sponsorship.id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-gray-800">
                            {sponsorship.child.firstName}{" "}
                            {sponsorship.child.lastName}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {sponsorship.child.school.name},{" "}
                            {sponsorship.child.school.location}
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            {formatDate(sponsorship.startDate)} -{" "}
                            {sponsorship.endDate
                              ? formatDate(sponsorship.endDate)
                              : "Unknown"}
                          </p>
                        </div>
                      </div>
                      {sponsorship.notes && (
                        <div className="mt-3 p-2 bg-white rounded border border-gray-300">
                          <p className="text-gray-700 text-sm">
                            {sponsorship.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
