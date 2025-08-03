import React from "react";
import {
  Users,
  Mail,
  Phone,
  MessageSquare,
  User,
  MapPin,
  FileText,
} from "lucide-react";

interface SponsorDetailsProps {
  sponsor: {
    id: number;
    fullName: string;
    email?: string;
    phone?: string;
    contact?: string;
    createdAt: string;
    proxy?: {
      id: number;
      fullName: string;
      role: string;
      email?: string;
      phone?: string;
      contact?: string;
      description?: string;
    };
    sponsorships?: Array<{
      id: number;
      child: {
        id: number;
        firstName: string;
        lastName: string;
      };
      monthlyAmount?: number;
      startDate: string;
      isActive: boolean;
    }>;
  };
}

export const SponsorDetails: React.FC<SponsorDetailsProps> = ({ sponsor }) => {
  return (
    <div className="space-y-6">
      {/* Sponsor Information Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <Users className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {sponsor.fullName}
            </h2>
            <p className="text-gray-600">Sponsor Details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Contact Information
            </h3>

            {/* Email */}
            {sponsor.email && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Email Address
                  </p>
                  <p className="text-blue-700 font-medium">{sponsor.email}</p>
                </div>
              </div>
            )}

            {/* Phone */}
            {sponsor.phone && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Phone Number
                  </p>
                  <p className="text-green-700 font-medium">{sponsor.phone}</p>
                </div>
              </div>
            )}

            {/* Additional Contact Info */}
            {sponsor.contact && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                  <MessageSquare className="text-gray-600" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    Additional Information
                  </p>
                  <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                    {sponsor.contact}
                  </p>
                </div>
              </div>
            )}

            {/* Contact Methods Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-blue-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Available Contact Methods
              </h4>
              <div className="flex flex-wrap gap-2">
                {sponsor.email && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    <Mail size={12} className="mr-1" />
                    Email
                  </span>
                )}
                {sponsor.phone && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    <Phone size={12} className="mr-1" />
                    Phone
                  </span>
                )}
                {sponsor.contact && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    <MessageSquare size={12} className="mr-1" />
                    Additional
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Registration Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Registration Information
            </h3>

            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <User className="text-orange-600" size={16} />
                <span className="text-sm font-semibold text-orange-700">
                  Registration Date
                </span>
              </div>
              <p className="text-gray-700 font-medium">
                {new Date(sponsor.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Active Sponsorships Count */}
            {sponsor.sponsorships && (
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="text-purple-600" size={16} />
                  <span className="text-sm font-semibold text-purple-700">
                    Active Sponsorships
                  </span>
                </div>
                <p className="text-gray-700 font-medium">
                  {sponsor.sponsorships.filter((s) => s.isActive).length} active
                  sponsorship(s)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proxy Information Card */}
      {sponsor.proxy && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {sponsor.proxy.fullName}
              </h2>
              <p className="text-purple-600 font-medium">
                {sponsor.proxy.role}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Proxy Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Proxy Contact Information
              </h3>

              {/* Proxy Email */}
              {sponsor.proxy.email && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Email Address
                    </p>
                    <p className="text-blue-700 font-medium">
                      {sponsor.proxy.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Proxy Phone */}
              {sponsor.proxy.phone && (
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="text-green-600" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Phone Number
                    </p>
                    <p className="text-green-700 font-medium">
                      {sponsor.proxy.phone}
                    </p>
                  </div>
                </div>
              )}

              {/* Proxy Additional Contact */}
              {sponsor.proxy.contact && (
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                    <MessageSquare className="text-gray-600" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      Additional Information
                    </p>
                    <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                      {sponsor.proxy.contact}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Proxy Role and Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Role & Description
              </h3>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="text-purple-600" size={16} />
                  <span className="text-sm font-semibold text-purple-700">
                    Role
                  </span>
                </div>
                <p className="text-gray-700 font-medium">
                  {sponsor.proxy.role}
                </p>
              </div>

              {sponsor.proxy.description && (
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="flex items-start space-x-2 mb-2">
                    <FileText className="text-indigo-600 mt-1" size={16} />
                    <span className="text-sm font-semibold text-indigo-700">
                      Description
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {sponsor.proxy.description}
                  </p>
                </div>
              )}

              {/* Proxy Contact Methods Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Proxy Contact Methods
                </h4>
                <div className="flex flex-wrap gap-2">
                  {sponsor.proxy.email && (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      <Mail size={12} className="mr-1" />
                      Email
                    </span>
                  )}
                  {sponsor.proxy.phone && (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      <Phone size={12} className="mr-1" />
                      Phone
                    </span>
                  )}
                  {sponsor.proxy.contact && (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      <MessageSquare size={12} className="mr-1" />
                      Additional
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Communication Flow Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">
              Communication Flow
            </h4>
            <p className="text-sm text-yellow-700">
              This proxy serves as an intermediary for communication between the
              sponsor and the local community. Contact the proxy for
              coordination of sponsorship activities and local updates.
            </p>
          </div>
        </div>
      )}

      {/* Active Sponsorships List */}
      {sponsor.sponsorships && sponsor.sponsorships.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Active Sponsorships
          </h2>
          <div className="space-y-3">
            {sponsor.sponsorships
              .filter((sponsorship) => sponsorship.isActive)
              .map((sponsorship) => (
                <div
                  key={sponsorship.id}
                  className="p-4 bg-green-50 rounded-xl border border-green-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {sponsorship.child.firstName}{" "}
                        {sponsorship.child.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Started:{" "}
                        {new Date(sponsorship.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    {sponsorship.monthlyAmount && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-700">
                          ${sponsorship.monthlyAmount}/month
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
