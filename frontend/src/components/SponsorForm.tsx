import React, { useState, useEffect } from "react";
import { UserPlus, Users, Phone, Check, Plus, Search } from "lucide-react";

interface Proxy {
  id: number;
  fullName: string;
  role: string;
  contact: string;
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
    contact: "",
    proxyId: "",
    ...initialData,
  });

  const [newProxyData, setNewProxyData] = useState({
    fullName: "",
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
    if (showNewProxyForm && newProxyData.fullName && newProxyData.contact) {
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
      proxy.contact.toLowerCase().includes(proxySearchTerm.toLowerCase())
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

  const isFormValid = () => {
    const basicFormValid = formData.fullName.trim() && formData.contact.trim();

    if (showNewProxyForm) {
      return (
        basicFormValid &&
        newProxyData.fullName.trim() &&
        newProxyData.contact.trim() &&
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

            {/* Contact Information */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Contact Information *
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />
                <textarea
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 text-lg resize-none"
                  placeholder="Phone number, email, address, or any other contact information"
                />
              </div>
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                💡 Include multiple contact methods when possible (phone, email,
                address)
              </p>
            </div>

            {/* Proxy/Middleman Selection */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Middleman/Proxy (Optional)
                  </label>

                  {/* Proxy Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewProxyForm(false);
                        setSelectedProxy(null);
                        setFormData({ ...formData, proxyId: "" });
                      }}
                      className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                        !showNewProxyForm && !selectedProxy
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-gray-400 bg-white"
                      }`}
                    >
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
                      }}
                      className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                        !showNewProxyForm && !selectedProxy
                          ? "border-gray-300 hover:border-gray-400 bg-white"
                          : "border-purple-500 bg-purple-50 shadow-md"
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

                  {/* Existing Proxy Search and Selection */}
                  {!showNewProxyForm &&
                    !selectedProxy &&
                    formData.proxyId === "" && (
                      <div className="space-y-4">
                        <div className="relative">
                          <Search
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={20}
                          />
                          <input
                            type="text"
                            placeholder="Search proxies by name, role, or contact..."
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
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-bold text-gray-900">
                                      {proxy.fullName}
                                    </h4>
                                    <p className="text-sm text-purple-600 font-medium">
                                      {proxy.role}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {proxy.contact}
                                    </p>
                                    {proxy.description && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {proxy.description}
                                      </p>
                                    )}
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
                    <div className="bg-purple-100 p-4 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-purple-900">
                            Selected: {selectedProxy.fullName}
                          </h4>
                          <p className="text-sm text-purple-700">
                            {selectedProxy.role}
                          </p>
                          <p className="text-sm text-purple-600 mt-1">
                            {selectedProxy.contact}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProxy(null);
                            setFormData({ ...formData, proxyId: "" });
                          }}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <Check size={24} />
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
                              required={showNewProxyForm}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70"
                              placeholder="Enter proxy full name"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Role *
                            </label>
                            <select
                              name="role"
                              value={newProxyData.role}
                              onChange={handleNewProxyChange}
                              required={showNewProxyForm}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70"
                            >
                              <option value="">Select Role</option>
                              <option value="Priest">Priest</option>
                              <option value="Pastor">Pastor</option>
                              <option value="Nun">Nun/Sister</option>
                              <option value="Community Leader">
                                Community Leader
                              </option>
                              <option value="Teacher">Teacher</option>
                              <option value="Social Worker">
                                Social Worker
                              </option>
                              <option value="Village Elder">
                                Village Elder
                              </option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Contact Information *
                          </label>
                          <textarea
                            name="contact"
                            value={newProxyData.contact}
                            onChange={handleNewProxyChange}
                            required={showNewProxyForm}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 resize-none"
                            placeholder="Phone number, email, address, or any other contact information"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Description (Optional)
                          </label>
                          <textarea
                            name="description"
                            value={newProxyData.description}
                            onChange={handleNewProxyChange}
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 resize-none"
                            placeholder="Additional information about the proxy (optional)"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white/60 p-4 rounded-xl border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium mb-2">
                    🤝 About Proxies/Middlemen
                  </p>
                  <p className="text-sm text-gray-600">
                    Select a priest, community leader, or other trusted
                    intermediary if the sponsor prefers to work through someone.
                    This helps with local coordination and communication.
                  </p>
                </div>
              </div>
            </div>

            {/* Available Proxies Info */}
            {proxies.length > 0 && !showNewProxyForm && (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                  Available Proxies
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {proxies.slice(0, 4).map((proxy) => (
                    <div
                      key={proxy.id}
                      className="bg-white p-3 rounded-lg border border-gray-200 text-sm"
                    >
                      <div className="font-medium text-gray-900">
                        {proxy.fullName}
                      </div>
                      <div className="text-gray-600">{proxy.role}</div>
                    </div>
                  ))}
                </div>
                {proxies.length > 4 && (
                  <p className="text-sm text-gray-500 mt-3">
                    And {proxies.length - 4} more available...
                  </p>
                )}
              </div>
            )}

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
                      formData.contact.trim() ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-700">
                    Contact information provided
                  </span>
                </div>
                {showNewProxyForm && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          newProxyData.fullName.trim()
                            ? "bg-green-500"
                            : "bg-red-300"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-700">
                        New proxy name entered
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          newProxyData.role.trim()
                            ? "bg-green-500"
                            : "bg-red-300"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-700">
                        New proxy role selected
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          newProxyData.contact.trim()
                            ? "bg-green-500"
                            : "bg-red-300"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-700">
                        New proxy contact provided
                      </span>
                    </div>
                  </>
                )}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-700">
                    Proxy selection is optional
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={!isFormValid()}
                className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-xl disabled:hover:scale-100"
              >
                <Check size={24} />
                <span className="text-lg">
                  {initialData ? "Update Sponsor" : "Register Sponsor"}
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
                is saved in our system
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
                Facilitate the sponsorship relationship
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
