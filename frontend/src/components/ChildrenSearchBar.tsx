import React from "react";
import { Link } from "react-router-dom";
import { Search, Plus } from "lucide-react";

interface ChildrenSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: () => void; // New prop for triggering search
}

export const ChildrenSearchBar: React.FC<ChildrenSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  onSearch,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Search Bar */}
      <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by name or school..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 text-sm outline-none bg-transparent text-gray-900 placeholder-gray-400 min-w-0"
        />
        <button
          onClick={onSearch}
          aria-label="Search"
          className="flex-shrink-0 p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Search size={14} />
        </button>
      </div>

      {/* Add Button */}
      <Link
        to="/register-child"
        className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors shadow-sm flex-shrink-0"
      >
        <Plus size={16} />
        <span className="hidden sm:inline whitespace-nowrap">Add Child</span>
      </Link>
    </div>
  );
};
