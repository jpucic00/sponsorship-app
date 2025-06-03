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
import { ChildrenContainer } from "./components/ChildrenContainer";
import { SponsorsContainer } from "./components/SponsorsContainer";
import {
  LayoutDashboard,
  Users,
  Heart,
  Plus,
  UserPlus,
  FileUp,
  Menu,
  X,
  CheckCircle,
} from "lucide-react";

// Navigation Component
const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/children", label: "Children", icon: Users },
    { path: "/sponsors", label: "Sponsors", icon: Heart },
    { path: "/register-child", label: "Add Child", icon: Plus },
    { path: "/register-sponsor", label: "Add Sponsor", icon: UserPlus },
    { path: "/import", label: "Import Excel", icon: FileUp },
  ];

  return (
    <nav className="relative">
      {/* Desktop Navigation */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center py-4">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Heart className="text-white" size={24} />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    Children Sponsorship
                  </div>
                  <div className="text-xs text-blue-100">Management System</div>
                </div>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                          : "text-blue-100 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors duration-200"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-blue-700/95 backdrop-blur-sm border-t border-blue-500/50 shadow-2xl z-50">
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Notification Component
const NotificationToast = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => {
  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-white/90 backdrop-blur-sm border border-green-200 rounded-2xl shadow-2xl p-4 max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="text-white" size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={18} />
          </button>
        </div>
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
        showNotification("Child registered successfully! 🎉");
        // The form will reset itself after this resolves
        return Promise.resolve();
      } else {
        throw new Error("Failed to register child");
      }
    } catch (error) {
      showNotification("Error registering child. Please try again.");
      console.error("Error:", error);
      // Re-throw the error so the form doesn't reset
      throw error;
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
        showNotification("Sponsor registered successfully! 🤝");
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
        `Import completed! ✨ ${successful} successful, ${failed} failed`
      );
    } catch (error) {
      showNotification("Error importing data. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navigation />

        {/* Notification */}
        {notification && (
          <NotificationToast
            message={notification}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/children" element={<ChildrenContainer />} />
            <Route path="/sponsors" element={<SponsorsContainer />} />
            <Route
              path="/register-child"
              element={<ChildForm onSubmit={handleChildSubmit} />}
            />
            <Route
              path="/register-sponsor"
              element={<SponsorForm onSubmit={handleSponsorSubmit} />}
            />
            <Route
              path="/import"
              element={
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
                  <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-8">
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        Import from Excel
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Bulk import children data from spreadsheet
                      </p>
                    </div>
                    <ExcelImport onImport={handleExcelImport} />
                  </div>
                </div>
              }
            />
          </Routes>
        </main>

        {/* Footer */}
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
                Connecting caring sponsors with children in need, one
                relationship at a time. Building brighter futures through
                education and support.
              </p>

              <div className="border-t border-gray-700 pt-6">
                <p className="text-gray-400">
                  &copy; 2025 Children Sponsorship Management System. Made with
                  ❤️ for children in need.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
