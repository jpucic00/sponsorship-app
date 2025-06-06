import React, { useState } from "react";
import { Search, Plus, Users, Check } from "lucide-react";

interface Proxy {
  id: number;
  fullName: string;
  role: string;
  contact: string;
}

interface ProxySelectorProps {
  proxies: Proxy[];
  showNewProxyForm: boolean;
  setShowNewProxyForm: (show: boolean) => void;
  selectedProxy: Proxy | null;
  setSelectedProxy: (proxy: Proxy | null) => void;
  newProxyData: {
    fullName: string;
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
  newSponsorData,
  handleNewSponsorChange,
}) => {
  // State for actual search term that triggers filtering
  const [actualSearchTerm, setActualSearchTerm] = useState("");

  const filteredProxies = proxies.filter(
    (proxy) =>
      proxy.fullName.toLowerCase().includes(actualSearchTerm.toLowerCase()) ||
      proxy.role.toLowerCase().includes(actualSearchTerm.toLowerCase()) ||
      proxy.contact.toLowerCase().includes(actualSearchTerm.toLowerCase())
  );

  // Handle search execution
  const handleSearch = () => {
    setActualSearchTerm(proxySearchTerm);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setProxySearchTerm("");
    setActualSearchTerm("");
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
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-300 hover:border-gray-400 bg-white"
              }`}
            >
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
                setShowNewProxyForm(false);
                setSelectedProxy(null);
              }}
              className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                !showNewProxyForm && selectedProxy
                  ? "border-purple-500 bg-purple-50 shadow-md"
                  : "border-gray-300 hover:border-gray-400 bg-white"
              }`}
            >
              <Search className="mx-auto mb-2 text-purple-600" size={20} />
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
                <div className="text-xs text-gray-600 mt-1">Add new proxy</div>
              </div>
            </button>
          </div>

          {!showNewProxyForm &&
            !selectedProxy &&
            newSponsorData.proxyId === "" && (
              <div className="space-y-4">
                {/* Search Bar with Manual Trigger */}
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
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    {actualSearchTerm && (
                      <button
                        onClick={handleClearSearch}
                        className="px-3 py-1 text-gray-500 hover:text-gray-700 text-sm font-medium"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Search Results Info */}
                {actualSearchTerm && (
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700">
                      {filteredProxies.length > 0 ? (
                        <>
                          Found{" "}
                          <span className="font-semibold">
                            {filteredProxies.length}
                          </span>{" "}
                          prox
                          {filteredProxies.length !== 1 ? "ies" : "y"} matching
                          "{actualSearchTerm}"
                        </>
                      ) : (
                        <>No proxies found matching "{actualSearchTerm}"</>
                      )}
                    </p>
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredProxies.length > 0 ? (
                    filteredProxies.map((proxy) => (
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
                          <p className="text-sm text-gray-600 mt-1">
                            {proxy.contact}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : actualSearchTerm ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No proxies found</p>
                      <p className="text-sm">
                        Try different search terms or{" "}
                        <button
                          onClick={handleClearSearch}
                          className="text-purple-600 hover:text-purple-800 underline"
                        >
                          clear the search
                        </button>{" "}
                        to see all proxies.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users size={48} className="mx-auto mb-3 opacity-50" />
                      <p>Use search to find proxies</p>
                      <p className="text-sm">
                        Search through {proxies.length} available proxies above.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                  onClick={handleNoProxy}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <Check size={24} />
                </button>
              </div>
            </div>
          )}

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
                      <option value="Community Leader">Community Leader</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Social Worker">Social Worker</option>
                      <option value="Village Elder">Village Elder</option>
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
            Select a priest, community leader, or other trusted intermediary if
            the sponsor prefers to work through someone. This helps with local
            coordination and communication.
          </p>
        </div>
      </div>
    </div>
  );
};
