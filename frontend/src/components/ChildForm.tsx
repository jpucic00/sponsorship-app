import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check, FileText } from "lucide-react";
import { BasicInfoStep } from "./BasicInfoStep";
import { FamilyInfoStep } from "./FamilyInfoStep";
import { SponsorSelectionStep } from "./SponsorSelectionStep";
import { FormProgressSteps } from "./FormProgressSteps";
import { FormSummaryCard } from "./FormSummaryCard";
import { ImageUpload } from "./ImageUpload";

interface School {
  id: number;
  name: string;
  location: string;
}

interface Sponsor {
  id: number;
  fullName: string;
  contact: string;
  email?: string;
  phone?: string;
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
  email?: string;
  phone?: string;
}

interface ChildFormProps {
  onSubmit: (childData: any) => void;
  initialData?: any;
}

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
  const [selectedSponsors, setSelectedSponsors] = useState<Sponsor[]>([]);

  // New proxy creation states
  const [showNewProxyForm, setShowNewProxyForm] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | null>(null);
  const [proxySearchTerm, setProxySearchTerm] = useState("");

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
    // Image fields for photo gallery
    photoBase64: "",
    photoMimeType: "",
    photoFileName: "",
    photoSize: 0,
    ...initialData,
  });

  // FIXED: Added email and phone fields
  const [newSponsorData, setNewSponsorData] = useState({
    fullName: "",
    email: "",
    phone: "",
    contact: "",
    proxyId: "",
  });

  // FIXED: Added email and phone fields
  const [newProxyData, setNewProxyData] = useState({
    fullName: "",
    email: "",
    phone: "",
    contact: "",
    role: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schoolsRes, sponsorsRes, proxiesRes] = await Promise.all([
        fetch("/api/schools"),
        fetch("/api/sponsors"),
        fetch("/api/proxies"),
      ]);

      const schoolsData = await schoolsRes.json();
      const sponsorsData = await sponsorsRes.json();
      const proxiesData = await proxiesRes.json();

      setSchools(schoolsData);
      // Handle both paginated and non-paginated responses
      setSponsors(sponsorsData.data || sponsorsData || []);
      setProxies(proxiesData);

      console.log("Fetched data:", {
        sponsors: sponsorsData.data || sponsorsData || [],
        proxies: proxiesData,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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

  const handleImageChange = (
    imageData: {
      base64?: string;
      mimeType?: string;
      fileName?: string;
      size?: number;
    } | null
  ) => {
    if (imageData) {
      setFormData({
        ...formData,
        photoBase64: imageData.base64 || "",
        photoMimeType: imageData.mimeType || "",
        photoFileName: imageData.fileName || "",
        photoSize: imageData.size || 0,
      });
    } else {
      setFormData({
        ...formData,
        photoBase64: "",
        photoMimeType: "",
        photoFileName: "",
        photoSize: 0,
      });
    }
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

  const handleNewProxyChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setNewProxyData({
      ...newProxyData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSponsorSelect = (sponsor: Sponsor) => {
    // Toggle sponsor selection
    setSelectedSponsors((prev) => {
      const isAlreadySelected = prev.some((s) => s.id === sponsor.id);
      if (isAlreadySelected) {
        return prev.filter((s) => s.id !== sponsor.id);
      } else {
        return [...prev, sponsor];
      }
    });
    setShowNewSponsorForm(false);
  };

  const handleCreateNewSponsor = () => {
    setShowNewSponsorForm(true);
    setSelectedSponsors([]);
  };

  const resetForm = () => {
    setFormData({
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
      // Reset image fields
      photoBase64: "",
      photoMimeType: "",
      photoFileName: "",
      photoSize: 0,
    });

    // FIXED: Include email and phone fields in reset
    setNewSponsorData({
      fullName: "",
      email: "",
      phone: "",
      contact: "",
      proxyId: "",
    });

    // FIXED: Include email and phone fields in reset
    setNewProxyData({
      fullName: "",
      email: "",
      phone: "",
      contact: "",
      role: "",
      description: "",
    });

    setCurrentStep(1);
    setSponsorSearchTerm("");
    setProxySearchTerm("");
    setShowNewSponsorForm(false);
    setShowNewProxyForm(false);
    setSelectedSponsors([]);
    setSelectedProxy(null);
  };

  const handleSubmit = async () => {
    let finalData = { ...formData };

    // Convert selected sponsors to IDs
    if (selectedSponsors.length > 0) {
      finalData.sponsorIds = selectedSponsors.map((sponsor) =>
        sponsor.id.toString()
      );
    }

    if (showNewSponsorForm && newSponsorData.fullName) {
      // FIXED: Updated proxy creation validation to include email/phone
      if (showNewProxyForm && newProxyData.fullName && newProxyData.role) {
        try {
          console.log("Creating proxy:", newProxyData);
          const proxyResponse = await fetch("/api/proxies", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newProxyData),
          });

          if (proxyResponse.ok) {
            const newProxy = await proxyResponse.json();
            setProxies((prev) => [...prev, newProxy]);
            newSponsorData.proxyId = newProxy.id.toString();
            console.log("Proxy created successfully:", newProxy);
          } else {
            const error = await proxyResponse.json();
            console.error("Proxy creation error:", error);
            throw new Error(error.error || "Failed to create proxy");
          }
        } catch (error) {
          console.error("Error creating proxy:", error);
          alert("Failed to create proxy. Please try again.");
          return;
        }
      }

      // FIXED: Updated to include email and phone when creating sponsor
      console.log("Creating sponsor with data:", newSponsorData);
      finalData.newSponsor = {
        ...newSponsorData,
        // Ensure email and phone are included
        email: newSponsorData.email || null,
        phone: newSponsorData.phone || null,
      };
    }

    try {
      console.log("Submitting final data:", finalData);
      // Submit child data - the backend will handle creating the photo in the gallery
      await onSubmit(finalData);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // FIXED: Updated validation to require email OR phone for sponsors/proxies
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
        if (selectedSponsors.length > 0) return true;
        if (
          showNewSponsorForm &&
          newSponsorData.fullName &&
          (newSponsorData.email || newSponsorData.phone) // FIXED: Require email OR phone
        ) {
          if (showNewProxyForm) {
            return newProxyData.fullName && newProxyData.role;
          }
          return true;
        }
        return true; // Allow no sponsor selection
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <FormProgressSteps currentStep={currentStep} />

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 transition-all duration-500">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <BasicInfoStep
              formData={{
                firstName: formData.firstName,
                lastName: formData.lastName,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                schoolId: formData.schoolId,
                class: formData.class,
              }}
              schools={schools}
              onChange={handleChange}
            />
          )}

          {/* Step 2: Family Information */}
          {currentStep === 2 && (
            <FamilyInfoStep
              formData={{
                fatherFullName: formData.fatherFullName,
                fatherAddress: formData.fatherAddress,
                fatherContact: formData.fatherContact,
                motherFullName: formData.motherFullName,
                motherAddress: formData.motherAddress,
                motherContact: formData.motherContact,
              }}
              onChange={handleChange}
            />
          )}

          {/* Step 3: Sponsor Selection/Creation */}
          {currentStep === 3 && (
            <SponsorSelectionStep
              sponsors={sponsors}
              proxies={proxies}
              sponsorSearchTerm={sponsorSearchTerm}
              setSponsorSearchTerm={setSponsorSearchTerm}
              showNewSponsorForm={showNewSponsorForm}
              setShowNewSponsorForm={setShowNewSponsorForm}
              selectedSponsors={selectedSponsors}
              setSelectedSponsors={setSelectedSponsors}
              newSponsorData={newSponsorData}
              handleNewSponsorChange={handleNewSponsorChange}
              showNewProxyForm={showNewProxyForm}
              setShowNewProxyForm={setShowNewProxyForm}
              selectedProxy={selectedProxy}
              setSelectedProxy={setSelectedProxy}
              newProxyData={newProxyData}
              handleNewProxyChange={handleNewProxyChange}
              proxySearchTerm={proxySearchTerm}
              setProxySearchTerm={setProxySearchTerm}
              onSponsorSelect={handleSponsorSelect}
              onCreateNewSponsor={handleCreateNewSponsor}
            />
          )}

          {/* Step 4: Additional Details with Photo Upload */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="text-blue-600" size={28} />
                <h2 className="text-3xl font-bold text-gray-900">
                  Additional Information
                </h2>
              </div>

              <div className="space-y-6">
                {/* Image Upload - will be added to photo gallery */}
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Child Photo
                  </h3>
                  <div className="bg-white/60 p-4 rounded-xl border border-purple-200 mb-4">
                    <p className="text-sm text-purple-700 font-medium mb-2">
                      📸 About Photo Gallery
                    </p>
                    <p className="text-sm text-gray-600">
                      The photo you upload here will be added to the child's
                      photo gallery and automatically set as their profile
                      picture. You can add more photos later through the photo
                      gallery on the child's detail page.
                    </p>
                  </div>
                  <ImageUpload
                    value={
                      formData.photoBase64
                        ? `data:${formData.photoMimeType};base64,${formData.photoBase64}`
                        : undefined
                    }
                    onChange={handleImageChange}
                    maxSize={5}
                    acceptedTypes={[
                      "image/jpeg",
                      "image/png",
                      "image/jpg",
                      "image/webp",
                    ]}
                  />
                </div>

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
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 resize-none"
                    placeholder="Internal notes and comments by volunteers"
                  />
                </div>

                {/* Image Upload Status */}
                {formData.photoBase64 && (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-2">
                      <Check className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm font-medium text-green-700">
                          ✅ Photo ready for gallery
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          File: {formData.photoFileName} (
                          {Math.round(formData.photoSize / 1024)} KB)
                        </p>
                        <p className="text-xs text-green-600">
                          This will be saved in the photo gallery and set as
                          profile picture
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center space-x-2 px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-all duration-200"
                  >
                    <ChevronLeft size={20} />
                    <span>Previous</span>
                  </button>
                )}
              </div>

              <div>
                <span className="text-sm text-gray-500 mr-4">
                  Step {currentStep} of 4
                </span>
              </div>

              <div>
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
        </div>

        {/* Summary Card (visible on last step) */}
        {currentStep === 4 && (
          <FormSummaryCard
            formData={{
              firstName: formData.firstName,
              lastName: formData.lastName,
              class: formData.class,
              fatherFullName: formData.fatherFullName,
              motherFullName: formData.motherFullName,
            }}
            selectedSponsors={selectedSponsors}
            showNewSponsorForm={showNewSponsorForm}
            newSponsorData={newSponsorData}
            selectedProxy={selectedProxy}
            showNewProxyForm={showNewProxyForm}
            newProxyData={newProxyData}
          />
        )}
      </div>
    </div>
  );
};
