import React from "react";
import { FileText, Camera } from "lucide-react";

interface AdditionalDetailsStepProps {
  formData: {
    story: string;
    comment: string;
    photoUrl: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export const AdditionalDetailsStep: React.FC<AdditionalDetailsStepProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="text-blue-600" size={28} />
        <h2 className="text-3xl font-bold text-gray-900">
          Additional Information
        </h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Child Story
          </label>
          <textarea
            name="story"
            value={formData.story}
            onChange={onChange}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 resize-none"
            placeholder="Tell us about this child's background, situation, dreams, and aspirations..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Volunteer Comments
          </label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={onChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 resize-none"
            placeholder="Internal notes and comments by volunteers"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Photo URL
          </label>
          <div className="relative">
            <Camera
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="url"
              name="photoUrl"
              value={formData.photoUrl}
              onChange={onChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
