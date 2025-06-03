import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { NotificationToast } from "./components/NotificationToast";
import { AppFooter } from "./components/AppFooter";
import { ChildForm } from "./components/ChildForm";
import { SponsorForm } from "./components/SponsorForm";
import { ExcelImport } from "./components/ExcelImport";
import { Dashboard } from "./components/Dashboard";
import { ChildrenContainer } from "./components/ChildrenContainer";
import { SponsorsContainer } from "./components/SponsorsContainer";

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
        return Promise.resolve();
      } else {
        throw new Error("Failed to register child");
      }
    } catch (error) {
      showNotification("Error registering child. Please try again.");
      console.error("Error:", error);
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

        <AppFooter />
      </div>
    </Router>
  );
}

export default App;
