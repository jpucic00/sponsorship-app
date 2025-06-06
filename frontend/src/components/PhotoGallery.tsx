import React, { useState, useEffect } from "react";
import {
  Camera,
  Plus,
  X,
  Trash2,
  Eye,
  Edit,
  Check,
  Clock,
  Star,
  AlertTriangle,
} from "lucide-react";
import { formatDateTime, formatDateTimeWithRelative } from "../utils/dateUtils";

interface Photo {
  id: number;
  childId: number;
  mimeType: string;
  fileName?: string;
  fileSize?: number;
  description?: string;
  uploadedAt: string;
  isProfile: boolean;
  dataUrl?: string;
}

interface PhotoGalleryProps {
  childId: number;
  childName: string;
  onProfilePhotoChange?: () => void;
  onAddPhotoClick?: () => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  childId,
  childName,
  onProfilePhotoChange,
  onAddPhotoClick,
}) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [editingDescription, setEditingDescription] = useState<number | null>(
    null
  );
  const [tempDescription, setTempDescription] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );

  useEffect(() => {
    fetchPhotos();
  }, [childId]);

  const fetchPhotos = async (includeBase64 = true) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/child-photos/child/${childId}?includeBase64=${includeBase64}`
      );
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      } else {
        console.error("Failed to fetch photos");
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      const response = await fetch(`/api/child-photos/${photoId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchPhotos();
        setShowDeleteConfirm(null);
        onProfilePhotoChange?.();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete photo");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete photo");
    }
  };

  const handleUpdateDescription = async (
    photoId: number,
    description: string
  ) => {
    try {
      const response = await fetch(`/api/child-photos/${photoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (response.ok) {
        await fetchPhotos();
        setEditingDescription(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update description");
      }
    } catch (error) {
      console.error("Error updating description:", error);
      alert("Failed to update description");
    }
  };

  const getPhotoSrc = (photo: Photo) => {
    if (photo.dataUrl) {
      return photo.dataUrl;
    }
    return `/api/child-photos/${photo.id}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${Math.round(kb)} KB`;
    }
    return `${Math.round((kb / 1024) * 10) / 10} MB`;
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Camera className="text-purple-600" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Photo Gallery</h2>
            <p className="text-gray-600 text-sm">
              {photos.length} photo{photos.length !== 1 ? "s" : ""} • Latest
              photo is profile picture
            </p>
          </div>
        </div>
        <button
          onClick={() => onAddPhotoClick?.()}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Photo</span>
        </button>
      </div>

      {/* Photos Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`relative group bg-white rounded-2xl border-2 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${
                photo.isProfile
                  ? "border-purple-500 ring-2 ring-purple-200"
                  : "border-gray-200"
              }`}
            >
              {/* Profile Badge */}
              {photo.isProfile && (
                <div className="absolute top-3 left-3 z-10 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                  <Star size={12} />
                  <span>Profile</span>
                </div>
              )}

              {/* Image */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={getPhotoSrc(photo)}
                  alt={photo.fileName || `Photo ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTMwIDEwMEg3MEwxMDAgNzBaIiBmaWxsPSIjOUI5QkExIi8+CjxjaXJjbGUgY3g9IjgwIiBjeT0iNjAiIHI9IjEwIiBmaWxsPSIjOUI5QkExIi8+Cjwvc3ZnPgo=";
                  }}
                />
              </div>

              {/* Action Overlay - Only show when NOT editing description */}
              {editingDescription !== photo.id && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setSelectedPhoto(photo)}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                    title="View full size"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingDescription(photo.id);
                      setTempDescription(photo.description || "");
                    }}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                    title="Edit description"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(photo.id)}
                    className="p-2 bg-red-500/80 backdrop-blur-sm rounded-full text-white hover:bg-red-600/80 transition-colors"
                    title="Delete photo"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}

              {/* Photo Info */}
              <div className="p-4">
                {/* Description */}
                {editingDescription === photo.id ? (
                  <div
                    className="space-y-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <textarea
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      placeholder="Add a description..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                      rows={2}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateDescription(photo.id, tempDescription);
                        }}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                      >
                        <Check size={12} />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDescription(null);
                        }}
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700"
                      >
                        <X size={12} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-800 min-h-[1.25rem]">
                      {photo.description || (
                        <span className="text-gray-400 italic">
                          No description
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{formatDateTime(photo.uploadedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{formatFileSize(photo.fileSize)}</span>
                    {photo.fileName && (
                      <span
                        className="truncate max-w-[120px]"
                        title={photo.fileName}
                      >
                        {photo.fileName}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDateTimeWithRelative(photo.uploadedAt).relative}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <Camera className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No photos yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add the first photo of {childName} to get started
          </p>
          <button
            onClick={() => onAddPhotoClick?.()}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add First Photo</span>
          </button>
        </div>
      )}

      {/* Full Size Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors z-10"
            >
              <X size={24} />
            </button>

            <img
              src={getPhotoSrc(selectedPhoto)}
              alt={selectedPhoto.fileName || "Photo"}
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            {/* Photo Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-4 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {selectedPhoto.isProfile && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="text-yellow-400" size={16} />
                      <span className="text-yellow-400 font-medium text-sm">
                        Profile Photo
                      </span>
                    </div>
                  )}
                  {selectedPhoto.description && (
                    <p className="text-white mb-2">
                      {selectedPhoto.description}
                    </p>
                  )}
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Uploaded: {formatDateTime(selectedPhoto.uploadedAt)}</p>
                    <p>Size: {formatFileSize(selectedPhoto.fileSize)}</p>
                    {selectedPhoto.fileName && (
                      <p>File: {selectedPhoto.fileName}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Photo
                </h3>
                <p className="text-gray-600 text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete this photo?
                {photos.find((p) => p.id === showDeleteConfirm)?.isProfile && (
                  <span className="block mt-2 text-amber-600 font-medium">
                    ⚠️ This is the current profile photo. The next most recent
                    photo will become the new profile picture.
                  </span>
                )}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePhoto(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
