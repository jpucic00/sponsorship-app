import React, { useState, useEffect } from "react";

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

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow"
    >
      <h2 className="text-2xl font-bold mb-6">Sponsor Registration</h2>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Sponsor Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Enter full name of sponsor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Contact Information *
          </label>
          <textarea
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            rows={3}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Phone number, email, address, or any other contact information"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Middleman/Proxy (Optional)
          </label>
          <select
            name="proxyId"
            value={formData.proxyId}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No middleman - Direct contact</option>
            {proxies.map((proxy) => (
              <option key={proxy.id} value={proxy.id}>
                {proxy.fullName} ({proxy.role})
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-600 mt-1">
            Select a priest, community leader, or other intermediary if the
            sponsor works through someone
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:ring-2 focus:ring-green-500"
        >
          {initialData ? "Update Sponsor" : "Register Sponsor"}
        </button>
      </div>
    </form>
  );
};
