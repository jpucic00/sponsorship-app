import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: () => void;
  onClear?: () => void;
  placeholder?: string;
  showClearButton?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  onSearch,
  onClear,
  placeholder = "Search...",
  showClearButton = true,
  size = "md",
  className = "",
  disabled = false,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !disabled) {
      onSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    if (onClear) {
      onClear();
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "h-10",
      input: "pl-10 pr-20 py-2 text-sm",
      icon: 18,
      button: "px-3 py-1 text-xs",
    },
    md: {
      container: "h-12",
      input: "pl-12 pr-24 py-3 text-base",
      icon: 20,
      button: "px-4 py-2 text-sm",
    },
    lg: {
      container: "h-16",
      input: "pl-12 pr-24 py-4 text-lg",
      icon: 24,
      button: "px-4 py-2 text-sm",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`relative ${config.container} ${className}`}>
      <Search
        className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 ${
          disabled ? "opacity-50" : ""
        }`}
        size={config.icon}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        className={`w-full ${config.input} border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
        {showClearButton && searchTerm && (
          <button
            onClick={handleClear}
            disabled={disabled}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors duration-200"
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
        <button
          onClick={onSearch}
          disabled={disabled}
          className={`${config.button} bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium`}
        >
          Search
        </button>
      </div>
    </div>
  );
};
