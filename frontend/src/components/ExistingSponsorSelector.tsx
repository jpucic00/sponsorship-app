import React from "react";
import { Search, Users, Check } from "lucide-react";

interface Sponsor {
  id: number;
  fullName: string;
  contact: string;
  proxy?: {
    fullName: string;
    role: string;
  };
}

interface ExistingSponsorSelectorProps {
  sponsors: Sponsor[];
  sponsorSearchTerm: string;
  setSponsorSearchTerm: (term: string) => void;
  selectedSponsor: Sponsor | null;
  onSponsorSelect: (sponsor: Sponsor) => void;
}

export const ExistingSponsorSelector: React.FC<
  ExistingSponsorSelectorProps
> = ({
  sponsors,
  sponsorSearchTerm,
  setSponsorSearchTerm,
  selectedSponsor,
  onSponsorSelect,
}) => {
  const filteredSponsors = sponsors.filter(
    (sponsor) =>
      sponsor.fullName
        .toLowerCase()
        .includes(sponsorSearchTerm.toLowerCase()) ||
      sponsor.contact.toLowerCase().includes(sponsorSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search sponsors by name or contact..."
          value={sponsorSearchTerm}
          onChange={(e) => setSponsorSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 text-lg"
        />
      </div>

      <div className="max-h-80 overflow-y-auto space-y-3">
        {filteredSponsors.length > 0 ? (
          filteredSponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              onClick={() => onSponsorSelect(sponsor)}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                selectedSponsor?.id === sponsor.id
                  ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    {sponsor.fullName}
                  </h4>
                  <p className="text-gray-600 mt-1">{sponsor.contact}</p>
                  {sponsor.proxy && (
                    <p className="text-sm text-purple-600 mt-2 bg-purple-50 px-2 py-1 rounded-full inline-block">
                      Via: {sponsor.proxy.fullName} ({sponsor.proxy.role})
                    </p>
                  )}
                </div>
                {selectedSponsor?.id === sponsor.id && (
                  <Check className="text-blue-600" size={24} />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Users size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No sponsors found</p>
            <p className="text-sm">
              Try adjusting your search or create a new sponsor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
