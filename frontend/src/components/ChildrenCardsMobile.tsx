import React from "react";
import { GraduationCap, Calendar, Heart } from "lucide-react";
import { formatDateTime, formatDateTimeWithRelative } from "../utils/dateUtils";

interface Child {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  class: string;
  isSponsored: boolean;
  dateEnteredRegister: string;
  school: {
    id: number;
    name: string;
    location: string;
  };
  sponsorships: Array<{
    sponsor: {
      id: number;
      fullName: string;
      proxy?: {
        id: number;
        fullName: string;
        role: string;
      };
    };
  }>;
}

interface ChildrenCardsMobileProps {
  children: Child[];
  onViewChild: (childId: number) => void;
  calculateAge: (dateOfBirth: string) => number;
}

export const ChildrenCardsMobile: React.FC<ChildrenCardsMobileProps> = ({
  children,
  onViewChild,
  calculateAge,
}) => {
  return (
    <div className="lg:hidden space-y-4 p-6">
      {children.map((child) => (
        <div
          key={child.id}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                {child.firstName[0]}
                {child.lastName[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {child.firstName} {child.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  {calculateAge(child.dateOfBirth)} years • {child.gender} •{" "}
                  {child.class}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                child.isSponsored
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {child.isSponsored ? "✅ Sponsored" : "⏳ Needs Sponsor"}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <GraduationCap size={16} />
              <span>
                {child.school.name}, {child.school.location}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar size={16} />
              <div>
                <span>Registered: </span>
                <span className="font-medium">
                  {formatDateTime(child.dateEnteredRegister)}
                </span>
                <div className="text-xs text-gray-500">
                  {
                    formatDateTimeWithRelative(child.dateEnteredRegister)
                      .relative
                  }
                </div>
              </div>
            </div>
            {child.isSponsored && child.sponsorships.length > 0 && (
              <div className="space-y-1">
                {child.sponsorships.slice(0, 2).map((sponsorship, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 text-sm text-green-600"
                  >
                    <Heart size={16} />
                    <span>
                      Sponsored by {sponsorship.sponsor.fullName}
                      {sponsorship.sponsor.proxy && (
                        <span className="text-purple-600">
                          {" "}
                          via {sponsorship.sponsor.proxy.fullName}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
                {child.sponsorships.length > 2 && (
                  <div className="text-xs text-gray-500 ml-6">
                    +{child.sponsorships.length - 2} more sponsors
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onViewChild(child.id)}
              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center"
            >
              View Details
            </button>
            <button
              onClick={() => (window.location.href = `/edit-child/${child.id}`)}
              className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              Edit
            </button>
            {!child.isSponsored && (
              <button className="flex-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
                Find Sponsor
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
