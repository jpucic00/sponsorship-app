import { useState } from "react";
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
      console.log("Submitting child data:", childData);

      const response = await fetch("/api/children", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      const response = await fetch("/api/sponsors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sponsorData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Sponsor registration result:", result);
        showNotification("Sponsor registered successfully! 🤝");
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
    }
  };

  const handleExcelImport = async (data: any[]) => {
    try {
      console.log("Importing Excel data:", data.length, "records");

      const results = await Promise.allSettled(
        data.map(async (record, index) => {
          try {
            const response = await fetch("/api/children", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(record),
            });

            if (!response.ok) {
              const errorData = await response
                .json()
                .catch(() => ({ error: "Unknown error" }));
              throw new Error(
                `Row ${index + 1}: ${errorData.error || "Failed to import"}`
              );
            }

            return await response.json();
          } catch (error) {
            console.error(`Error importing row ${index + 1}:`, error);
            throw error;
          }
        })
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      console.log("Import results:", { successful, failed });

      if (failed > 0) {
        console.error(
          "Failed imports:",
          results.filter((r) => r.status === "rejected").map((r) => r.reason)
        );
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
