// File: src/components/ChildrenContainer.tsx
import React, { useState } from "react";
import { ChildrenList } from "./ChildrenList";
import { ChildDetails } from "./ChildDetails";

export const ChildrenContainer: React.FC = () => {
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const handleViewChild = (childId: number) => {
    setSelectedChildId(childId);
  };

  const handleBackToList = () => {
    setSelectedChildId(null);
  };

  // Show child details if a child is selected
  if (selectedChildId) {
    return <ChildDetails childId={selectedChildId} onBack={handleBackToList} />;
  }

  // Show children list by default
  return <ChildrenList onViewChild={handleViewChild} />;
};
