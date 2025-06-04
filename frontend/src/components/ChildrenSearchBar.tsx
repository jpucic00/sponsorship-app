import React from "react";
import { Search, Plus } from "lucide-react";

interface ChildrenSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const ChildrenSearchBar: React.FC<ChildrenSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
      {/* Search Bar */}
      <div className="flex-1 relative max-w-2xl">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={24}
        />
        <input
          type="text"
          placeholder="Search by name or school..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 text-lg"
        />
      </div>

      {/* Add Button */}
      <button
        onClick={() => (window.location.href = "/register-child")}
        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        <Plus size={20} />
        <span>Add New Child</span>
      </button>
    </div>
  );
};
