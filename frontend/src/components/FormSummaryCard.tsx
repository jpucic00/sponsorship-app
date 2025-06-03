import React from "react";
import { Check } from "lucide-react";

interface Sponsor {
  id: number;
  fullName: string;
  proxy?: {
    fullName: string;
    role: string;
  };
}

interface Proxy {
  id: number;
  fullName: string;
  role: string;
}

interface FormSummaryCardProps {
  formData: {
    firstName: string;
    lastName: string;
    class: string;
    fatherFullName: string;
    motherFullName: string;
  };
  selectedSponsors: Sponsor[];
  showNewSponsorForm: boolean;
  newSponsorData: {
    fullName: string;
  };
  selectedProxy: Proxy | null;
  showNewProxyForm: boolean;
  newProxyData: {
    fullName: string;
    role: string;
  };
}

export const FormSummaryCard: React.FC<FormSummaryCardProps> = ({
  formData,
  selectedSponsors,
  showNewSponsorForm,
  newSponsorData,
  selectedProxy,
  showNewProxyForm,
  newProxyData,
}) => {
  return (
    <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 flex items-center justify-center">
          <Check size={16} className="text-white" />
        </div>
        Registration Summary
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-gray-900 font-medium">
            {formData.firstName} {formData.lastName}
          </div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <span className="font-semibold text-purple-700">Class:</span>
          <div className="text-gray-900 font-medium">{formData.class}</div>
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
          <span className="font-semibold text-red-700">Sponsors:</span>
          <div className="text-gray-900 font-medium">
            {selectedSponsors.length > 0 ? (
              <div className="space-y-1">
                {selectedSponsors.map((sponsor, index) => (
                  <div key={sponsor.id}>
                    {sponsor.fullName}
                    {sponsor.proxy && (
                      <div className="text-sm text-gray-600">
                        Via: {sponsor.proxy.fullName} ({sponsor.proxy.role})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : showNewSponsorForm && newSponsorData.fullName ? (
              <div>
                {newSponsorData.fullName} (New Sponsor)
                {showNewProxyForm && newProxyData.fullName && (
                  <div className="text-sm text-gray-600 mt-1">
                    Via: {newProxyData.fullName} ({newProxyData.role}) - New
                    Proxy
                  </div>
                )}
                {selectedProxy && (
                  <div className="text-sm text-gray-600 mt-1">
                    Via: {selectedProxy.fullName} ({selectedProxy.role})
                  </div>
                )}
              </div>
            ) : (
              "No sponsors assigned"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
