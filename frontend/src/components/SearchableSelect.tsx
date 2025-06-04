import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown } from "lucide-react";

interface SearchableSelectProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string; sublabel?: string }>;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder: string;
  emptyMessage: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  icon,
  value,
  onValueChange,
  options,
  searchTerm,
  onSearchChange,
  placeholder,
  emptyMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        const rect = buttonRef.current!.getBoundingClientRect();
        setPosition({
          top: rect.bottom,
          left: rect.left,
          width: rect.width,
        });
      };

      updatePosition();

      const handleUpdate = () => updatePosition();
      window.addEventListener("scroll", handleUpdate, { passive: true });
      window.addEventListener("resize", handleUpdate, { passive: true });

      return () => {
        window.removeEventListener("scroll", handleUpdate);
        window.removeEventListener("resize", handleUpdate);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        buttonRef.current &&
        dropdownRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.sublabel &&
        option.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
    onSearchChange("");
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {icon}
        {label}
      </label>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm text-left flex items-center justify-between hover:bg-gray-50"
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : "All"}
          </span>
          <ChevronDown
            size={14}
            className={`text-gray-400 flex-shrink-0 ml-2 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>

        {isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              className="fixed bg-white border border-gray-300 rounded-lg shadow-2xl max-h-80 overflow-hidden z-[10000]"
              style={{
                top: `${position.top + 4}px`,
                left: `${position.left}px`,
                width: `${position.width}px`,
                minWidth: "200px",
              }}
            >
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      className="w-full px-3 py-3 text-left hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none"
                      onClick={() => handleSelect(option.value)}
                    >
                      <div className="font-medium text-gray-900">
                        {option.label}
                      </div>
                      {option.sublabel && (
                        <div className="text-gray-500 text-xs mt-1">
                          {option.sublabel}
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-sm text-gray-500 italic text-center">
                    {emptyMessage}
                  </div>
                )}
              </div>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
};
