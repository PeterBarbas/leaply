"use client";

import { useSearchParams } from "next/navigation";
import { useAdminAuth } from "@/lib/adminAuthClient";
import AdminLayout from "./admin/AdminLayout";
import SimulationManagementTab from "./admin/SimulationManagementTab";
import UserManagementTab from "./admin/UserManagementTab";
import ActivityMonitorTab from "./admin/ActivityMonitorTab";
import AdminSettingsTab from "./admin/AdminSettingsTab";
import ExperimentAnalyticsTab from "./admin/ExperimentAnalyticsTab";

export default function AdminClient() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "simulations";
  const { isAuthenticated, loading } = useAdminAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen in hook)
  if (!isAuthenticated) {
    return null;
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case "simulations":
        return <SimulationManagementTab />;
      case "users":
        return <UserManagementTab />;
      case "activity":
        return <ActivityMonitorTab />;
      case "experiment":
        return <ExperimentAnalyticsTab />;
      case "settings":
        return <AdminSettingsTab />;
      default:
        return <SimulationManagementTab />;
    }
  };

  return (
    <AdminLayout>
      {renderTabContent()}
    </AdminLayout>
  );
}
