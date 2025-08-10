// File: frontend/src/components/ProxySelector.tsx
import React, { useState, useEffect } from "react";
import { Search, Plus, Users, Check, Mail, Phone, X } from "lucide-react";

interface Proxy {
  id: number;
  fullName: string;
  role: string;
  contact: string;
  email?: string;
  phone?: string;
  description?: string;
}

interface ProxySelectorProps {
  proxies: Proxy[] | any; // Allow various API response structures
  showNewProxyForm: boolean;
  setShowNewProxyForm: (show: boolean) => void;
  selectedProxy: Proxy | null;
  setSelectedProxy: (proxy: Proxy | null) => void;
  newProxyData: {
    fullName: string;
    email: string;
    phone: string;
    contact: string;
    role: string;
    description: string;
  };
  handleNewProxyChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  proxySearchTerm: string;
  setProxySearchTerm: (term: string) => void;
  newSponsorData: {
    fullName: string;
    email: string;
    phone: string;
    contact: string;
    proxyId: string;
  };
  handleNewSponsorChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

export const ProxySelector: React.FC<ProxySelectorProps> = ({
  proxies,
  showNewProxyForm,
  setShowNewProxyForm,
  selectedProxy,
  setSelectedProxy,
  newProxyData,
  handleNewProxyChange,
  proxySearchTerm,
  setProxySearchTerm,
  handleNewSponsorChange,
}) => {
  const [hasSearched, setHasSearched] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10);

  // Helper function to safely extract arrays from API responses
  const safeExtractArray = <T,>(data: any, defaultValue: T[] = []): T[] => {
    if (!data) return defaultValue;
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.results && Array.isArray(data.results)) return data.results;
    if (data.items && Array.isArray(data.items)) return data.items;
    if (data.proxies && Array.isArray(data.proxies)) return data.proxies;

    console.warn("Unexpected proxies data structure in ProxySelector:", data);
    return defaultValue;
  };

  // Get safe proxies array
  const safeProxies = safeExtractArray<Proxy>(proxies);

  // Debug logging
  useEffect(() => {
    console.log("ProxySelector - Available proxies:", proxies);
    console.log("ProxySelector - Safe proxies array:", safeProxies);
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

  // Show initial proxies or filtered results
  const displayProxies = hasSearched
    ? filteredProxies
    : safeProxies.slice(0, displayLimit);

  const handleProxySelect = (proxy: Proxy) => {
    setSelectedProxy(proxy);
    const fakeEvent = {
      target: { name: "proxyId", value: proxy.id.toString() },
    } as React.ChangeEvent<HTMLInputElement>;
    handleNewSponsorChange(fakeEvent);
    setShowNewProxyForm(false);
  };

  const handleCreateNewProxy = () => {
    setShowNewProxyForm(true);
    setSelectedProxy(null);
    const fakeEvent = {
      target: { name: "proxyId", value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    handleNewSponsorChange(fakeEvent);
  };

  const handleNoProxy = () => {
    setShowNewProxyForm(false);
    setSelectedProxy(null);
    const fakeEvent = {
      target: { name: "proxyId", value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    handleNewSponsorChange(fakeEvent);
  };

  const handleSearch = (value: string) => {
    setProxySearchTerm(value);
    setHasSearched(value.length > 0);
  };

  return (
    <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Middleman/Proxy (Optional)
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              type="button"
              onClick={handleNoProxy}
              className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                !showNewProxyForm && !selectedProxy
                  ? "border-green-500 bg-green-50 shadow-md"
                  : "border-gray-300 hover:border-gray-400 bg-white"
              }`}
            >
              <Users className="mx-auto mb-2 text-green-600" size={20} />
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">
                  No Proxy
                </div>
                <div className="text-xs text-gray-600 mt-1">Direct contact</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (safeProxies.length > 0) {
                  setShowNewProxyForm(false);
                  setSelectedProxy(null);
                  const fakeEvent = {
                    target: { name: "proxyId", value: "" },
                  } as React.ChangeEvent<HTMLInputElement>;
                  handleNewSponsorChange(fakeEvent);
                } else {
                  alert("No existing proxies found. Please create a new one.");
                }
              }}
              disabled={safeProxies.length === 0}
              className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                !showNewProxyForm && !selectedProxy && safeProxies.length > 0
                  ? "border-purple-500 bg-purple-50 shadow-md"
                  : safeProxies.length === 0
                  ? "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed"
                  : "border-gray-300 hover:border-gray-400 bg-white"
              }`}
            >
              <Search className="mx-auto mb-2 text-purple-600" size={20} />
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
                <div className="text-xs text-gray-600 mt-1">Add new proxy</div>
              </div>
            </button>
          </div>

          {/* Proxy Search and Selection */}
          {!showNewProxyForm && !selectedProxy && safeProxies.length > 0 && (
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
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {displayProxies.length > 0 ? (
                  displayProxies.map((proxy) => (
                    <div
                      key={proxy.id}
                      onClick={() => handleProxySelect(proxy)}
                      className="p-4 border border-gray-200 rounded-xl cursor-pointer transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 bg-white"
                    >
                      <div>
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
                  ))
                ) : hasSearched ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No proxies found</p>
                    <p className="text-sm">
                      Try adjusting your search or create a new proxy.
                    </p>
                  </div>
                ) : safeProxies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No proxies available</p>
                    <p className="text-sm">
                      Create a new proxy to get started.
                    </p>
                  </div>
                ) : null}

                {/* Show More Button */}
                {!hasSearched && safeProxies.length > displayLimit && (
                  <button
                    type="button"
                    onClick={() => setDisplayLimit(displayLimit + 10)}
                    className="w-full p-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    Show {Math.min(10, safeProxies.length - displayLimit)} more
                    proxies
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Selected Proxy Display */}
          {selectedProxy && (
            <div className="bg-green-100 p-4 rounded-xl border border-green-300 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-900 flex items-center">
                  <Check size={16} className="mr-2" />
                  Selected: {selectedProxy.fullName}
                </h4>
                <p className="text-sm text-green-700">{selectedProxy.role}</p>
              </div>
              <button
                type="button"
                onClick={handleNoProxy}
                className="text-green-600 hover:text-green-800 p-1"
                title="Remove selection"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* New Proxy Form */}
          {showNewProxyForm && (
            <div className="bg-white/90 p-6 rounded-xl border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-4">
                Create New Proxy
              </h4>
              <div className="space-y-4">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
