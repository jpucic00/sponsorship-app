// File: frontend/src/App.tsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Navigation } from "./components/Navigation";
import { NotificationToast } from "./components/NotificationToast";
import { AppFooter } from "./components/AppFooter";
import { ChildForm } from "./components/ChildForm";
import { SponsorForm } from "./components/SponsorForm";
import { ExcelImport } from "./components/ExcelImport";
import { Dashboard } from "./components/Dashboard";
import { ChildrenContainer } from "./components/ChildrenContainer";
import { SponsorsContainer } from "./components/SponsorsContainer";

interface Proxy {
  id: number;
  fullName: string;
  role: string;
  contact: string;
  email?: string;
  phone?: string;
  description?: string;
}

// Protected app content - only rendered when authenticated
function ProtectedApp() {
  const { user } = useAuth();
  const [notification, setNotification] = useState<string | null>(null);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [proxiesLoading, setProxiesLoading] = useState(true);

  // Fetch proxies data only when authenticated
  useEffect(() => {
    if (!user) {
      setProxiesLoading(false);
      return;
    }

    const fetchProxies = async () => {
      try {
        const response = await fetch("/api/proxies", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();

          // Handle different API response structures
          const proxiesArray = Array.isArray(data)
            ? data
            : data.data && Array.isArray(data.data)
            ? data.data
            : [];

          setProxies(proxiesArray);
          console.log("App.tsx - Loaded proxies:", proxiesArray.length);
        } else {
          console.error("Failed to fetch proxies:", response.statusText);
          setProxies([]);
        }
      } catch (error) {
        console.error("Error fetching proxies:", error);
        setProxies([]);
      } finally {
        setProxiesLoading(false);
      }
    };

    fetchProxies();
  }, [user]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleChildSubmit = async (childData: any) => {
    try {
      console.log("Submitting child data:", childData);

      const response = await fetch("/api/children", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(childData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Child registration result:", result);

        const sponsorStatus = result.isSponsored
          ? " with sponsor assigned"
          : " (no sponsor assigned)";
        showNotification(`Child registered successfully${sponsorStatus}! 🎉`);
        return Promise.resolve();
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Server error:", errorData);
        throw new Error(errorData.error || "Failed to register child");
      }
    } catch (error) {
      console.error("Error registering child:", error);
      showNotification(
        `Error registering child: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  };

  const handleSponsorSubmit = async (sponsorData: any) => {
    try {
      console.log("Submitting sponsor data:", sponsorData);

      // Handle new proxy creation if included
      let finalSponsorData = { ...sponsorData };

      if (sponsorData.newProxy) {
        try {
          const proxyResponse = await fetch("/api/proxies", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(sponsorData.newProxy),
          });

          if (proxyResponse.ok) {
            const newProxy = await proxyResponse.json();
            finalSponsorData.proxyId = newProxy.id;

            // Update local proxies state
            setProxies((prev) => [...prev, newProxy]);

            // Remove the newProxy object from sponsor data
            delete finalSponsorData.newProxy;

            console.log("New proxy created:", newProxy);
          } else {
            const proxyError = await proxyResponse.json();
            throw new Error(proxyError.error || "Failed to create proxy");
          }
        } catch (proxyError) {
          console.error("Error creating proxy:", proxyError);
          showNotification(
            `Error creating proxy: ${
              proxyError instanceof Error ? proxyError.message : "Unknown error"
            }`
          );
          throw proxyError;
        }
      }

      const response = await fetch("/api/sponsors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(finalSponsorData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Sponsor registration result:", result);
        showNotification("Sponsor registered successfully! 🎉");
        return Promise.resolve();
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Server error:", errorData);
        throw new Error(errorData.error || "Failed to register sponsor");
      }
    } catch (error) {
      console.error("Error registering sponsor:", error);
      showNotification(
        `Error registering sponsor: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  };

  const handleExcelImport = async (data: any[]) => {
    try {
      let successful = 0;
      let failed = 0;

      for (const row of data) {
        try {
          const response = await fetch("/api/children", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(row),
          });

          if (response.ok) {
            successful++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }

      showNotification(
        `Import completed! ✨ ${successful} successful, ${failed} failed`
      );
    } catch (error) {
      console.error("Error importing data:", error);
      showNotification("Error importing data. Please try again.");
    }
  };

  return (
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
            element={
              proxiesLoading ? (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
                    <p className="text-gray-600 font-medium">
                      Loading form data...
                    </p>
                  </div>
                </div>
              ) : (
                <SponsorForm onSubmit={handleSponsorSubmit} proxies={proxies} />
              )
            }
          />
          <Route
            path="/import"
            element={
              <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
                <div className="max-w-4xl mx-auto px-4">
                  <ExcelImport onImport={handleExcelImport} />
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      <AppFooter />
    </div>
  );
}

// Main App wrapper - sets up routing and auth provider
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <ProtectedApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
