import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { ChildForm } from "./components/ChildForm";
import { SponsorForm } from "./components/SponsorForm";
import { ExcelImport } from "./components/ExcelImport";
import { Dashboard } from "./components/Dashboard";
import { ChildrenList } from "./components/ChildrenList";
import { SponsorsList } from "./components/SponsorsList";
import "./App.css";

// Navigation Component
const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/children", label: "Children", icon: "👶" },
    { path: "/sponsors", label: "Sponsors", icon: "🤝" },
    { path: "/register-child", label: "Add Child", icon: "➕" },
    { path: "/register-sponsor", label: "Add Sponsor", icon: "👥" },
    { path: "/import", label: "Import Excel", icon: "📄" },
  ];

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold py-4">
                Children Sponsorship
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? "bg-blue-900 text-white"
                        : "text-blue-100 hover:bg-blue-700 hover:text-white"
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Mobile Navigation Menu (for responsive design)
const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/children", label: "Children", icon: "👶" },
    { path: "/sponsors", label: "Sponsors", icon: "🤝" },
    { path: "/register-child", label: "Add Child", icon: "➕" },
    { path: "/register-sponsor", label: "Add Sponsor", icon: "👥" },
    { path: "/import", label: "Import Excel", icon: "📄" },
  ];

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-800">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-blue-100 hover:text-white block px-3 py-2 text-base font-medium"
        >
          ☰ Menu
        </button>
        {isOpen && (
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-blue-900 text-white"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleChildSubmit = async (childData: any) => {
    try {
      const response = await fetch("/api/children", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(childData),
      });

      if (response.ok) {
        showNotification("Child registered successfully!");
        // You might want to redirect or clear the form here
      } else {
        throw new Error("Failed to register child");
      }
    } catch (error) {
      showNotification("Error registering child. Please try again.");
      console.error("Error:", error);
    }
  };

  const handleSponsorSubmit = async (sponsorData: any) => {
    try {
      const response = await fetch("/api/sponsors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sponsorData),
      });

      if (response.ok) {
        showNotification("Sponsor registered successfully!");
      } else {
        throw new Error("Failed to register sponsor");
      }
    } catch (error) {
      showNotification("Error registering sponsor. Please try again.");
      console.error("Error:", error);
    }
  };

  const handleExcelImport = async (data: any[]) => {
    try {
      // Process each record in the Excel data
      const results = await Promise.allSettled(
        data.map((record) =>
          fetch("/api/children", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(record),
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      showNotification(
        `Import completed: ${successful} successful, ${failed} failed`
      );
    } catch (error) {
      showNotification("Error importing data. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <MobileNavigation />

        {/* Notification */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            {notification}
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/children" element={<ChildrenList />} />
              <Route path="/sponsors" element={<SponsorsList />} />
              <Route
                path="/register-child"
                element={
                  <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                      Register New Child
                    </h1>
                    <ChildForm onSubmit={handleChildSubmit} />
                  </div>
                }
              />
              <Route
                path="/register-sponsor"
                element={
                  <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                      Register New Sponsor
                    </h1>
                    <SponsorForm onSubmit={handleSponsorSubmit} />
                  </div>
                }
              />
              <Route
                path="/import"
                element={
                  <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                      Import Children from Excel
                    </h1>
                    <ExcelImport onImport={handleExcelImport} />
                  </div>
                }
              />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p>&copy; 2025 Children Sponsorship Management System</p>
              <p className="text-gray-400 text-sm mt-2">
                Helping connect sponsors with children in need
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
