import React from "react";
import { Heart } from "lucide-react";

export const AppFooter: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Heart className="text-white" size={20} />
            </div>
            <h3 className="text-xl font-bold">
              Children Sponsorship Management
            </h3>
          </div>

          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Connecting caring sponsors with children in need, one relationship
            at a time. Building brighter futures through education and support.
          </p>

          <div className="border-t border-gray-700 pt-6">
            <p className="text-gray-400">
              &copy; 2025 Children Sponsorship Management System. Made with ❤️
              for children in need.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
