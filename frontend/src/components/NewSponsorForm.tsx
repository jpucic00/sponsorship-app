import React from "react";
import { ProxySelector } from "./ProxySelector";

interface Proxy {
  id: number;
  fullName: string;
  role: string;
  contact: string;
}

interface NewSponsorFormProps {
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
}

export const NewSponsorForm: React.FC<NewSponsorFormProps> = ({
  newSponsorData,
  handleNewSponsorChange,
  proxies,
  showNewProxyForm,
  setShowNewProxyForm,
  selectedProxy,
  setSelectedProxy,
  newProxyData,
  handleNewProxyChange,
  proxySearchTerm,
  setProxySearchTerm,
}) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
        New Sponsor Information
      </h3>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Sponsor Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={newSponsorData.fullName}
            onChange={handleNewSponsorChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70"
            placeholder="Enter sponsor full name"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Contact Information *
          </label>
          <textarea
            name="contact"
            value={newSponsorData.contact}
            onChange={handleNewSponsorChange}
            required
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 resize-none"
            placeholder="Phone number, email, address, or any other contact information"
          />
        </div>

        {/* Proxy/Middleman Selection for New Sponsor */}
        <ProxySelector
          proxies={proxies}
          showNewProxyForm={showNewProxyForm}
          setShowNewProxyForm={setShowNewProxyForm}
          selectedProxy={selectedProxy}
          setSelectedProxy={setSelectedProxy}
          newProxyData={newProxyData}
          handleNewProxyChange={handleNewProxyChange}
          proxySearchTerm={proxySearchTerm}
          setProxySearchTerm={setProxySearchTerm}
          newSponsorData={newSponsorData}
          handleNewSponsorChange={handleNewSponsorChange}
        />
      </div>
    </div>
  );
};
