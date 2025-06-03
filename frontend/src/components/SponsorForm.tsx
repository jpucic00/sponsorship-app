import React, { useState, useEffect } from "react";
import { UserPlus, Users, Phone, Check } from "lucide-react";

interface Proxy {
  id: number;
  fullName: string;
  role: string;
  contact: string;
}

interface SponsorFormProps {
  onSubmit: (sponsorData: any) => void;
  initialData?: any;
}

export const SponsorForm: React.FC<SponsorFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    contact: "",
    proxyId: "",
    ...initialData,
  });

  useEffect(() => {
    // Fetch proxies for dropdown
    fetch("/api/proxies")
      .then((res) => res.json())
      .then(setProxies)
      .catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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

  const isFormValid = () => {
    return formData.fullName.trim() && formData.contact.trim();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Sponsor Registration
          </h1>
          <p className="text-gray-600 text-lg">
            Help us connect generous sponsors with children in need
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 transition-all duration-500">
          <div className="flex items-center space-x-3 mb-8">
            <UserPlus className="text-green-600" size={32} />
            <h2 className="text-3xl font-bold text-gray-900">
              Sponsor Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sponsor Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Sponsor Full Name *
              </label>
              <div className="relative">
                <Users
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 text-lg"
                  placeholder="Enter full name of sponsor"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Contact Information *
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />
                <textarea
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 text-lg resize-none"
                  placeholder="Phone number, email, address, or any other contact information"
                />
              </div>
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                💡 Include multiple contact methods when possible (phone, email,
                address)
              </p>
            </div>

            {/* Proxy/Middleman Selection */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Middleman/Proxy (Optional)
                </label>
                <select
                  name="proxyId"
                  value={formData.proxyId}
                  onChange={handleChange}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70 text-lg"
                >
                  <option value="">No middleman - Direct contact</option>
                  {proxies.map((proxy) => (
                    <option key={proxy.id} value={proxy.id}>
                      {proxy.fullName} ({proxy.role})
                    </option>
                  ))}
                </select>

                <div className="bg-white/60 p-4 rounded-xl border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium mb-2">
                    🤝 About Proxies/Middlemen
                  </p>
                  <p className="text-sm text-gray-600">
                    Select a priest, community leader, or other trusted
                    intermediary if the sponsor prefers to work through someone.
                    This helps with local coordination and communication.
                  </p>
                </div>
              </div>
            </div>

            {/* Available Proxies Info */}
            {proxies.length > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                  Available Proxies
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {proxies.slice(0, 4).map((proxy) => (
                    <div
                      key={proxy.id}
                      className="bg-white p-3 rounded-lg border border-gray-200 text-sm"
                    >
                      <div className="font-medium text-gray-900">
                        {proxy.fullName}
                      </div>
                      <div className="text-gray-600">{proxy.role}</div>
                    </div>
                  ))}
                </div>
                {proxies.length > 4 && (
                  <p className="text-sm text-gray-500 mt-3">
                    And {proxies.length - 4} more available in the dropdown...
                  </p>
                )}
              </div>
            )}

            {/* Form Validation Display */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Check className="text-blue-600 mr-2" size={20} />
                Form Status
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      formData.fullName.trim() ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-700">
                    Sponsor name entered
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      formData.contact.trim() ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-700">
                    Contact information provided
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-700">
                    Proxy selection is optional
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={!isFormValid()}
                className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-xl disabled:hover:scale-100"
              >
                <Check size={24} />
                <span className="text-lg">
                  {initialData ? "Update Sponsor" : "Register Sponsor"}
                </span>
              </button>

              {!isFormValid() && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  Please fill in all required fields to continue
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Additional Info Card */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3 flex items-center justify-center">
              <Check size={16} className="text-white" />
            </div>
            What Happens Next?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="font-semibold text-green-700">
                1. Registration
              </div>
              <div className="text-gray-700 mt-1">
                Your sponsor information is saved in our system
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="font-semibold text-blue-700">2. Matching</div>
              <div className="text-gray-700 mt-1">
                We'll help match the sponsor with a child in need
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <div className="font-semibold text-purple-700">3. Connection</div>
              <div className="text-gray-700 mt-1">
                Facilitate the sponsorship relationship
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
