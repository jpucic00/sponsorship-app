// File: frontend/src/components/SponsorForm.tsx
import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Mail,
  Phone,
  MessageSquare,
  Users,
  Search,
  Plus,
} from "lucide-react";

interface Proxy {
  id: number;
  fullName: string;
  role: string;
  contact: string;
  email?: string;
  phone?: string;
  description?: string;
}

interface SponsorFormData {
  fullName: string;
  email: string;
  phone: string;
  contact: string;
  proxyId: string;
}

interface NewProxyData {
  fullName: string;
  email: string;
  phone: string;
  contact: string;
  role: string;
  description: string;
}

interface SponsorFormProps {
  onSubmit: (
    data: SponsorFormData & { newProxy?: NewProxyData }
  ) => Promise<void>;
  proxies?: Proxy[] | any; // Optional with default, allow various API response structures
  onCancel?: () => void;
}

export const SponsorForm: React.FC<SponsorFormProps> = ({
  onSubmit,
  proxies = [], // Default to empty array if not provided
  onCancel,
}) => {
  // Form state
  const [formData, setFormData] = useState<SponsorFormData>({
    fullName: "",
    email: "",
    phone: "",
    contact: "",
    proxyId: "",
  });

  const [newProxyData, setNewProxyData] = useState<NewProxyData>({
    fullName: "",
    email: "",
    phone: "",
    contact: "",
    role: "",
    description: "",
  });

  // UI state
  const [showNewProxyForm, setShowNewProxyForm] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | null>(null);
  const [proxySearchTerm, setProxySearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch proxies if not provided via props
  useEffect(() => {
    const initializeProxies = async () => {
      // If proxies are provided via props, use them
      if (
        proxies &&
        (Array.isArray(proxies) ||
          (proxies.data && Array.isArray(proxies.data)))
      ) {
        console.log("SponsorForm - Using proxies from props");
        return;
      }

      // Otherwise, fetch them
      try {
        console.log("SponsorForm - Fetching proxies from API");
        const response = await fetch("/api/proxies");
        if (response.ok) {
          const data = await response.json();
          const proxiesArray = Array.isArray(data) ? data : data.data || [];
          console.log("SponsorForm - Fetched proxies:", proxiesArray.length);
        }
      } catch (error) {
        console.error("SponsorForm - Error fetching proxies:", error);
      }
    };

    initializeProxies();
  }, [proxies]);

  // Helper function to safely extract arrays from API responses
  const safeExtractArray = <T,>(data: any, defaultValue: T[] = []): T[] => {
    if (!data) return defaultValue;
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.results && Array.isArray(data.results)) return data.results;
    if (data.items && Array.isArray(data.items)) return data.items;
    if (data.proxies && Array.isArray(data.proxies)) return data.proxies;

    console.warn("Unexpected proxies data structure in SponsorForm:", data);
    return defaultValue;
  };

  // Get safe proxies array
  const safeProxies = safeExtractArray<Proxy>(proxies);

  // Debug logging
  useEffect(() => {
    console.log("SponsorForm - Raw proxies data:", proxies);
    console.log("SponsorForm - Safe proxies array:", safeProxies);
  }, [proxies, safeProxies]);

  // Filter proxies safely
  const filteredProxies = safeProxies.filter((proxy) => {
    const searchLower = proxySearchTerm.toLowerCase();
    return (
      proxy.fullName.toLowerCase().includes(searchLower) ||
      proxy.role.toLowerCase().includes(searchLower) ||
      proxy.contact.toLowerCase().includes(searchLower) ||
      proxy.email?.toLowerCase().includes(searchLower) ||
      proxy.phone?.toLowerCase().includes(searchLower)
    );
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Basic validation
    if (!formData.fullName.trim()) {
      alert("Sponsor name is required");
      return;
    }

    // Email validation
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        alert("Please enter a valid email address");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let submitData: any = { ...formData };

      // If creating a new proxy, include proxy data
      if (
        showNewProxyForm &&
        newProxyData.fullName.trim() &&
        newProxyData.role.trim()
      ) {
        // Validate new proxy data
        if (newProxyData.email.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(newProxyData.email.trim())) {
            alert("Please enter a valid email address for the proxy");
            setIsSubmitting(false);
            return;
          }
        }

        submitData.newProxy = newProxyData;
      }

      await onSubmit(submitData);

      // Reset form on success
      resetForm();
    } catch (error) {
      console.error("Error submitting sponsor form:", error);
      alert("Failed to create sponsor. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNewProxyChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setNewProxyData({
      ...newProxyData,
      [e.target.name]: e.target.value,
    });
  };

  // Proxy selection handlers
  const handleProxySelect = (proxy: Proxy) => {
    setSelectedProxy(proxy);
    setFormData({ ...formData, proxyId: proxy.id.toString() });
    setShowNewProxyForm(false);
  };

  const handleCreateNewProxy = () => {
    setShowNewProxyForm(true);
    setSelectedProxy(null);
    setFormData({ ...formData, proxyId: "" });
  };

  const handleNoProxy = () => {
    setShowNewProxyForm(false);
    setSelectedProxy(null);
    setFormData({ ...formData, proxyId: "" });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      contact: "",
      proxyId: "",
    });
    setNewProxyData({
      fullName: "",
      email: "",
      phone: "",
      contact: "",
      role: "",
      description: "",
    });
    setShowNewProxyForm(false);
    setSelectedProxy(null);
    setProxySearchTerm("");
  };

  // Form validation
  const isFormValid = () => {
    const basicFormValid = formData.fullName.trim();

    if (showNewProxyForm) {
      return (
        basicFormValid &&
        newProxyData.fullName.trim() &&
        newProxyData.role.trim()
      );
    }

    return basicFormValid;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 transition-all duration-500">
          <div className="flex items-center space-x-3 mb-8">
            <UserPlus className="text-green-600" size={32} />
            <h2 className="text-3xl font-bold text-gray-900">
              Sponsor Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sponsor Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Sponsor Full Name *
              </label>
              <div className="relative">
                <Users
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 text-lg"
                  placeholder="Enter full name of sponsor"
                />
              </div>
            </div>

            {/* Contact Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address
                  <span className="text-gray-500 font-normal ml-1">
                    (Optional)
                  </span>
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70"
                    placeholder="sponsor@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Phone Number
                  <span className="text-gray-500 font-normal ml-1">
                    (Optional)
                  </span>
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Additional Contact Information Note */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Email and phone are optional, but
                recommended for better communication. You can provide contact
                information in the additional contact field below.
              </p>
            </div>

            {/* Additional Contact Information */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Additional Contact Information
                <span className="text-gray-500 font-normal ml-1">
                  (Optional)
                </span>
              </label>
              <div className="relative">
                <MessageSquare
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />
                <textarea
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 resize-none"
                  placeholder="Address, alternative contact methods, preferred contact times, etc."
                />
              </div>
            </div>

            {/* Proxy/Middleman Selection */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Middleman/Proxy (Optional)
                </h3>
              </div>

              <div className="space-y-6">
                <div className="bg-white/70 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">
                    A proxy or middleman can help facilitate communication and
                    coordinate sponsorship activities locally. This helps with
                    local coordination and communication.
                  </p>
                </div>

                {/* Proxy Selection Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={handleNoProxy}
                    className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                      !showNewProxyForm &&
                      !selectedProxy &&
                      formData.proxyId === ""
                        ? "border-green-500 bg-green-50 shadow-md"
                        : "border-gray-300 hover:border-gray-400 bg-white"
                    }`}
                  >
                    <Users className="mx-auto mb-2 text-green-600" size={20} />
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900">
                        No Proxy
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Direct contact
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (safeProxies.length > 0) {
                        setShowNewProxyForm(false);
                        setSelectedProxy(null);
                        setFormData({ ...formData, proxyId: "" });
                      } else {
                        alert(
                          "No existing proxies found. Please create a new one."
                        );
                      }
                    }}
                    disabled={safeProxies.length === 0}
                    className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                      !showNewProxyForm &&
                      !selectedProxy &&
                      formData.proxyId !== ""
                        ? "border-purple-500 bg-purple-50 shadow-md"
                        : safeProxies.length === 0
                        ? "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed"
                        : "border-gray-300 hover:border-gray-400 bg-white"
                    }`}
                  >
                    <Search
                      className="mx-auto mb-2 text-purple-600"
                      size={20}
                    />
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900">
                        Existing Proxy
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {safeProxies.length === 0
                          ? "No proxies available"
                          : "Select existing"}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateNewProxy}
                    className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                      showNewProxyForm
                        ? "border-green-500 bg-green-50 shadow-md"
                        : "border-gray-300 hover:border-gray-400 bg-white"
                    }`}
                  >
                    <Plus className="mx-auto mb-2 text-green-600" size={20} />
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900">
                        Create New
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Add new proxy
                      </div>
                    </div>
                  </button>
                </div>

                {/* Proxy Search and Selection */}
                {!showNewProxyForm &&
                  !selectedProxy &&
                  formData.proxyId === "" &&
                  safeProxies.length > 0 && (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={20}
                        />
                        <input
                          type="text"
                          placeholder="Search proxies by name, role, email, or phone..."
                          value={proxySearchTerm}
                          onChange={(e) => setProxySearchTerm(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
                        />
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {filteredProxies.length > 0 ? (
                          filteredProxies.map((proxy) => (
                            <div
                              key={proxy.id}
                              onClick={() => handleProxySelect(proxy)}
                              className="p-4 border border-gray-200 rounded-xl cursor-pointer transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 bg-white"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900">
                                    {proxy.fullName}
                                  </h4>
                                  <p className="text-sm text-purple-600 font-medium">
                                    {proxy.role}
                                  </p>
                                  <div className="mt-2 space-y-1">
                                    {proxy.email && (
                                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                                        <Mail size={12} />
                                        <span>{proxy.email}</span>
                                      </div>
                                    )}
                                    {proxy.phone && (
                                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                                        <Phone size={12} />
                                        <span>{proxy.phone}</span>
                                      </div>
                                    )}
                                    {proxy.contact && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        {proxy.contact}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Users
                              size={48}
                              className="mx-auto mb-3 opacity-50"
                            />
                            <p>No proxies found</p>
                            <p className="text-sm">
                              Try adjusting your search or create a new proxy.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Selected Proxy Display */}
                {selectedProxy && (
                  <div className="bg-purple-100 p-4 rounded-xl border border-purple-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-purple-900">
                          Selected Proxy: {selectedProxy.fullName}
                        </h4>
                        <p className="text-sm text-purple-700">
                          {selectedProxy.role}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleNoProxy}
                        className="text-purple-600 hover:text-purple-800 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* New Proxy Form */}
                {showNewProxyForm && (
                  <div className="bg-white/90 p-6 rounded-xl border border-purple-200 space-y-4">
                    <h4 className="font-semibold text-purple-900 mb-4">
                      Create New Proxy
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={newProxyData.fullName}
                          onChange={handleNewProxyChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Proxy's full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Role *
                        </label>
                        <input
                          type="text"
                          name="role"
                          value={newProxyData.role}
                          onChange={handleNewProxyChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Local coordinator, representative, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={newProxyData.email}
                          onChange={handleNewProxyChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="proxy@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={newProxyData.phone}
                          onChange={handleNewProxyChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Contact Information
                      </label>
                      <textarea
                        name="contact"
                        value={newProxyData.contact}
                        onChange={handleNewProxyChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder="Address, alternative contact methods, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={newProxyData.description}
                        onChange={handleNewProxyChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder="Additional details about the proxy's role or background..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="flex-1 flex items-center justify-center space-x-2 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Creating Sponsor...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>Create Sponsor</span>
                  </>
                )}
              </button>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
