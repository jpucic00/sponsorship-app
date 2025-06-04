import React, { useState, useRef } from "react";
import { Camera, Upload, X, Eye } from "lucide-react";

interface ImageUploadProps {
  value?: string; // Base64 string or URL
  onChange: (
    imageData: {
      base64?: string;
      mimeType?: string;
      fileName?: string;
      size?: number;
    } | null
  ) => void;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  maxSize = 5, // 5MB default
  acceptedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"],
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      alert(
        `Please select a valid image file. Accepted types: ${acceptedTypes.join(
          ", "
        )}`
      );
      return;
    }

    // Validate file size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSize) {
      alert(
        `File size must be less than ${maxSize}MB. Current size: ${sizeInMB.toFixed(
          2
        )}MB`
      );
      return;
    }

    setLoading(true);

    try {
      // Convert to Base64
      const base64 = await fileToBase64(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Call onChange with image data
      onChange({
        base64,
        mimeType: file.type,
        fileName: file.name,
        size: file.size,
      });
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Error processing image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Remove the data:image/jpeg;base64, prefix
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">
        <Camera className="inline mr-1" size={16} />
        Child Photo
      </label>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!loading ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={loading}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600">Processing image...</p>
          </div>
        ) : preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(preview, "_blank");
                }}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                title="View full size"
              >
                <Eye size={20} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="p-2 bg-red-500/80 backdrop-blur-sm rounded-full text-white hover:bg-red-600/80 transition-colors"
                title="Remove image"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Upload child's photo
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop or click to select
            </p>
            <div className="text-xs text-gray-400 space-y-1 text-center">
              <p>Accepted: JPG, PNG, WebP</p>
              <p>Max size: {maxSize}MB</p>
            </div>
          </div>
        )}
      </div>

      {/* File Info */}
      {preview && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-700">
            ✅ Image ready for upload
          </p>
          <p className="text-xs text-green-600 mt-1">
            The image will be saved securely in the database
          </p>
        </div>
      )}
    </div>
  );
};
