import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Users,
  Check,
  Mail,
  Phone,
  MessageSquare,
  X,
} from "lucide-react";

interface Proxy {
  id: number;
  fullName: string;
  role: string;
  contact: string;
  email?: string;
  phone?: string;
}

interface ProxySelectorProps {
  proxies: Proxy[];
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
  // FIXED: Show initial list by default, filtered list after search
  const [hasSearched, setHasSearched] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10);

  useEffect(() => {
    console.log("ProxySelector - Available proxies:", proxies);
  }, [proxies]);

  const filteredProxies = proxies.filter(
    (proxy) =>
      proxy.fullName.toLowerCase().includes(proxySearchTerm.toLowerCase()) ||
      proxy.role.toLowerCase().includes(proxySearchTerm.toLowerCase()) ||
      proxy.contact.toLowerCase().includes(proxySearchTerm.toLowerCase()) ||
      proxy.email?.toLowerCase().includes(proxySearchTerm.toLowerCase()) ||
      proxy.phone?.toLowerCase().includes(proxySearchTerm.toLowerCase())
  );

  // FIXED: Show initial proxies or filtered results
  const displayProxies = hasSearched
    ? filteredProxies
    : proxies.slice(0, displayLimit);
  const hasMoreProxies = !hasSearched && proxies.length > displayLimit;

  // Handle search execution
  const handleSearch = () => {
    setHasSearched(true);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search and show default list
  const handleClearSearch = () => {
    setProxySearchTerm("");
    setHasSearched(false);
  };

  // Load more proxies in default view
  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + 10);
  };

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
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Check size={20} />
                <span className="font-medium">No Proxy</span>
              </div>
              <p className="text-sm mt-2 opacity-75">
                Direct communication with sponsor
              </p>
            </button>

            <button
              type="button"
              onClick={handleCreateNewProxy}
              className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                showNewProxyForm
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Plus size={20} />
                <span className="font-medium">Create New</span>
              </div>
              <p className="text-sm mt-2 opacity-75">
                Add a new proxy/middleman
              </p>
            </button>

            <div className="relative">
              <button
                type="button"
                className="w-full p-4 border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 rounded-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Search size={20} />
                  <span className="font-medium">Select Existing</span>
                </div>
                <p className="text-sm mt-2 opacity-75">
                  Choose from existing proxies
                </p>
              </button>
            </div>
          </div>

          {/* Search for Existing Proxies */}
          {!showNewProxyForm && !selectedProxy && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={proxySearchTerm}
                    onChange={(e) => setProxySearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
                    placeholder="Search by name, role, or contact info..."
                  />
                  {proxySearchTerm && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200"
                >
                  Search
                </button>
              </div>

              {/* Search Status */}
              {hasSearched && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    {filteredProxies.length > 0 ? (
                      <>
                        Found{" "}
                        <span className="font-semibold">
                          {filteredProxies.length}
                        </span>{" "}
                        proxy{filteredProxies.length !== 1 ? "ies" : ""}{" "}
                        matching "{proxySearchTerm}"
                      </>
                    ) : (
                      <>No proxies found matching "{proxySearchTerm}"</>
                    )}
                  </p>
                </div>
              )}

              {/* FIXED: Always show proxy list */}
              <div className="max-h-60 overflow-y-auto space-y-2 bg-white/50 rounded-xl p-4">
                {displayProxies.length > 0 ? (
                  <>
                    {displayProxies.map((proxy) => (
                      <div
                        key={proxy.id}
                        onClick={() => handleProxySelect(proxy)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {proxy.fullName}
                            </h4>
                            <p className="text-sm text-purple-600 font-medium">
                              {proxy.role}
                            </p>
                            {proxy.email && (
                              <p className="text-sm text-gray-600 flex items-center mt-1">
                                <Mail size={14} className="mr-1" />
                                {proxy.email}
                              </p>
                            )}
                            {proxy.phone && (
                              <p className="text-sm text-gray-600 flex items-center mt-1">
                                <Phone size={14} className="mr-1" />
                                {proxy.phone}
                              </p>
                            )}
                            {proxy.contact && (
                              <p className="text-sm text-gray-600 mt-1">
                                {proxy.contact}
                              </p>
                            )}
                          </div>
                          <button className="text-purple-600 hover:text-purple-700">
                            <Check size={20} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Load More Button */}
                    {hasMoreProxies && (
                      <div className="text-center py-4">
                        <button
                          type="button"
                          onClick={handleLoadMore}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          Load More Proxies ({proxies.length - displayLimit}{" "}
                          remaining)
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p>
                      {hasSearched
                        ? "No proxies found matching your search."
                        : "No proxies available."}
                    </p>
                    <button
                      type="button"
                      onClick={handleCreateNewProxy}
                      className="mt-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Create a new proxy instead
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selected Proxy Display */}
          {selectedProxy && (
            <div className="bg-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-purple-900">
                    Selected Proxy: {selectedProxy.fullName}
                  </h4>
                  <p className="text-sm text-purple-700 font-medium">
                    {selectedProxy.role}
                  </p>
                  {selectedProxy.email && (
                    <p className="text-sm text-purple-600 flex items-center mt-1">
                      <Mail size={14} className="mr-1" />
                      {selectedProxy.email}
                    </p>
                  )}
                  {selectedProxy.phone && (
                    <p className="text-sm text-purple-600 flex items-center mt-1">
                      <Phone size={14} className="mr-1" />
                      {selectedProxy.phone}
                    </p>
                  )}
                  {selectedProxy.contact && (
                    <p className="text-sm text-purple-600 mt-1">
                      {selectedProxy.contact}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleNoProxy}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Create New Proxy Form */}
          {showNewProxyForm && (
            <div className="bg-white/70 p-6 rounded-xl border border-purple-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-purple-900">
                    Create New Proxy
                  </h4>
                  <button
                    type="button"
                    onClick={handleNoProxy}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Proxy Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Proxy Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={newProxyData.fullName}
                    onChange={handleNewProxyChange}
                    required={showNewProxyForm}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
                    placeholder="Enter proxy's full name"
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Role/Position *
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={newProxyData.role}
                    onChange={handleNewProxyChange}
                    required={showNewProxyForm}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
                    placeholder="e.g., Priest, Community Leader, Teacher"
                  />
                </div>

                {/* Contact Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="email"
                        name="email"
                        value={newProxyData.email}
                        onChange={handleNewProxyChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
                        placeholder="proxy@example.com"
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
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="tel"
                        name="phone"
                        value={newProxyData.phone}
                        onChange={handleNewProxyChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
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
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <textarea
                      name="contact"
                      value={newProxyData.contact}
                      onChange={handleNewProxyChange}
                      rows={2}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70 resize-none"
                      placeholder="Address, alternative contact methods, etc."
                    />
                  </div>
                </div>

                {/* Description */}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70 resize-none"
                    placeholder="Additional information about the proxy"
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
            Select a priest, community leader, or other trusted intermediary if
            the sponsor prefers to work through someone. This helps with local
            coordination and communication.
          </p>
        </div>
      </div>
    </div>
  );
};
