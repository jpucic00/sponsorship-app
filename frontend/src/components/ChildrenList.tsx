import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Child {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  class: string;
  isSponsored: boolean;
  school: {
    name: string;
    location: string;
  };
  sponsorship?: {
    sponsor: {
      fullName: string;
    };
  };
}

export const ChildrenList: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSponsored, setFilterSponsored] = useState("all");
  const [filterGender, setFilterGender] = useState("all");

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await fetch("/api/children");
      const data = await response.json();
      setChildren(data);
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChildren = children.filter((child) => {
    const matchesSearch =
      child.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.school.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSponsored =
      filterSponsored === "all" ||
      (filterSponsored === "sponsored" && child.isSponsored) ||
      (filterSponsored === "unsponsored" && !child.isSponsored);

    const matchesGender =
      filterGender === "all" || child.gender.toLowerCase() === filterGender;

    return matchesSearch && matchesSponsored && matchesGender;
  });

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Children</h1>
            <p className="text-gray-600 mt-1">
              {filteredChildren.length} children found
            </p>
          </div>
          <Link
            to="/register-child"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <span className="mr-2">➕</span>
            Add New Child
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or school..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sponsorship Status
            </label>
            <select
              value={filterSponsored}
              onChange={(e) => setFilterSponsored(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Children</option>
              <option value="sponsored">Sponsored</option>
              <option value="unsponsored">Needs Sponsor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterSponsored("all");
                setFilterGender("all");
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Children Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChildren.map((child) => (
          <div
            key={child.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {child.firstName} {child.lastName}
                </h3>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    child.isSponsored
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {child.isSponsored ? "Sponsored" : "Needs Sponsor"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="font-medium w-16">Age:</span>
                  <span>{calculateAge(child.dateOfBirth)} years old</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-16">Gender:</span>
                  <span>{child.gender}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-16">Class:</span>
                  <span>{child.class}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-16">School:</span>
                  <span>{child.school.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-16">Location:</span>
                  <span>{child.school.location}</span>
                </div>
                {child.sponsorship && (
                  <div className="flex items-center">
                    <span className="font-medium w-16">Sponsor:</span>
                    <span className="text-green-600">
                      {child.sponsorship.sponsor.fullName}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                  View Details
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">
                  Edit
                </button>
                {!child.isSponsored && (
                  <button className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                    Find Sponsor
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredChildren.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">👶</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No children found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterSponsored !== "all" || filterGender !== "all"
              ? "Try adjusting your filters to see more results."
              : "Get started by adding your first child to the system."}
          </p>
          <Link
            to="/register-child"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <span className="mr-2">➕</span>
            Add First Child
          </Link>
        </div>
      )}
    </div>
  );
};
