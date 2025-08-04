import React from "react";
import { UserPlus, Mail, Phone, MessageSquare } from "lucide-react";
import { ProxySelector } from "./ProxySelector";

interface Proxy {
  id: number;
  fullName: string;
  role: string;
  contact: string;
  email?: string;
  phone?: string;
}

interface NewSponsorFormProps {
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
    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <UserPlus className="text-green-600" size={24} />
          <h3 className="text-lg font-bold text-gray-900">
            New Sponsor Information
          </h3>
        </div>

        {/* Sponsor Full Name */}
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
            placeholder="Enter sponsor's full name"
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
                value={newSponsorData.email}
                onChange={handleNewSponsorChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70"
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
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="tel"
                name="phone"
                value={newSponsorData.phone}
                onChange={handleNewSponsorChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Note */}
        <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> At least one contact method (email or phone)
            is required. You can provide both for better communication options.
          </p>
        </div>

        {/* Additional Contact Information */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Additional Contact Information
            <span className="text-gray-500 font-normal ml-1">(Optional)</span>
          </label>
          <div className="relative">
            <MessageSquare
              className="absolute left-3 top-3 text-gray-400"
              size={18}
            />
            <textarea
              name="contact"
              value={newSponsorData.contact}
              onChange={handleNewSponsorChange}
              rows={3}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 resize-none"
              placeholder="Address, alternative contact methods, preferred contact times, etc."
            />
          </div>
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
