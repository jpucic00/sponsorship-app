import React from "react";
import { User } from "lucide-react";

interface School {
  id: number;
  name: string;
  location: string;
}

interface BasicInfoStepProps {
  formData: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    schoolId: string;
    class: string;
  };
  schools: School[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

const CLASS_OPTIONS = [
  { value: "P1", label: "Primary 1 (P1)" },
  { value: "P2", label: "Primary 2 (P2)" },
  { value: "P3", label: "Primary 3 (P3)" },
  { value: "P4", label: "Primary 4 (P4)" },
  { value: "P5", label: "Primary 5 (P5)" },
  { value: "P6", label: "Primary 6 (P6)" },
  { value: "P7", label: "Primary 7 (P7)" },
  { value: "S1", label: "Senior 1 (S1)" },
  { value: "S2", label: "Senior 2 (S2)" },
  { value: "S3", label: "Senior 3 (S3)" },
  { value: "S4", label: "Senior 4 (S4)" },
  { value: "S5", label: "Senior 5 (S5)" },
  { value: "S6", label: "Senior 6 (S6)" },
];

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  schools,
  onChange,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3 mb-6">
        <User className="text-blue-600" size={28} />
        <h2 className="text-3xl font-bold text-gray-900">Basic Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
            placeholder="Enter first name"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
            placeholder="Enter last name"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Date of Birth *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={onChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Gender *
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={onChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            School *
          </label>
          <select
            name="schoolId"
            value={formData.schoolId}
            onChange={onChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
          >
            <option value="">Select School</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name} - {school.location}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Class *
          </label>
          <select
            name="class"
            value={formData.class}
            onChange={onChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
          >
            <option value="">Select Class</option>
            {CLASS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
