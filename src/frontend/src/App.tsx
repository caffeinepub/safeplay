import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AlertBanner from "./components/AlertBanner";
import Header from "./components/Header";
import IncidentModal from "./components/IncidentModal";
import { useActiveIncidents, useWeatherData } from "./hooks/useQueries";
import ChecklistPage from "./pages/ChecklistPage";
import CredentialsPage from "./pages/CredentialsPage";
import Dashboard from "./pages/Dashboard";
import EnvironmentPage from "./pages/EnvironmentPage";
import FieldStatusPage from "./pages/FieldStatusPage";
import IncidentsPage from "./pages/IncidentsPage";
import PitchCountPage from "./pages/PitchCountPage";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);

  const { data: weather } = useWeatherData();
  const { data: incidents } = useActiveIncidents();

  const incidentCount = incidents?.length ?? 0;

  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            onReportIncident={() => setIncidentModalOpen(true)}
            onNavigate={setActiveTab}
          />
        );
      case "fields":
        return <FieldStatusPage />;
      case "checklist":
        return <ChecklistPage />;
      case "incidents":
        return <IncidentsPage onReport={() => setIncidentModalOpen(true)} />;
      case "credentials":
        return <CredentialsPage />;
      case "pitchcount":
        return <PitchCountPage />;
      case "environment":
        return <EnvironmentPage />;
      default:
        return (
          <Dashboard
            onReportIncident={() => setIncidentModalOpen(true)}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        incidentCount={incidentCount}
      />

      {/* Alert banner sits below fixed header */}
      <div className="pt-16">
        <AlertBanner weather={weather} />
      </div>

      <main className="px-6 py-6 max-w-7xl mx-auto">{renderPage()}</main>

      <footer className="mt-auto py-6 border-t border-border">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} SafePlay · Westlake Youth Baseball League
          ·{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
      </footer>

      <IncidentModal
        open={incidentModalOpen}
        onClose={() => setIncidentModalOpen(false)}
      />

      <Toaster richColors />
    </div>
  );
}
