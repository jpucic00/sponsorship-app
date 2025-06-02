import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  User,
  Users,
  Heart,
  FileText,
  Camera,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";

interface School {
  id: number;
  name: string;
  location: string;
}

interface Sponsor {
  id: number;
  fullName: string;
  contact: string;
  proxy?: {
    fullName: string;
    role: string;
  };
}

interface Proxy {
  id: number;
  fullName: string;
  role: string;
  contact: string;
}

interface ChildFormProps {
  onSubmit: (childData: any) => void;
  initialData?: any;
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

export const ChildForm: React.FC<ChildFormProps> = ({
  onSubmit,
  initialData = {},
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [schools, setSchools] = useState<School[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [sponsorSearchTerm, setSponsorSearchTerm] = useState("");
  const [showNewSponsorForm, setShowNewSponsorForm] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    schoolId: "",
    class: "",
    fatherFullName: "",
    fatherAddress: "",
    fatherContact: "",
    motherFullName: "",
    motherAddress: "",
    motherContact: "",
    story: "",
    comment: "",
    photoUrl: "",
    sponsorId: "",
    ...initialData,
  });

  const [newSponsorData, setNewSponsorData] = useState({
    fullName: "",
    contact: "",
    proxyId: "",
  });

  const steps = [
    { number: 1, title: "Basic Info", icon: User },
    { number: 2, title: "Family", icon: Users },
    { number: 3, title: "Sponsor", icon: Heart },
    { number: 4, title: "Details", icon: FileText },
  ];

  useEffect(() => {
    // Mock data for demonstration
    const mockSchools = [
      { id: 1, name: "Kampala Primary School", location: "Kampala" },
      { id: 2, name: "Entebbe Community School", location: "Entebbe" },
      { id: 3, name: "Jinja Secondary School", location: "Jinja" },
    ];

    const mockSponsors = [
      {
        id: 1,
        fullName: "John Smith",
        contact: "john.smith@email.com, +256701234567",
      },
      {
        id: 2,
        fullName: "Mary Johnson",
        contact: "mary.johnson@email.com, +256702345678",
        proxy: { fullName: "Father Michael", role: "Priest" },
      },
      {
        id: 3,
        fullName: "David Wilson",
        contact: "david.wilson@email.com, +256703456789",
      },
    ];

    const mockProxies = [
      {
        id: 1,
        fullName: "Father Michael Ochieng",
        role: "Priest",
        contact: "+256701234567",
      },
      {
        id: 2,
        fullName: "Sister Agnes Namalwa",
        role: "Nun",
        contact: "+256702345678",
      },
    ];

    setSchools(mockSchools);
    setSponsors(mockSponsors);
    setProxies(mockProxies);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNewSponsorChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setNewSponsorData({
      ...newSponsorData,
      [e.target.name]: e.target.value,
    });
  };

  const filteredSponsors = sponsors.filter(
    (sponsor) =>
      sponsor.fullName
        .toLowerCase()
        .includes(sponsorSearchTerm.toLowerCase()) ||
      sponsor.contact.toLowerCase().includes(sponsorSearchTerm.toLowerCase())
  );

  const handleSponsorSelect = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setFormData({ ...formData, sponsorId: sponsor.id.toString() });
    setShowNewSponsorForm(false);
  };

  const handleCreateNewSponsor = () => {
    setShowNewSponsorForm(true);
    setSelectedSponsor(null);
    setFormData({ ...formData, sponsorId: "" });
  };

  const handleSubmit = async () => {
    let finalData = { ...formData };

    if (showNewSponsorForm && newSponsorData.fullName) {
      const newSponsor = {
        id: Date.now(),
        ...newSponsorData,
      };
      finalData.sponsorId = newSponsor.id.toString();
      finalData.newSponsor = newSponsor;
    }

    onSubmit(finalData);
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.firstName &&
          formData.lastName &&
          formData.dateOfBirth &&
          formData.gender &&
          formData.schoolId &&
          formData.class
        );
      case 2:
        return formData.fatherFullName && formData.motherFullName;
      case 3:
        return (
          selectedSponsor ||
          (showNewSponsorForm &&
            newSponsorData.fullName &&
            newSponsorData.contact)
        );
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Register New Child
          </h1>
          <p className="text-gray-600 text-lg">
            Help us connect children with caring sponsors
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 md:space-x-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex items-center space-x-3 transition-all duration-300 ${
                      isActive
                        ? "text-blue-600 scale-105"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative ${
                        isActive
                          ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-200"
                          : isCompleted
                          ? "border-green-600 bg-green-50"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                      {isActive && (
                        <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping" />
                      )}
                    </div>
                    <div className="hidden md:block">
                      <div className="font-semibold text-sm">{step.title}</div>
                      <div className="text-xs opacity-70">
                        Step {step.number}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-1 mx-2 md:mx-4 rounded transition-all duration-300 ${
                        isCompleted ? "bg-green-400" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 transition-all duration-500">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <User className="text-blue-600" size={28} />
                <h2 className="text-3xl font-bold text-gray-900">
                  Basic Information
                </h2>
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
          )}

          {/* Step 2: Family Information */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="text-blue-600" size={28} />
                <h2 className="text-3xl font-bold text-gray-900">
                  Family Information
                </h2>
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
                      placeholder="Phone, email, or other contact info"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Sponsor Selection/Creation */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <Heart className="text-red-500" size={28} />
                <h2 className="text-3xl font-bold text-gray-900">
                  Sponsor Assignment
                </h2>
              </div>

              {/* Sponsor Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewSponsorForm(false);
                    setSelectedSponsor(null);
                  }}
                  className={`p-8 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    !showNewSponsorForm
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-200"
                      : "border-gray-300 hover:border-gray-400 bg-white"
                  }`}
                >
                  <Search className="mx-auto mb-4 text-blue-600" size={40} />
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">
                    Find Existing Sponsor
                  </h3>
                  <p className="text-sm text-gray-600">
                    Search and select from registered sponsors
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handleCreateNewSponsor}
                  className={`p-8 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    showNewSponsorForm
                      ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg shadow-green-200"
                      : "border-gray-300 hover:border-gray-400 bg-white"
                  }`}
                >
                  <Plus className="mx-auto mb-4 text-green-600" size={40} />
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">
                    Create New Sponsor
                  </h3>
                  <p className="text-sm text-gray-600">
                    Register a new sponsor for this child
                  </p>
                </button>
              </div>

              {/* Existing Sponsor Search */}
              {!showNewSponsorForm && (
                <div className="space-y-6">
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Search sponsors by name or contact..."
                      value={sponsorSearchTerm}
                      onChange={(e) => setSponsorSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 text-lg"
                    />
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-3">
                    {filteredSponsors.length > 0 ? (
                      filteredSponsors.map((sponsor) => (
                        <div
                          key={sponsor.id}
                          onClick={() => handleSponsorSelect(sponsor)}
                          className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                            selectedSponsor?.id === sponsor.id
                              ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg"
                              : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">
                                {sponsor.fullName}
                              </h4>
                              <p className="text-gray-600 mt-1">
                                {sponsor.contact}
                              </p>
                              {sponsor.proxy && (
                                <p className="text-sm text-purple-600 mt-2 bg-purple-50 px-2 py-1 rounded-full inline-block">
                                  Via: {sponsor.proxy.fullName} (
                                  {sponsor.proxy.role})
                                </p>
                              )}
                            </div>
                            {selectedSponsor?.id === sponsor.id && (
                              <Check className="text-blue-600" size={24} />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Users size={64} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No sponsors found</p>
                        <p className="text-sm">
                          Try adjusting your search or create a new sponsor.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* New Sponsor Form */}
              {showNewSponsorForm && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    New Sponsor Information
                  </h3>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Sponsor Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={newSponsorData.fullName}
                        onChange={handleNewSponsorChange}
                        required={showNewSponsorForm}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70"
                        placeholder="Enter sponsor full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Contact Information *
                      </label>
                      <textarea
                        name="contact"
                        value={newSponsorData.contact}
                        onChange={handleNewSponsorChange}
                        required={showNewSponsorForm}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 resize-none"
                        placeholder="Phone number, email, address, or any other contact information"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Middleman/Proxy (Optional)
                      </label>
                      <select
                        name="proxyId"
                        value={newSponsorData.proxyId}
                        onChange={handleNewSponsorChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70"
                      >
                        <option value="">No middleman - Direct contact</option>
                        {proxies.map((proxy) => (
                          <option key={proxy.id} value={proxy.id}>
                            {proxy.fullName} ({proxy.role})
                          </option>
                        ))}
                      </select>
                      <p className="text-sm text-gray-600 mt-2 bg-white/50 p-2 rounded-lg">
                        💡 Select a priest, community leader, or other
                        intermediary if the sponsor works through someone
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Additional Details */}
          {currentStep === 4 && (
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
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 resize-none"
                    placeholder="Tell us about this child background, situation, dreams, and aspirations..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Volunteer Comments
                  </label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
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
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            <div className="flex space-x-4">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <span>Next Step</span>
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isStepValid()}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Check size={20} />
                  <span>Register Child</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary Card (visible on last step) */}
        {currentStep === 4 && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 flex items-center justify-center">
                <Check size={16} className="text-white" />
              </div>
              Registration Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <span className="font-semibold text-blue-700">Child:</span>
                <div className="text-gray-900 font-medium">
                  {formData.firstName} {formData.lastName}
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <span className="font-semibold text-purple-700">Class:</span>
                <div className="text-gray-900 font-medium">
                  {formData.class}
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <span className="font-semibold text-green-700">Father:</span>
                <div className="text-gray-900 font-medium">
                  {formData.fatherFullName}
                </div>
              </div>
              <div className="bg-pink-50 p-3 rounded-lg">
                <span className="font-semibold text-pink-700">Mother:</span>
                <div className="text-gray-900 font-medium">
                  {formData.motherFullName}
                </div>
              </div>
              <div className="md:col-span-2 bg-gradient-to-r from-red-50 to-orange-50 p-3 rounded-lg">
                <span className="font-semibold text-red-700">Sponsor:</span>
                <div className="text-gray-900 font-medium">
                  {selectedSponsor?.fullName ||
                    (showNewSponsorForm && newSponsorData.fullName) ||
                    "No sponsor assigned"}
                </div>
                {selectedSponsor?.proxy && (
                  <div className="text-sm text-gray-600 mt-1">
                    Via: {selectedSponsor.proxy.fullName} (
                    {selectedSponsor.proxy.role})
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
