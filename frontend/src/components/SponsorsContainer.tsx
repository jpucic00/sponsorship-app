import React, { useState } from "react";
import { SponsorsList } from "./SponsorsList";
import { SponsorDetails } from "./SponsorDetails";

export const SponsorsContainer: React.FC = () => {
  const [selectedSponsorId, setSelectedSponsorId] = useState<number | null>(
    null
  );

  const handleViewSponsor = (sponsorId: number) => {
    setSelectedSponsorId(sponsorId);
  };

  const handleBackToList = () => {
    setSelectedSponsorId(null);
  };

  // Show sponsor details if a sponsor is selected
  if (selectedSponsorId) {
    return (
      <SponsorDetails sponsorId={selectedSponsorId} onBack={handleBackToList} />
    );
  }

  // Show sponsors list by default
  return <SponsorsList onViewSponsor={handleViewSponsor} />;
};
