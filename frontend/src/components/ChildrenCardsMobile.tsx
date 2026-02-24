import React from "react";
import {
  GraduationCap,
  Heart,
  Camera,
  Eye,
  Archive,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { formatDateTimeWithRelative } from "../utils/dateUtils";

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

interface ChildrenCardsMobileProps {
  children: Child[];
  onViewChild: (childId: number) => void;
  calculateAge: (dateOfBirth: string) => number;
  isArchiveView?: boolean;
  onArchive?: (childId: number, childName: string) => void;
  onRestore?: (childId: number, childName: string) => void;
  onPermanentDelete?: (childId: number, childName: string) => void;
}

export const ChildrenCardsMobile: React.FC<ChildrenCardsMobileProps> = ({
  children,
  onViewChild,
  calculateAge,
  isArchiveView = false,
  onArchive,
  onRestore,
  onPermanentDelete,
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
    <div className="lg:hidden space-y-3 p-3 sm:p-4">
      {children.map((child) => (
        <div
          key={child.id}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
        >
          {/* Header row: avatar + name + badge */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-shrink-0">
              {hasImage(child) ? (
                <img
                  src={getImageSrc(child)}
                  alt={`${child.firstName} ${child.lastName}`}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-base ${
                  hasImage(child) ? "hidden" : "flex"
                }`}
              >
                {child.firstName[0]}{child.lastName[0]}
              </div>
              {hasImage(child) && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Camera size={8} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate">
                {child.firstName} {child.lastName}
              </h3>
              <p className="text-xs text-gray-500">
                {calculateAge(child.dateOfBirth)} yrs · {child.gender} · Class {child.class}
              </p>
            </div>

            <span
              className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                child.isSponsored
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {child.isSponsored ? "Sponsored" : "Needs Sponsor"}
            </span>
          </div>

          {/* Meta row: school + registered */}
          <div className="space-y-1 mb-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <GraduationCap size={13} className="flex-shrink-0 text-gray-400" />
              <span className="truncate">{child.school.name}, {child.school.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Registered</span>
              <span>{formatDateTimeWithRelative(child.dateEnteredRegister).relative}</span>
            </div>
            {child.isSponsored && child.sponsorships.length > 0 && (
              <div className="flex items-center gap-1.5 text-green-600">
                <Heart size={13} className="flex-shrink-0" />
                <span className="truncate">
                  {child.sponsorships[0].sponsor.fullName}
                  {child.sponsorships.length > 1 && ` +${child.sponsorships.length - 1}`}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => onViewChild(child.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
            >
              <Eye size={13} />
              View
            </button>

            {!isArchiveView && !child.isSponsored && (
              <button
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
              >
                <Heart size={13} />
                Find Sponsor
              </button>
            )}

            {!isArchiveView && onArchive && (
              <button
                onClick={() => onArchive(child.id, `${child.firstName} ${child.lastName}`)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors"
                title="Archive"
              >
                <Archive size={13} />
                Archive
              </button>
            )}

            {isArchiveView && onRestore && (
              <button
                onClick={() => onRestore(child.id, `${child.firstName} ${child.lastName}`)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
              >
                <RotateCcw size={13} />
                Restore
              </button>
            )}

            {isArchiveView && onPermanentDelete && (
              <button
                onClick={() => onPermanentDelete(child.id, `${child.firstName} ${child.lastName}`)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
              >
                <Trash2 size={13} />
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
