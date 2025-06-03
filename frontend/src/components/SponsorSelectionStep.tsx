import React from "react";
import { Heart, Search, Plus, Users, Check } from "lucide-react";
import { ExistingSponsorSelector } from "./ExistingSponsorSelector";
import { NewSponsorForm } from "./NewSponsorForm";

interface Sponsor {
  id: number;
  fullName: string;
  contact: string;
  proxy?: {
    fullName: string;
    role: string;
  };
}

interface Proxy {
  id: number;
  fullName: string;
  role: string;
  contact: string;
}

interface SponsorSelectionStepProps {
  sponsors: Sponsor[];
  proxies: Proxy[];
  sponsorSearchTerm: string;
  setSponsorSearchTerm: (term: string) => void;
  showNewSponsorForm: boolean;
  setShowNewSponsorForm: (show: boolean) => void;
  selectedSponsor: Sponsor | null;
  setSelectedSponsor: (sponsor: Sponsor | null) => void;
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
  onSponsorSelect: (sponsor: Sponsor) => void;
  onCreateNewSponsor: () => void;
}

export const SponsorSelectionStep: React.FC<SponsorSelectionStepProps> = ({
  sponsors,
  proxies,
  sponsorSearchTerm,
  setSponsorSearchTerm,
  showNewSponsorForm,
  setShowNewSponsorForm,
  selectedSponsor,
  setSelectedSponsor,
  newSponsorData,
  handleNewSponsorChange,
  showNewProxyForm,
  setShowNewProxyForm,
  selectedProxy,
  setSelectedProxy,
  newProxyData,
  handleNewProxyChange,
  proxySearchTerm,
  setProxySearchTerm,
  onSponsorSelect,
  onCreateNewSponsor,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3 mb-6">
        <Heart className="text-red-500" size={28} />
        <h2 className="text-3xl font-bold text-gray-900">Sponsor Assignment</h2>
      </div>

      {/* Sponsor Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          type="button"
          onClick={() => {
            setShowNewSponsorForm(false);
            setSelectedSponsor(null);
          }}
          className={`p-8 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
            !showNewSponsorForm
              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-200"
              : "border-gray-300 hover:border-gray-400 bg-white"
          }`}
        >
          <Search className="mx-auto mb-4 text-blue-600" size={40} />
          <h3 className="font-bold text-gray-900 mb-2 text-lg">
            Find Existing Sponsor
          </h3>
          <p className="text-sm text-gray-600">
            Search and select from registered sponsors
          </p>
        </button>

        <button
          type="button"
          onClick={onCreateNewSponsor}
          className={`p-8 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
            showNewSponsorForm
              ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg shadow-green-200"
              : "border-gray-300 hover:border-gray-400 bg-white"
          }`}
        >
          <Plus className="mx-auto mb-4 text-green-600" size={40} />
          <h3 className="font-bold text-gray-900 mb-2 text-lg">
            Create New Sponsor
          </h3>
          <p className="text-sm text-gray-600">
            Register a new sponsor for this child
          </p>
        </button>
      </div>

      {/* Existing Sponsor Search */}
      {!showNewSponsorForm && (
        <ExistingSponsorSelector
          sponsors={sponsors}
          sponsorSearchTerm={sponsorSearchTerm}
          setSponsorSearchTerm={setSponsorSearchTerm}
          selectedSponsor={selectedSponsor}
          onSponsorSelect={onSponsorSelect}
        />
      )}

      {/* New Sponsor Form */}
      {showNewSponsorForm && (
        <NewSponsorForm
          newSponsorData={newSponsorData}
          handleNewSponsorChange={handleNewSponsorChange}
          proxies={proxies}
          showNewProxyForm={showNewProxyForm}
          setShowNewProxyForm={setShowNewProxyForm}
          selectedProxy={selectedProxy}
          setSelectedProxy={setSelectedProxy}
          newProxyData={newProxyData}
          handleNewProxyChange={handleNewProxyChange}
          proxySearchTerm={proxySearchTerm}
          setProxySearchTerm={setProxySearchTerm}
        />
      )}
    </div>
  );
};
