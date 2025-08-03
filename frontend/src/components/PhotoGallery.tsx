import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Camera,
  Plus,
  X,
  Trash2,
  Eye,
  Edit,
  Check,
  Upload,
  Clock,
  Star,
  AlertTriangle,
} from "lucide-react";
import { ImageUpload } from "./ImageUpload";
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

export const PhotoGallery = forwardRef<
  { refreshPhotos: () => void },
  PhotoGalleryProps
>(({ childId, childName, onProfilePhotoChange, onAddPhotoClick }, ref) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [editingDescription, setEditingDescription] = useState<number | null>(
    null
  );
  const [tempDescription, setTempDescription] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [uploading, setUploading] = useState(false);

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

  // Expose the fetchPhotos method to parent component
  useImperativeHandle(ref, () => ({
    refreshPhotos: () => fetchPhotos(),
  }));

  const handleAddPhoto = async (
    imageData: {
      base64?: string;
      mimeType?: string;
      fileName?: string;
      size?: number;
    } | null
  ) => {
    if (!imageData) return;

    setUploading(true);
    try {
      const response = await fetch(`/api/child-photos/child/${childId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photoBase64: imageData.base64,
          mimeType: imageData.mimeType,
          fileName: imageData.fileName,
          fileSize: imageData.size,
          description: "",
        }),
      });

      if (response.ok) {
        await fetchPhotos();
        setShowAddPhoto(false);
        onProfilePhotoChange?.();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to upload photo");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo");
    } finally {
      setUploading(false);
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
                  ? "border-purple-400 ring-2 ring-purple-200"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              {/* Profile Badge */}
              {photo.isProfile && (
                <div className="absolute top-3 left-3 z-10">
                  <div className="flex items-center space-x-1 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    <Star size={12} className="fill-current" />
                    <span>Profile</span>
                  </div>
                </div>
              )}

              {/* Photo */}
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={getPhotoSrc(photo)}
                  alt={photo.description || `Photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/api/placeholder-image";
                  }}
                />

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedPhoto(photo)}
                      className="p-2 bg-white/90 text-gray-800 rounded-full hover:bg-white transition-colors shadow-lg"
                      title="View full size"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingDescription(photo.id);
                        setTempDescription(photo.description || "");
                      }}
                      className="p-2 bg-white/90 text-gray-800 rounded-full hover:bg-white transition-colors shadow-lg"
                      title="Edit description"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(photo.id)}
                      className="p-2 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      title="Delete photo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Photo Info */}
              <div className="p-4 space-y-3">
                {/* Description */}
                {editingDescription === photo.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      placeholder="Add a description..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handleUpdateDescription(photo.id, tempDescription)
                        }
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check size={12} />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => setEditingDescription(null)}
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <X size={12} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-800 text-sm font-medium line-clamp-2">
                      {photo.description || "No description"}
                    </p>
                    {!photo.description && (
                      <button
                        onClick={() => {
                          setEditingDescription(photo.id);
                          setTempDescription("");
                        }}
                        className="text-purple-600 hover:text-purple-700 text-xs mt-1 transition-colors"
                      >
                        Add description
                      </button>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                  <div className="flex items-center space-x-1">
                    <Clock size={12} />
                    <span>
                      {formatDateTimeWithRelative(photo.uploadedAt).relative}
                    </span>
                  </div>
                  <span>{formatFileSize(photo.fileSize)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Camera className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No photos yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add the first photo of {childName} to get started
          </p>
          <button
            onClick={() => setShowAddPhoto(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add First Photo</span>
          </button>
        </div>
      )}

      {/* Add Photo Modal */}
      {showAddPhoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Add New Photo for {childName}
              </h3>
              <button
                onClick={() => setShowAddPhoto(false)}
                disabled={uploading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            {uploading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Uploading photo...</p>
                <p className="text-gray-500 text-sm mt-2">
                  This will become the new profile photo
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <p className="text-purple-700 font-medium text-sm">
                    📸 The latest uploaded photo will automatically become the
                    profile picture
                  </p>
                </div>
                <ImageUpload
                  value={undefined}
                  onChange={handleAddPhoto}
                  maxSize={5}
                  acceptedTypes={[
                    "image/jpeg",
                    "image/png",
                    "image/jpg",
                    "image/webp",
                  ]}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Size Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-full max-h-full">
              <img
                src={getPhotoSrc(selectedPhoto)}
                alt={selectedPhoto.description || "Full size photo"}
                className="max-w-full max-h-[80vh] object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/api/placeholder-image";
                }}
              />

              {/* Photo details overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="text-white">
                  {selectedPhoto.isProfile && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Star
                        size={16}
                        className="fill-current text-purple-400"
                      />
                      <span className="text-purple-400 font-medium text-sm">
                        Profile Photo
                      </span>
                    </div>
                  )}
                  <h3 className="text-lg font-semibold mb-2">
                    {selectedPhoto.description || "No description"}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span>
                      Uploaded {formatDateTime(selectedPhoto.uploadedAt)}
                    </span>
                    <span>{formatFileSize(selectedPhoto.fileSize)}</span>
                    {selectedPhoto.fileName && (
                      <span>{selectedPhoto.fileName}</span>
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
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Photo</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete this photo? This action cannot
                be undone.
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
});

PhotoGallery.displayName = "PhotoGallery";
