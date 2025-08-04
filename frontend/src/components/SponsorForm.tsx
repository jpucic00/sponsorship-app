import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Users,
  Phone,
  Mail,
  MessageSquare,
  Check,
  Plus,
  Search,
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

interface SponsorFormProps {
  onSubmit: (sponsorData: any) => void;
  initialData?: any;
}

export const SponsorForm: React.FC<SponsorFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [proxySearchTerm, setProxySearchTerm] = useState("");
  const [showNewProxyForm, setShowNewProxyForm] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    contact: "",
    proxyId: "",
    ...initialData,
  });

  const [newProxyData, setNewProxyData] = useState({
    fullName: "",
    email: "",
    phone: "",
    contact: "",
    role: "",
    description: "",
  });

  useEffect(() => {
    // Fetch proxies for dropdown
    fetch("/api/proxies")
      .then((res) => res.json())
      .then(setProxies)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalData = { ...formData };

    // If creating a new proxy, first create the proxy then use its ID
    if (showNewProxyForm && newProxyData.fullName) {
      try {
        const proxyResponse = await fetch("/api/proxies", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newProxyData),
        });

        if (proxyResponse.ok) {
          const newProxy = await proxyResponse.json();
          finalData.proxyId = newProxy.id.toString();
          // Add the new proxy to the list for immediate display
          setProxies((prev) => [...prev, newProxy]);
        } else {
          throw new Error("Failed to create proxy");
        }
      } catch (error) {
        console.error("Error creating proxy:", error);
        alert("Failed to create proxy. Please try again.");
        return;
      }
    }

    onSubmit(finalData);
  };

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

  const filteredProxies = proxies.filter(
    (proxy) =>
      proxy.fullName.toLowerCase().includes(proxySearchTerm.toLowerCase()) ||
      proxy.role.toLowerCase().includes(proxySearchTerm.toLowerCase()) ||
      proxy.contact.toLowerCase().includes(proxySearchTerm.toLowerCase()) ||
      proxy.email?.toLowerCase().includes(proxySearchTerm.toLowerCase()) ||
      proxy.phone?.toLowerCase().includes(proxySearchTerm.toLowerCase())
  );

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

            {/* Contact Information Note */}
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Email and phone are optional. You can
                provide contact information in the additional contact field
                below.
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
                        ? "border-gray-500 bg-gray-50 shadow-md"
                        : "border-gray-300 hover:border-gray-400 bg-white"
                    }`}
                  >
                    <Check className="mx-auto mb-2 text-gray-600" size={20} />
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
                      setShowNewProxyForm(false);
                      setSelectedProxy(null);
                      // Don't clear proxyId here, let user search
                    }}
                    className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                      !showNewProxyForm &&
                      !selectedProxy &&
                      formData.proxyId !== ""
                        ? "border-purple-500 bg-purple-50 shadow-md"
                        : "border-gray-300 hover:border-gray-400 bg-white"
                    }`}
                  >
                    <Search
                      className="mx-auto mb-2 text-purple-600"
                      size={20}
                    />
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900">
                        Select Existing
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Choose from list
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
                {!showNewProxyForm && !selectedProxy && (
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
                  <div className="bg-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-purple-900 text-lg">
                          Selected: {selectedProxy.fullName}
                        </h4>
                        <p className="text-sm text-purple-700 font-medium">
                          {selectedProxy.role}
                        </p>
                        <div className="mt-2 space-y-1">
                          {selectedProxy.email && (
                            <div className="flex items-center space-x-2 text-sm text-purple-600">
                              <Mail size={14} />
                              <span>{selectedProxy.email}</span>
                            </div>
                          )}
                          {selectedProxy.phone && (
                            <div className="flex items-center space-x-2 text-sm text-purple-600">
                              <Phone size={14} />
                              <span>{selectedProxy.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleNoProxy}
                        className="text-purple-600 hover:text-purple-800 ml-4"
                        title="Remove proxy selection"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* New Proxy Form */}
                {showNewProxyForm && (
                  <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      New Proxy Information
                    </h4>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={newProxyData.fullName}
                            onChange={handleNewProxyChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70"
                            placeholder="Enter proxy full name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Role *
                          </label>
                          <input
                            type="text"
                            name="role"
                            value={newProxyData.role}
                            onChange={handleNewProxyChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70"
                            placeholder="e.g., Community Leader, Priest"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={newProxyData.email}
                            onChange={handleNewProxyChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70"
                            placeholder="proxy@example.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={newProxyData.phone}
                            onChange={handleNewProxyChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Additional Contact Information
                          <span className="text-gray-500 font-normal ml-1">
                            (Optional)
                          </span>
                        </label>
                        <textarea
                          name="contact"
                          value={newProxyData.contact}
                          onChange={handleNewProxyChange}
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 resize-none"
                          placeholder="Address, alternative contact methods, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Description
                          <span className="text-gray-500 font-normal ml-1">
                            (Optional)
                          </span>
                        </label>
                        <textarea
                          name="description"
                          value={newProxyData.description}
                          onChange={handleNewProxyChange}
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 resize-none"
                          placeholder="Additional information about the proxy"
                        />
                      </div>

                      <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-700">
                          <strong>Note:</strong> Email and phone are optional.
                          You can provide contact information in the additional
                          contact field below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Validation Display */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Check className="text-blue-600 mr-2" size={20} />
                Form Status
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      formData.fullName.trim() ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-700">
                    Sponsor name entered
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      formData.email.trim() || formData.phone.trim()
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-700">
                    Contact information provided (email or phone)
                  </span>
                </div>
                {showNewProxyForm && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          newProxyData.fullName.trim()
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-700">
                        Proxy name entered
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          newProxyData.email.trim() || newProxyData.phone.trim()
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-700">
                        Proxy contact information provided
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          newProxyData.role.trim()
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-700">
                        Proxy role specified
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col items-center pt-6">
              <button
                type="submit"
                disabled={!isFormValid()}
                className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                  isFormValid()
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:scale-105 shadow-xl hover:shadow-2xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <UserPlus size={20} />
                  <span>
                    {initialData ? "Update Sponsor" : "Register Sponsor"}
                  </span>
                </span>
              </button>

              {!isFormValid() && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  Please fill in all required fields to continue
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Additional Info Card */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3 flex items-center justify-center">
              <Check size={16} className="text-white" />
            </div>
            What Happens Next?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="font-semibold text-green-700">
                1. Registration
              </div>
              <div className="text-gray-700 mt-1">
                Your sponsor {showNewProxyForm ? "and proxy" : ""} information
                is saved in our system with structured contact details
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="font-semibold text-blue-700">2. Matching</div>
              <div className="text-gray-700 mt-1">
                We'll help match the sponsor with a child in need
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <div className="font-semibold text-purple-700">3. Connection</div>
              <div className="text-gray-700 mt-1">
                Facilitate the sponsorship relationship using the provided
                contact methods
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
