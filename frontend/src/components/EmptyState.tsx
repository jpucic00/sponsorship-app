import React from "react";
import { Plus, X } from "lucide-react";

interface EmptyStateProps {
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  hasActiveFilters,
  clearAllFilters,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
      <div className="text-8xl mb-6">👶</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        No children found
      </h3>
      <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
        {hasActiveFilters
          ? "Try adjusting your search terms to see more results."
          : "Get started by adding your first child to the system."}
      </p>

      <div className="flex justify-center space-x-4">
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200"
          >
            <X size={20} className="mr-2" />
            Clear Filters
          </button>
        )}

        <button
          onClick={() => (window.location.href = "/register-child")}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <Plus size={20} className="mr-2" />
          {hasActiveFilters ? "Add New Child" : "Add First Child"}
        </button>
      </div>
    </div>
  );
};
