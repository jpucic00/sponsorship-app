import React from "react";
import { Heart, Search, Plus, Check, X } from "lucide-react";
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
  selectedSponsors: Sponsor[];
  setSelectedSponsors: (sponsors: Sponsor[]) => void;
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
  selectedSponsors,
  setSelectedSponsors,
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
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Sponsor Assignment
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            You can select multiple sponsors for this child
          </p>
        </div>
      </div>

      {/* Sponsor Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          type="button"
          onClick={() => {
            setShowNewSponsorForm(false);
            setSelectedSponsors([]);
          }}
          className={`p-8 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
            !showNewSponsorForm
              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-200"
              : "border-gray-300 hover:border-gray-400 bg-white"
          }`}
        >
          <Search className="mx-auto mb-4 text-blue-600" size={40} />
          <h3 className="font-bold text-gray-900 mb-2 text-lg">
            Find Existing Sponsors
          </h3>
          <p className="text-sm text-gray-600">
            Search and select from registered sponsors
          </p>
          {selectedSponsors.length > 0 && !showNewSponsorForm && (
            <div className="mt-3">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                {selectedSponsors.length} selected
              </span>
            </div>
          )}
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
        <div className="space-y-6">
          {selectedSponsors.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                Selected Sponsors ({selectedSponsors.length}):
              </h4>
              <div className="space-y-2">
                {selectedSponsors.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="flex items-center justify-between bg-white p-3 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-900">
                        {sponsor.fullName}
                      </span>
                      {sponsor.proxy && (
                        <div className="text-sm text-purple-600">
                          Via: {sponsor.proxy.fullName} ({sponsor.proxy.role})
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onSponsorSelect(sponsor)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remove sponsor"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ExistingSponsorSelector
            sponsors={sponsors}
            sponsorSearchTerm={sponsorSearchTerm}
            setSponsorSearchTerm={setSponsorSearchTerm}
            selectedSponsors={selectedSponsors}
            onSponsorSelect={onSponsorSelect}
          />
        </div>
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
