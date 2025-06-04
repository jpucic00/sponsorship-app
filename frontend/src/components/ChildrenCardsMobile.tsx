import React from "react";
import { GraduationCap, Calendar, Heart, Camera } from "lucide-react";
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
  // Image fields
  photoBase64?: string;
  photoMimeType?: string;
  photoDataUrl?: string;
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
  // Function to get image source for a child
  const getImageSrc = (child: Child) => {
    if (child.photoDataUrl) {
      return child.photoDataUrl;
    }
    if (child.photoBase64 && child.photoMimeType) {
      return `data:${child.photoMimeType};base64,${child.photoBase64}`;
    }
    // Fallback to API endpoint
    return `/api/children/${child.id}/image`;
  };

  const hasImage = (child: Child) => {
    return !!(child.photoDataUrl || child.photoBase64 || child.photoMimeType);
  };

  return (
    <div className="lg:hidden space-y-4 p-6">
      {children.map((child) => (
        <div
          key={child.id}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {hasImage(child) ? (
                  <img
                    src={getImageSrc(child)}
                    alt={`${child.firstName} ${child.lastName}`}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md"
                    onError={(e) => {
                      // Fallback to initials on error
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                    hasImage(child) ? "hidden" : "flex"
                  }`}
                >
                  {child.firstName[0]}
                  {child.lastName[0]}
                </div>
                {hasImage(child) && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Camera size={10} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {child.firstName} {child.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  {calculateAge(child.dateOfBirth)} years • {child.gender} •{" "}
                  {child.class}
                </p>
                <p className="text-xs text-gray-500">ID: #{child.id}</p>
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

          {/* Actions - Removed Edit Button */}
          <div className="flex space-x-2">
            <button
              onClick={() => onViewChild(child.id)}
              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center"
            >
              View Details
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
