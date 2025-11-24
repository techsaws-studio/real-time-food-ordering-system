import React from "react";

import DashboardPageHeader from "@/components/partials/dashboard-page-header";

function TablesManagementPage() {
  return (
    <main className="bg-white w-full h-full">
      <section className="dashboard-layout-standard section-padding-standard flex flex-col gap-8">
        <DashboardPageHeader title="Tables Management" />
      </section>
    </main>
  );
}

export default TablesManagementPage;
