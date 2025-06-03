import React from "react";
import { Users } from "lucide-react";

interface FamilyInfoStepProps {
  formData: {
    fatherFullName: string;
    fatherAddress: string;
    fatherContact: string;
    motherFullName: string;
    motherAddress: string;
    motherContact: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

export const FamilyInfoStep: React.FC<FamilyInfoStepProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3 mb-6">
        <Users className="text-blue-600" size={28} />
        <h2 className="text-3xl font-bold text-gray-900">Family Information</h2>
      </div>

      {/* Father Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          Father Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Father Full Name *
            </label>
            <input
              type="text"
              name="fatherFullName"
              value={formData.fatherFullName}
              onChange={onChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70"
              placeholder="Enter father full name"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Father Address
            </label>
            <input
              type="text"
              name="fatherAddress"
              value={formData.fatherAddress}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70"
              placeholder="Enter address"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Father Contact
            </label>
            <input
              type="text"
              name="fatherContact"
              value={formData.fatherContact}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70"
              placeholder="Phone, email, or other contact info"
            />
          </div>
        </div>
      </div>

      {/* Mother Information */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
          Mother Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Mother Full Name *
            </label>
            <input
              type="text"
              name="motherFullName"
              value={formData.motherFullName}
              onChange={onChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
              placeholder="Enter mother full name"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Mother Address
            </label>
            <input
              type="text"
              name="motherAddress"
              value={formData.motherAddress}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
              placeholder="Enter address"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Mother Contact
            </label>
            <input
              type="text"
              name="motherContact"
              value={formData.motherContact}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
              placeholder="Phone, email, or other contact info"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
