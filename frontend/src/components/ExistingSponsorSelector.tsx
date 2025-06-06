import React, { useState } from "react";
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
  selectedSponsors: Sponsor[];
  onSponsorSelect: (sponsor: Sponsor) => void;
}

export const ExistingSponsorSelector: React.FC<
  ExistingSponsorSelectorProps
> = ({
  sponsors,
  sponsorSearchTerm,
  setSponsorSearchTerm,
  selectedSponsors,
  onSponsorSelect,
}) => {
  // State for actual search term that triggers filtering
  const [actualSearchTerm, setActualSearchTerm] = useState("");

  // Ensure sponsors is an array - handle both paginated and non-paginated responses
  const sponsorsArray = Array.isArray(sponsors) ? sponsors : [];

  // Use actualSearchTerm for filtering instead of sponsorSearchTerm
  const filteredSponsors = sponsorsArray.filter(
    (sponsor) =>
      sponsor.fullName.toLowerCase().includes(actualSearchTerm.toLowerCase()) ||
      sponsor.contact.toLowerCase().includes(actualSearchTerm.toLowerCase())
  );

  // Handle search execution
  const handleSearch = () => {
    setActualSearchTerm(sponsorSearchTerm);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSponsorSearchTerm("");
    setActualSearchTerm("");
  };

  return (
    <div className="space-y-6">
      {/* Search Bar with Manual Trigger */}
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
          onKeyPress={handleKeyPress}
          className="w-full pl-12 pr-24 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 text-lg"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
          {actualSearchTerm && (
            <button
              onClick={handleClearSearch}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            Search
          </button>
        </div>
      </div>

      {/* Search Results Info */}
      {actualSearchTerm && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            {filteredSponsors.length > 0 ? (
              <>
                Found{" "}
                <span className="font-semibold">{filteredSponsors.length}</span>{" "}
                sponsor
                {filteredSponsors.length !== 1 ? "s" : ""} matching "
                {actualSearchTerm}"
              </>
            ) : (
              <>No sponsors found matching "{actualSearchTerm}"</>
            )}
          </p>
        </div>
      )}

      {/* Instructions */}
      {!actualSearchTerm && filteredSponsors.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-2">
            💡 <strong>Tip:</strong> Click on sponsors to select/deselect them.
            You can choose multiple sponsors for this child.
          </p>
          {sponsorsArray.length > 10 && (
            <p className="text-sm text-gray-500">
              Use the search above to find specific sponsors from{" "}
              {sponsorsArray.length} total sponsors.
            </p>
          )}
        </div>
      )}

      {/* Sponsors List */}
      <div className="max-h-80 overflow-y-auto space-y-3">
        {filteredSponsors.length > 0 ? (
          filteredSponsors.map((sponsor) => {
            const isSelected = selectedSponsors.some(
              (s) => s.id === sponsor.id
            );
            return (
              <div
                key={sponsor.id}
                onClick={() => onSponsorSelect(sponsor)}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                  isSelected
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
                  {isSelected && (
                    <div className="flex items-center space-x-2">
                      <Check className="text-blue-600" size={24} />
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : actualSearchTerm ? (
          // Show "no results" only when there's an active search
          <div className="text-center py-12 text-gray-500">
            <Users size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No sponsors found</p>
            <p className="text-sm">
              Try different search terms or{" "}
              <button
                onClick={handleClearSearch}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                clear the search
              </button>{" "}
              to see all sponsors.
            </p>
          </div>
        ) : (
          // Show all sponsors when no search is active
          <div className="text-center py-12 text-gray-500">
            <Users size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">
              {sponsorsArray.length === 0
                ? "No sponsors available"
                : "Use search to find sponsors"}
            </p>
            <p className="text-sm">
              {sponsorsArray.length === 0
                ? "Create a new sponsor or add sponsors to the system first."
                : `Search through ${sponsorsArray.length} available sponsors above.`}
            </p>
          </div>
        )}
      </div>

      {/* Selected Sponsors Summary */}
      {selectedSponsors.length > 0 && (
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <p className="text-sm font-medium text-green-700 mb-2">
            ✅ Selected Sponsors ({selectedSponsors.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSponsors.map((sponsor) => (
              <span
                key={sponsor.id}
                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
              >
                {sponsor.fullName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
