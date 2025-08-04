import React from "react";
import { Eye, Heart, Camera } from "lucide-react";
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
  lastProfileUpdate: string;
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

interface ChildrenTableDesktopProps {
  children: Child[];
  onViewChild: (childId: number) => void;
  calculateAge: (dateOfBirth: string) => number;
}

export const ChildrenTableDesktop: React.FC<ChildrenTableDesktopProps> = ({
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
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Child
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Age & Gender
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              School & Class
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Sponsorship Details
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Registration Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {children.map((child, index) => (
            <tr
              key={child.id}
              className={`hover:bg-blue-50/50 transition-colors duration-200 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
              }`}
            >
              {/* Child Name & Image */}
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {hasImage(child) ? (
                      <img
                        src={getImageSrc(child)}
                        alt={`${child.firstName} ${child.lastName}`}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-md"
                        onError={(e) => {
                          // Fallback to initials on error
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback =
                            target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                        hasImage(child) ? "hidden" : "flex"
                      }`}
                    >
                      {child.firstName[0]}
                      {child.lastName[0]}
                    </div>
                    {hasImage(child) && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <Camera size={8} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      {child.firstName} {child.lastName}
                    </div>
                    <div className="text-xs text-gray-500">ID: #{child.id}</div>
                  </div>
                </div>
              </td>

              {/* Age & Gender */}
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {calculateAge(child.dateOfBirth)} years old
                </div>
                <div className="text-xs text-gray-500">
                  {child.gender} • {child.class}
                </div>
              </td>

              {/* School & Class */}
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {child.school.name}
                </div>
                <div className="text-xs text-gray-500">
                  {child.school.location}
                </div>
              </td>

              {/* Sponsorship Status */}
              <td className="px-6 py-4">
                {child.isSponsored ? (
                  <div className="space-y-2">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      ✅ Sponsored ({child.sponsorships.length})
                    </span>
                    {child.sponsorships.slice(0, 2).map((sponsorship, idx) => (
                      <div key={idx} className="text-xs text-gray-600">
                        <div className="font-medium">
                          {sponsorship.sponsor.fullName}
                        </div>
                        {sponsorship.sponsor.proxy && (
                          <div className="text-purple-600">
                            via {sponsorship.sponsor.proxy.fullName}
                          </div>
                        )}
                      </div>
                    ))}
                    {child.sponsorships.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{child.sponsorships.length - 2} more
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    ⏳ Needs Sponsor
                  </span>
                )}
              </td>

              {/* Registration Date */}
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDateTime(child.dateEnteredRegister)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {
                      formatDateTimeWithRelative(child.dateEnteredRegister)
                        .relative
                    }
                  </div>
                </div>
              </td>

              {/* Actions - Simple Buttons */}
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewChild(child.id)}
                    className="flex items-center cursor-pointer space-x-1
                               px-3 py-1.5 text-xs
                               bg-blue-100 hover:bg-blue-200
                               text-blue-700 hover:text-blue-800
                               font-medium
                               rounded-md
                               transition-colors duration-200"
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
